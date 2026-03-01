package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	sestypes "github.com/aws/aws-sdk-go-v2/service/ses/types"
	"github.com/google/uuid"

	"orcha-backend/pkg/auth"
	"orcha-backend/pkg/db"
	"orcha-backend/pkg/models"
	"orcha-backend/pkg/response"
)

var (
	ordersTable   string
	cartTable     string
	productsTable string
	adminEmail    string
	sesClient     *ses.Client
)

func init() {
	ordersTable = os.Getenv("ORDERS_TABLE")
	cartTable = os.Getenv("CART_TABLE")
	productsTable = os.Getenv("PRODUCTS_TABLE")
	adminEmail = os.Getenv("ADMIN_EMAIL")

	cfg, _ := config.LoadDefaultConfig(context.TODO())
	sesClient = ses.NewFromConfig(cfg)
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	// POST /orders - Create order
	case method == "POST" && path == "/orders":
		return createOrder(ctx, request)

	// GET /orders - Get user orders
	case method == "GET" && path == "/orders":
		return getUserOrders(ctx, request)

	// GET /orders/{id}
	case method == "GET" && strings.HasPrefix(path, "/orders/") && !strings.Contains(path, "admin"):
		id := request.PathParameters["id"]
		return getOrder(ctx, id, request)

	// GET /admin/orders
	case method == "GET" && path == "/admin/orders":
		if !auth.IsAdmin(request) {
			return response.Error(403, "Admin only"), nil
		}
		return getAllOrders(ctx)

	// PUT /admin/orders/{id}
	case method == "PUT" && strings.HasPrefix(path, "/admin/orders/"):
		if !auth.IsAdmin(request) {
			return response.Error(403, "Admin only"), nil
		}
		id := request.PathParameters["id"]
		return updateOrderStatus(ctx, id, request)

	default:
		return response.Error(404, "Route not found"), nil
	}
}

func createOrder(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	var input models.CreateOrderInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.ShippingName == "" || input.ShippingPhone == "" || input.ShippingAddr == "" {
		return response.Error(400, "Thiếu thông tin giao hàng"), nil
	}

	client := db.GetClient()

	// 1. Get cart items
	cartResult, err := client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(cartTable),
		KeyConditionExpression: aws.String("userId = :uid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":uid": &types.AttributeValueMemberS{Value: claims.Sub},
		},
	})
	if err != nil || len(cartResult.Items) == 0 {
		return response.Error(400, "Giỏ hàng trống"), nil
	}

	var cartItems []models.CartItem
	attributevalue.UnmarshalListOfMaps(cartResult.Items, &cartItems)

	// 2. Build order items with product info
	var orderItems []models.OrderItem
	var totalAmount float64

	for _, ci := range cartItems {
		prodResult, err := client.GetItem(ctx, &dynamodb.GetItemInput{
			TableName: aws.String(productsTable),
			Key: map[string]types.AttributeValue{
				"productId": &types.AttributeValueMemberS{Value: ci.ProductId},
			},
		})
		if err != nil || prodResult.Item == nil {
			continue
		}

		var product models.Product
		attributevalue.UnmarshalMap(prodResult.Item, &product)

		if !product.IsActive {
			continue
		}

		if ci.Quantity > product.Stock {
			return response.Error(400, fmt.Sprintf("Sản phẩm '%s' không đủ tồn kho", product.Name)), nil
		}

		price := product.Price
		if product.SalePrice > 0 {
			price = product.SalePrice
		}

		imageUrl := ""
		if len(product.Images) > 0 {
			imageUrl = product.Images[0]
		}

		orderItems = append(orderItems, models.OrderItem{
			ProductId:   ci.ProductId,
			ProductName: product.Name,
			Price:       price,
			Quantity:    ci.Quantity,
			ImageUrl:    imageUrl,
		})
		totalAmount += price * float64(ci.Quantity)
	}

	if len(orderItems) == 0 {
		return response.Error(400, "Không có sản phẩm hợp lệ trong giỏ hàng"), nil
	}

	// 3. Create order
	order := models.Order{
		OrderId:       uuid.New().String(),
		UserId:        claims.Sub,
		UserEmail:     claims.Email,
		UserName:      claims.Name,
		Items:         orderItems,
		TotalAmount:   totalAmount,
		ShippingName:  input.ShippingName,
		ShippingPhone: input.ShippingPhone,
		ShippingAddr:  input.ShippingAddr,
		Note:          input.Note,
	}
	order.SetDefaults()

	orderItemMap, _ := attributevalue.MarshalMap(order)

	now := time.Now().UTC().Format(time.RFC3339)
	transactItems := []types.TransactWriteItem{
		{
			Put: &types.Put{
				TableName:           aws.String(ordersTable),
				Item:                orderItemMap,
				ConditionExpression: aws.String("attribute_not_exists(orderId)"),
			},
		},
	}

	for _, ci := range cartItems {
		transactItems = append(transactItems,
			types.TransactWriteItem{
				Update: &types.Update{
					TableName: aws.String(productsTable),
					Key: map[string]types.AttributeValue{
						"productId": &types.AttributeValueMemberS{Value: ci.ProductId},
					},
					UpdateExpression:    aws.String("SET stock = stock - :qty, updatedAt = :updated"),
					ConditionExpression: aws.String("attribute_exists(productId) AND isActive = :active AND stock >= :qty"),
					ExpressionAttributeValues: map[string]types.AttributeValue{
						":qty":     &types.AttributeValueMemberN{Value: strconv.Itoa(ci.Quantity)},
						":active":  &types.AttributeValueMemberBOOL{Value: true},
						":updated": &types.AttributeValueMemberS{Value: now},
					},
				},
			},
			types.TransactWriteItem{
				Delete: &types.Delete{
					TableName: aws.String(cartTable),
					Key: map[string]types.AttributeValue{
						"userId":    &types.AttributeValueMemberS{Value: claims.Sub},
						"productId": &types.AttributeValueMemberS{Value: ci.ProductId},
					},
				},
			},
		)
	}

	_, err = client.TransactWriteItems(ctx, &dynamodb.TransactWriteItemsInput{
		TransactItems: transactItems,
	})
	if err != nil {
		var txErr *types.TransactionCanceledException
		if errors.As(err, &txErr) {
			return response.Error(400, "Checkout thất bại: tồn kho thay đổi hoặc dữ liệu không hợp lệ"), nil
		}
		return response.Error(500, "Lỗi khi tạo đơn hàng"), nil
	}

	// 4. Send email notification to admin via SES
	go sendOrderNotification(order)

	return response.Success(201, order), nil
}

func sendOrderNotification(order models.Order) {
	if adminEmail == "" {
		return
	}

	subject := fmt.Sprintf("🛒 Đơn hàng mới #%s", order.OrderId[:8])

	var itemsList string
	for _, item := range order.Items {
		itemsList += fmt.Sprintf("- %s x%d: %.0f VNĐ\n", item.ProductName, item.Quantity, item.Price*float64(item.Quantity))
	}

	body := fmt.Sprintf(`Đơn hàng mới từ ORCHA!

Mã đơn: %s
Khách hàng: %s (%s)
Người nhận: %s - SĐT: %s
Địa chỉ: %s

Sản phẩm:
%s
Tổng cộng: %.0f VNĐ
Ghi chú: %s

Thời gian: %s
`, order.OrderId, order.UserName, order.UserEmail,
		order.ShippingName, order.ShippingPhone, order.ShippingAddr,
		itemsList, order.TotalAmount, order.Note, order.CreatedAt)

	sesClient.SendEmail(context.TODO(), &ses.SendEmailInput{
		Source: aws.String(adminEmail),
		Destination: &sestypes.Destination{
			ToAddresses: []string{adminEmail},
		},
		Message: &sestypes.Message{
			Subject: &sestypes.Content{Data: aws.String(subject)},
			Body: &sestypes.Body{
				Text: &sestypes.Content{Data: aws.String(body)},
			},
		},
	})
}

func getUserOrders(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	client := db.GetClient()
	result, err := client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(ordersTable),
		IndexName:              aws.String("UserOrderIndex"),
		KeyConditionExpression: aws.String("userId = :uid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":uid": &types.AttributeValueMemberS{Value: claims.Sub},
		},
		ScanIndexForward: aws.Bool(false),
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy đơn hàng"), nil
	}

	var orders []models.Order
	attributevalue.UnmarshalListOfMaps(result.Items, &orders)

	return response.Success(200, orders), nil
}

func getOrder(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)

	client := db.GetClient()
	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil || result.Item == nil {
		return response.Error(404, "Không tìm thấy đơn hàng"), nil
	}

	var order models.Order
	attributevalue.UnmarshalMap(result.Item, &order)

	// Only allow owner or admin to view
	if order.UserId != claims.Sub && !auth.IsAdmin(request) {
		return response.Error(403, "Không có quyền xem đơn hàng này"), nil
	}

	return response.Success(200, order), nil
}

func getAllOrders(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()
	result, err := client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(ordersTable),
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy danh sách đơn hàng"), nil
	}

	var orders []models.Order
	attributevalue.UnmarshalListOfMaps(result.Items, &orders)

	return response.Success(200, orders), nil
}

func updateOrderStatus(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.UpdateOrderStatusInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	client := db.GetClient()
	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET #status = :status, updatedAt = :updated"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":status":  &types.AttributeValueMemberS{Value: string(input.Status)},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật đơn hàng"), nil
	}

	var order models.Order
	attributevalue.UnmarshalMap(result.Attributes, &order)

	return response.Success(200, order), nil
}

func main() {
	lambda.Start(handler)
}
