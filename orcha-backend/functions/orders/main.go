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
	frontendURL   string
	sesClient     *ses.Client
)

func init() {
	ordersTable = os.Getenv("ORDERS_TABLE")
	cartTable = os.Getenv("CART_TABLE")
	productsTable = os.Getenv("PRODUCTS_TABLE")
	adminEmail = os.Getenv("ADMIN_EMAIL")
	frontendURL = os.Getenv("FRONTEND_URL")

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
	case method == "GET" && strings.HasPrefix(path, "/orders/") && !strings.Contains(path, "admin") && !strings.Contains(path, "confirm") && !strings.Contains(path, "cancel"):
		id := request.PathParameters["id"]
		return getOrder(ctx, id, request)

	// POST /orders/{id}/confirm-payment - Confirm PayOS payment
	case method == "POST" && strings.HasPrefix(path, "/orders/") && strings.HasSuffix(path, "/confirm-payment"):
		id := request.PathParameters["id"]
		return confirmPayment(ctx, id, request)

	// POST /orders/{id}/cancel - Cancel order (user or payment failure)
	case method == "POST" && strings.HasPrefix(path, "/orders/") && strings.HasSuffix(path, "/cancel"):
		id := request.PathParameters["id"]
		return cancelOrder(ctx, id, request)

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

	// Validate payment method
	if input.PaymentMethod == "" {
		input.PaymentMethod = models.PaymentCOD // Default to COD
	}
	if input.PaymentMethod != models.PaymentCOD && input.PaymentMethod != models.PaymentPayOS {
		return response.Error(400, "Phương thức thanh toán không hợp lệ"), nil
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
		PaymentMethod: input.PaymentMethod,
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
	if err := sendOrderNotification(ctx, order); err != nil {
		fmt.Printf("sendOrderNotification error: %v\n", err)
	}

	return response.Success(201, order), nil
}

func sendOrderNotification(ctx context.Context, order models.Order) error {
	if adminEmail == "" {
		return nil
	}

	subject := fmt.Sprintf("[ORCHA] Don hang moi #%s - %s", order.OrderId[:8], order.UserName)

	var itemsList string
	for _, item := range order.Items {
		itemsList += fmt.Sprintf("- %s\n  + So luong: %d\n  + Don gia: %.0f VND\n  + Thanh tien: %.0f VND\n",
			item.ProductName, item.Quantity, item.Price, item.Price*float64(item.Quantity))
	}

	orderURL := "(khong cau hinh FRONTEND_URL)"
	if frontendURL != "" {
		orderURL = strings.TrimRight(frontendURL, "/") + "/orders/" + order.OrderId
	}

	body := fmt.Sprintf(`ORCHA - THONG BAO DON HANG MOI

Ma don: %s
Trang thai ban dau: %s
Phuong thuc thanh toan: %s

Khach hang:
- Ten: %s
- Email: %s

Thong tin giao hang:
- Nguoi nhan: %s
- SDT: %s
- Dia chi: %s

Chi tiet san pham:
%s
Tong cong: %.0f VND
Ghi chu: %s

Thoi gian tao: %s
Link chi tiet don: %s
`, order.OrderId, order.Status, order.PaymentMethod,
		order.UserName, order.UserEmail,
		order.ShippingName, order.ShippingPhone, order.ShippingAddr,
		itemsList, order.TotalAmount, order.Note, order.CreatedAt, orderURL)

	_, err := sesClient.SendEmail(ctx, &ses.SendEmailInput{
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

	return err
}

func normalizeLegacyOrder(order *models.Order) {
	if order.PaymentMethod == "" {
		order.PaymentMethod = models.PaymentCOD
	}
	if order.RefundStatus == "" {
		order.RefundStatus = models.RefundNone
	}
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
	for i := range orders {
		normalizeLegacyOrder(&orders[i])
	}

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
	normalizeLegacyOrder(&order)

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
	for i := range orders {
		normalizeLegacyOrder(&orders[i])
	}

	return response.Success(200, orders), nil
}

func updateOrderStatus(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.UpdateOrderStatusInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	client := db.GetClient()

	// Get current order to validate status progression
	getResult, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil || getResult.Item == nil {
		return response.Error(404, "Không tìm thấy đơn hàng"), nil
	}

	var currentOrder models.Order
	attributevalue.UnmarshalMap(getResult.Item, &currentOrder)

	// Validate linear status progression (cannot go backwards)
	statusOrder := []models.OrderStatus{
		models.OrderPendingPayment,
		models.OrderPending,
		models.OrderConfirmed,
		models.OrderShipping,
		models.OrderDelivered,
	}

	// Find current and target status indices
	currentIdx := -1
	targetIdx := -1
	for i, status := range statusOrder {
		if status == currentOrder.Status {
			currentIdx = i
		}
		if status == input.Status {
			targetIdx = i
		}
	}

	// Allow CANCELLED from any status except DELIVERED
	if input.Status == models.OrderCancelled {
		if currentOrder.Status == models.OrderDelivered {
			return response.Error(400, "Không thể hủy đơn hàng đã giao"), nil
		}
	} else {
		// Validate linear progression
		if currentIdx == -1 || targetIdx == -1 {
			return response.Error(400, "Trạng thái không hợp lệ"), nil
		}
		if targetIdx <= currentIdx {
			return response.Error(400, "Không thể quay lại trạng thái trước đó"), nil
		}
		if targetIdx != currentIdx+1 {
			return response.Error(400, "Chỉ có thể cập nhật sang trạng thái tiếp theo"), nil
		}
	}

	now := time.Now().UTC().Format(time.RFC3339)

	// Build update expression
	updateExpr := "SET #status = :status, updatedAt = :updated"
	exprAttrNames := map[string]string{
		"#status": "status",
	}
	exprAttrValues := map[string]types.AttributeValue{
		":status":  &types.AttributeValueMemberS{Value: string(input.Status)},
		":updated": &types.AttributeValueMemberS{Value: now},
	}

	// Update refund status if provided
	if input.RefundStatus != "" {
		updateExpr += ", refundStatus = :refund"
		exprAttrValues[":refund"] = &types.AttributeValueMemberS{Value: string(input.RefundStatus)}
	}

	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression:          aws.String(updateExpr),
		ExpressionAttributeNames:  exprAttrNames,
		ExpressionAttributeValues: exprAttrValues,
		ReturnValues:              types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật đơn hàng"), nil
	}

	var order models.Order
	attributevalue.UnmarshalMap(result.Attributes, &order)

	return response.Success(200, order), nil
}

func confirmPayment(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)

	client := db.GetClient()

	// Get order
	getResult, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil || getResult.Item == nil {
		return response.Error(404, "Không tìm thấy đơn hàng"), nil
	}

	var order models.Order
	attributevalue.UnmarshalMap(getResult.Item, &order)

	// Only allow owner or admin
	if order.UserId != claims.Sub && !auth.IsAdmin(request) {
		return response.Error(403, "Không có quyền"), nil
	}

	// Can only confirm if status is PENDING_PAYMENT
	if order.Status != models.OrderPendingPayment {
		return response.Error(400, "Đơn hàng không trong trạng thái chờ thanh toán"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	// Update status to PENDING
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
			":status":  &types.AttributeValueMemberS{Value: string(models.OrderPending)},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi xác nhận thanh toán"), nil
	}

	attributevalue.UnmarshalMap(result.Attributes, &order)

	return response.Success(200, order), nil
}

func cancelOrder(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)

	client := db.GetClient()

	// Get order
	getResult, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil || getResult.Item == nil {
		return response.Error(404, "Không tìm thấy đơn hàng"), nil
	}

	var order models.Order
	attributevalue.UnmarshalMap(getResult.Item, &order)

	// Only allow owner or admin
	if order.UserId != claims.Sub && !auth.IsAdmin(request) {
		return response.Error(403, "Không có quyền"), nil
	}

	// Cannot cancel delivered orders
	if order.Status == models.OrderDelivered {
		return response.Error(400, "Không thể hủy đơn hàng đã giao"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	// Set refund status based on payment method and current status
	refundStatus := models.RefundNone
	if order.PaymentMethod == models.PaymentPayOS && order.Status != models.OrderPendingPayment {
		// PayOS order that was paid needs refund
		refundStatus = models.RefundPending
	}

	// Update status to CANCELLED
	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET #status = :status, refundStatus = :refund, updatedAt = :updated"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":status":  &types.AttributeValueMemberS{Value: string(models.OrderCancelled)},
			":refund":  &types.AttributeValueMemberS{Value: string(refundStatus)},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi hủy đơn hàng"), nil
	}

	attributevalue.UnmarshalMap(result.Attributes, &order)

	return response.Success(200, order), nil
}

func main() {
	lambda.Start(handler)
}
