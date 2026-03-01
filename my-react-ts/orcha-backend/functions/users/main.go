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

var tableName string

func init() {
	tableName = os.Getenv("USERS_TABLE")
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	// GET /users/profile
	case method == "GET" && path == "/users/profile":
		return getProfile(ctx, request)

	// PUT /users/profile
	case method == "PUT" && path == "/users/profile":
		return updateProfile(ctx, request)

	// GET /admin/users
	case method == "GET" && path == "/admin/users":
		return getAllUsers(ctx)

	// PUT /admin/users/{id}
	case method == "PUT" && strings.HasPrefix(path, "/admin/users/"):
		id := request.PathParameters["id"]
		return adminUpdateUser(ctx, id, request)

	default:
		return response.Error(404, "Route not found"), nil
	}
}

func getProfile(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	client := db.GetClient()
	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"userId": &types.AttributeValueMemberS{Value: claims.Sub},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy thông tin"), nil
	}

	// If user doesn't exist in DynamoDB yet, create them from Cognito claims
	if result.Item == nil {
		user := models.User{
			UserId: claims.Sub,
			Email:  claims.Email,
			Name:   claims.Name,
		}
		user.SetDefaults()

		item, _ := attributevalue.MarshalMap(user)
		client.PutItem(ctx, &dynamodb.PutItemInput{
			TableName: aws.String(tableName),
			Item:      item,
		})
		return response.Success(200, user), nil
	}

	var user models.User
	attributevalue.UnmarshalMap(result.Item, &user)

	return response.Success(200, user), nil
}

func updateProfile(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	var input models.UpdateProfileInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	client := db.GetClient()
	result, err := client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"userId": &types.AttributeValueMemberS{Value: claims.Sub},
		},
		UpdateExpression: aws.String("SET #name = :name, phone = :phone, address = :addr, updatedAt = :updated"),
		ExpressionAttributeNames: map[string]string{
			"#name": "name",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":name":    &types.AttributeValueMemberS{Value: input.Name},
			":phone":   &types.AttributeValueMemberS{Value: input.Phone},
			":addr":    &types.AttributeValueMemberS{Value: input.Address},
			":updated": &types.AttributeValueMemberS{Value: now},
		},
		ReturnValues: types.ReturnValueAllNew,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật thông tin"), nil
	}

	var user models.User
	attributevalue.UnmarshalMap(result.Attributes, &user)

	return response.Success(200, user), nil
}

func getAllUsers(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()
	result, err := client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(tableName),
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy danh sách người dùng"), nil
	}

	var users []models.User
	attributevalue.UnmarshalListOfMaps(result.Items, &users)

	return response.Success(200, users), nil
}

func adminUpdateUser(ctx context.Context, id string, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var input models.AdminUpdateUserInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	now := time.Now().UTC().Format(time.RFC3339)

	updateExpr := "SET updatedAt = :updated"
	exprValues := map[string]types.AttributeValue{
		":updated": &types.AttributeValueMemberS{Value: now},
	}
	exprNames := map[string]string{}

	if input.Role != "" {
		updateExpr += ", #role = :role"
		exprNames["#role"] = "role"
		exprValues[":role"] = &types.AttributeValueMemberS{Value: string(input.Role)}
	}

	if input.IsActive != nil {
		updateExpr += ", isActive = :active"
		exprValues[":active"] = &types.AttributeValueMemberBOOL{Value: *input.IsActive}
	}

	client := db.GetClient()
	updateInput := &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"userId": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression:          aws.String(updateExpr),
		ExpressionAttributeValues: exprValues,
		ReturnValues:              types.ReturnValueAllNew,
	}
	if len(exprNames) > 0 {
		updateInput.ExpressionAttributeNames = exprNames
	}

	result, err := client.UpdateItem(ctx, updateInput)
	if err != nil {
		return response.Error(500, "Lỗi khi cập nhật người dùng"), nil
	}

	var user models.User
	attributevalue.UnmarshalMap(result.Attributes, &user)

	return response.Success(200, user), nil
}

func main() {
	lambda.Start(handler)
}
