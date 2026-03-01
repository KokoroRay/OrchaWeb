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
	"github.com/google/uuid"

	"orcha-backend/pkg/db"
	"orcha-backend/pkg/models"
	"orcha-backend/pkg/response"
)

var tableName string

func init() {
	tableName = os.Getenv("PRODUCTS_TABLE")
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	// GET /products
	case method == "GET" && path == "/products":
		return listProducts(ctx)

	// GET /products/category/{category}
	case method == "GET" && strings.HasPrefix(path, "/products/category/"):
		category := request.PathParameters["category"]
		return getProductsByCategory(ctx, category)

	// GET /products/{id}
	case method == "GET" && strings.HasPrefix(path, "/products/"):
		id := request.PathParameters["id"]
		return getProduct(ctx, id)

	// POST /admin/products
	case method == "POST" && path == "/admin/products":
		return createProduct(ctx, request)

	// PUT /admin/products/{id}
	case method == "PUT" && strings.HasPrefix(path, "/admin/products/"):
		id := request.PathParameters["id"]
		return updateProduct(ctx, id, request)

	// DELETE /admin/products/{id}
	case method == "DELETE" && strings.HasPrefix(path, "/admin/products/"):
		id := request.PathParameters["id"]
		return deleteProduct(ctx, id)

	default:
		return response.Error(404, "Route not found"), nil
	}
}

func listProducts(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.Scan(ctx, &dynamodb.ScanInput{
		TableName:        aws.String(tableName),
		FilterExpression: aws.String("isActive = :active"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":active": &types.AttributeValueMemberBOOL{Value: true},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy danh sách sản phẩm"), nil
	}

	var products []models.Product
	err = attributevalue.UnmarshalListOfMaps(result.Items, &products)
	if err != nil {
		return response.Error(500, "Lỗi parse dữ liệu"), nil
	}

	return response.Success(200, products), nil
}

func getProduct(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"productId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy sản phẩm"), nil
	}
	if result.Item == nil {
		return response.Error(404, "Không tìm thấy sản phẩm"), nil
	}

	var product models.Product
	err = attributevalue.UnmarshalMap(result.Item, &product)
	if err != nil {
		return response.Error(500, "Lỗi parse dữ liệu"), nil
	}

	return response.Success(200, product), nil
}

func getProductsByCategory(ctx context.Context, category string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(tableName),
		IndexName:              aws.String("CategoryIndex"),
		KeyConditionExpression: aws.String("category = :cat"),
		FilterExpression:       aws.String("isActive = :active"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":cat":    &types.AttributeValueMemberS{Value: category},
			":active": &types.AttributeValueMemberBOOL{Value: true},
		},
		ScanIndexForward: aws.Bool(false), // newest first
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy sản phẩm theo danh mục"), nil
	}

	var products []models.Product
	err = attributevalue.UnmarshalListOfMaps(result.Items, &products)
	if err != nil {
		return response.Error(500, "Lỗi parse dữ liệu"), nil
	}

	return response.Success(200, products), nil
}

func createProduct(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.CreateProductInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.Name == "" || input.Price <= 0 || input.Category == "" {
		return response.Error(400, "Thiếu thông tin bắt buộc: name, price, category"), nil
	}

	product := models.Product{
		ProductId:   uuid.New().String(),
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		SalePrice:   input.SalePrice,
		Category:    input.Category,
		Images:      input.Images,
		Stock:       input.Stock,
		Unit:        input.Unit,
	}
	product.SetDefaults()

	item, err := attributevalue.MarshalMap(product)
	if err != nil {
		return response.Error(500, "Lỗi marshal dữ liệu"), nil
	}

	client := db.GetClient()
	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item:      item,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi tạo sản phẩm"), nil
	}

	return response.Success(201, product), nil
}

func updateProduct(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.CreateProductInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	images, _ := attributevalue.MarshalList(input.Images)

	client := db.GetClient()
	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"productId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET #name = :name, description = :desc, price = :price, salePrice = :sale, category = :cat, images = :imgs, stock = :stock, #unit = :unit, updatedAt = :updated"),
		ExpressionAttributeNames: map[string]string{
			"#name": "name",
			"#unit": "unit",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":name":    &types.AttributeValueMemberS{Value: input.Name},
			":desc":    &types.AttributeValueMemberS{Value: input.Description},
			":price":   &types.AttributeValueMemberN{Value: formatFloat(input.Price)},
			":sale":    &types.AttributeValueMemberN{Value: formatFloat(input.SalePrice)},
			":cat":     &types.AttributeValueMemberS{Value: input.Category},
			":imgs":    &types.AttributeValueMemberL{Value: images},
			":stock":   &types.AttributeValueMemberN{Value: formatInt(input.Stock)},
			":unit":    &types.AttributeValueMemberS{Value: input.Unit},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật sản phẩm"), nil
	}

	var product models.Product
	attributevalue.UnmarshalMap(result.Attributes, &product)

	return response.Success(200, product), nil
}

func deleteProduct(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	// Soft delete - set isActive to false
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"productId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET isActive = :active, updatedAt = :updated"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":active":  &types.AttributeValueMemberBOOL{Value: false},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi xóa sản phẩm"), nil
	}

	return response.SuccessMessage(200, "Đã xóa sản phẩm thành công"), nil
}

func formatFloat(f float64) string {
	return json.Number(json.Number(func() string {
		b, _ := json.Marshal(f)
		return string(b)
	}())).String()
}

func formatInt(i int) string {
	return json.Number(func() string {
		b, _ := json.Marshal(i)
		return string(b)
	}()).String()
}

func main() {
	lambda.Start(handler)
}
