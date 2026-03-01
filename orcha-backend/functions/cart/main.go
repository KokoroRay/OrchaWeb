package main

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"

	"orcha-backend/pkg/auth"
	"orcha-backend/pkg/db"
	"orcha-backend/pkg/models"
	"orcha-backend/pkg/response"
)

var (
	cartTable     string
	productsTable string
)

func init() {
	cartTable = os.Getenv("CART_TABLE")
	productsTable = os.Getenv("PRODUCTS_TABLE")
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	case method == "POST" && path == "/cart":
		return addToCart(ctx, claims.Sub, request)

	case method == "GET" && path == "/cart":
		return getCart(ctx, claims.Sub)

	case method == "PUT" && path == "/cart":
		return updateCartItem(ctx, claims.Sub, request)

	case method == "DELETE" && strings.HasPrefix(path, "/cart/"):
		productId := request.PathParameters["productId"]
		return removeFromCart(ctx, claims.Sub, productId)

	default:
		return response.Error(404, "Route not found"), nil
	}
}

func addToCart(ctx context.Context, userId string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.AddToCartInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.ProductId == "" || input.Quantity <= 0 {
		return response.Error(400, "ProductId và quantity phải hợp lệ"), nil
	}

	// Check product exists
	client := db.GetClient()
	prodResult, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(productsTable),
		Key: map[string]types.AttributeValue{
			"productId": &types.AttributeValueMemberS{Value: input.ProductId},
		},
	})
	if err != nil || prodResult.Item == nil {
		return response.Error(404, "Sản phẩm không tồn tại"), nil
	}

	cartItem := models.CartItem{
		UserId:    userId,
		ProductId: input.ProductId,
		Quantity:  input.Quantity,
		AddedAt:   time.Now().UTC().Format(time.RFC3339),
	}

	item, _ := attributevalue.MarshalMap(cartItem)
	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(cartTable),
		Item:      item,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi thêm vào giỏ hàng"), nil
	}

	return response.Success(201, cartItem), nil
}

func getCart(ctx context.Context, userId string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(cartTable),
		KeyConditionExpression: aws.String("userId = :uid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":uid": &types.AttributeValueMemberS{Value: userId},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy giỏ hàng"), nil
	}

	var cartItems []models.CartItem
	attributevalue.UnmarshalListOfMaps(result.Items, &cartItems)

	// Enrich with product details
	var enriched []models.CartItemWithProduct
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

		imageUrl := ""
		if len(product.Images) > 0 {
			imageUrl = product.Images[0]
		}

		enriched = append(enriched, models.CartItemWithProduct{
			CartItem:    ci,
			ProductName: product.Name,
			Price:       product.Price,
			SalePrice:   product.SalePrice,
			ImageUrl:    imageUrl,
			Stock:       product.Stock,
		})
	}

	return response.Success(200, enriched), nil
}

func updateCartItem(ctx context.Context, userId string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.UpdateCartInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.Quantity <= 0 {
		return removeFromCart(ctx, userId, input.ProductId)
	}

	client := db.GetClient()
	_, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(cartTable),
		Key: map[string]types.AttributeValue{
			"userId":    &types.AttributeValueMemberS{Value: userId},
			"productId": &types.AttributeValueMemberS{Value: input.ProductId},
		},
		UpdateExpression: aws.String("SET quantity = :qty"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":qty": &types.AttributeValueMemberN{Value: json.Number(func() string { b, _ := json.Marshal(input.Quantity); return string(b) }()).String()},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật giỏ hàng"), nil
	}

	return response.SuccessMessage(200, "Đã cập nhật giỏ hàng"), nil
}

func removeFromCart(ctx context.Context, userId string, productId string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	_, err := client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(cartTable),
		Key: map[string]types.AttributeValue{
			"userId":    &types.AttributeValueMemberS{Value: userId},
			"productId": &types.AttributeValueMemberS{Value: productId},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi xóa khỏi giỏ hàng"), nil
	}

	return response.SuccessMessage(200, "Đã xóa khỏi giỏ hàng"), nil
}

func main() {
	lambda.Start(handler)
}
