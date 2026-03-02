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

	"orcha-backend/pkg/auth"
	"orcha-backend/pkg/db"
	"orcha-backend/pkg/models"
	"orcha-backend/pkg/response"
)

var tableName string

func init() {
	tableName = os.Getenv("CATEGORIES_TABLE")
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	// GET /categories
	case method == "GET" && path == "/categories":
		return listCategories(ctx)

	// GET /categories/{id}
	case method == "GET" && strings.HasPrefix(path, "/categories/"):
		id := request.PathParameters["id"]
		return getCategory(ctx, id)

	// POST /admin/categories
	case method == "POST" && path == "/admin/categories":
		if !auth.IsAdmin(request) {
			return response.Error(403, "Admin only"), nil
		}
		return createCategory(ctx, request)

	// PUT /admin/categories/{id}
	case method == "PUT" && strings.HasPrefix(path, "/admin/categories/"):
		if !auth.IsAdmin(request) {
			return response.Error(403, "Admin only"), nil
		}
		id := request.PathParameters["id"]
		return updateCategory(ctx, id, request)

	// DELETE /admin/categories/{id}
	case method == "DELETE" && strings.HasPrefix(path, "/admin/categories/"):
		if !auth.IsAdmin(request) {
			return response.Error(403, "Admin only"), nil
		}
		id := request.PathParameters["id"]
		return deleteCategory(ctx, id)

	default:
		return response.Error(404, "Route not found"), nil
	}
}

func listCategories(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.Scan(ctx, &dynamodb.ScanInput{
		TableName:        aws.String(tableName),
		FilterExpression: aws.String("isActive = :active"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":active": &types.AttributeValueMemberBOOL{Value: true},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy danh sách danh mục"), nil
	}

	var categories []models.Category
	err = attributevalue.UnmarshalListOfMaps(result.Items, &categories)
	if err != nil {
		return response.Error(500, "Lỗi parse dữ liệu"), nil
	}

	if categories == nil {
		categories = []models.Category{}
	}

	return response.Success(200, categories), nil
}

func getCategory(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"categoryId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy danh mục"), nil
	}
	if result.Item == nil {
		return response.Error(404, "Không tìm thấy danh mục"), nil
	}

	var category models.Category
	err = attributevalue.UnmarshalMap(result.Item, &category)
	if err != nil {
		return response.Error(500, "Lỗi parse dữ liệu"), nil
	}

	return response.Success(200, category), nil
}

func createCategory(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.CreateCategoryInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.Name == "" || input.NameEn == "" || input.Icon == "" {
		return response.Error(400, "Thiếu thông tin bắt buộc: name, nameEn, icon"), nil
	}

	category := models.Category{
		CategoryId:  uuid.New().String(),
		Name:        input.Name,
		NameEn:      input.NameEn,
		Icon:        input.Icon,
		Description: input.Description,
	}
	category.SetDefaults()

	item, err := attributevalue.MarshalMap(category)
	if err != nil {
		return response.Error(500, "Lỗi marshal dữ liệu"), nil
	}

	client := db.GetClient()
	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item:      item,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi tạo danh mục"), nil
	}

	return response.Success(201, category), nil
}

func updateCategory(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.UpdateCategoryInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	updateExpr := "SET updatedAt = :updated"
	exprVals := map[string]types.AttributeValue{
		":updated": &types.AttributeValueMemberS{Value: now},
	}

	if input.Name != nil {
		updateExpr += ", #name = :name"
		exprVals[":name"] = &types.AttributeValueMemberS{Value: *input.Name}
	}
	if input.NameEn != nil {
		updateExpr += ", nameEn = :nameEn"
		exprVals[":nameEn"] = &types.AttributeValueMemberS{Value: *input.NameEn}
	}
	if input.Icon != nil {
		updateExpr += ", icon = :icon"
		exprVals[":icon"] = &types.AttributeValueMemberS{Value: *input.Icon}
	}
	if input.Description != nil {
		updateExpr += ", description = :desc"
		exprVals[":desc"] = &types.AttributeValueMemberS{Value: *input.Description}
	}

	exprNames := map[string]string{}
	if input.Name != nil {
		exprNames["#name"] = "name"
	}

	client := db.GetClient()
	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"categoryId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression:          aws.String(updateExpr),
		ExpressionAttributeValues: exprVals,
		ExpressionAttributeNames:  exprNames,
		ReturnValues:              types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật danh mục"), nil
	}

	var category models.Category
	attributevalue.UnmarshalMap(result.Attributes, &category)

	return response.Success(200, category), nil
}

func deleteCategory(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	// Soft delete - set isActive to false
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"categoryId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression: aws.String("SET isActive = :active, updatedAt = :updated"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":active":  &types.AttributeValueMemberBOOL{Value: false},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi xóa danh mục"), nil
	}

	return response.SuccessMessage(200, "Đã xóa danh mục thành công"), nil
}

func main() {
	lambda.Start(handler)
}
