package main

import (
	"context"
	"encoding/json"
	"os"
	"strings"

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
	tableName = os.Getenv("FEEDBACK_TABLE")
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	// GET /feedback/product/{productId} - public
	case method == "GET" && strings.HasPrefix(path, "/feedback/product/"):
		productId := request.PathParameters["productId"]
		return getProductFeedback(ctx, productId)

	// POST /feedback - auth required
	case method == "POST" && path == "/feedback":
		return createFeedback(ctx, request)

	// GET /admin/feedback
	case method == "GET" && path == "/admin/feedback":
		return getAllFeedback(ctx)

	// DELETE /admin/feedback/{id}
	case method == "DELETE" && strings.HasPrefix(path, "/admin/feedback/"):
		id := request.PathParameters["id"]
		return deleteFeedback(ctx, id)

	default:
		return response.Error(404, "Route not found"), nil
	}
}

func getProductFeedback(ctx context.Context, productId string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	result, err := client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(tableName),
		IndexName:              aws.String("ProductFeedbackIndex"),
		KeyConditionExpression: aws.String("productId = :pid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pid": &types.AttributeValueMemberS{Value: productId},
		},
		ScanIndexForward: aws.Bool(false),
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy đánh giá"), nil
	}

	var feedbacks []models.Feedback
	attributevalue.UnmarshalListOfMaps(result.Items, &feedbacks)

	return response.Success(200, feedbacks), nil
}

func createFeedback(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	var input models.CreateFeedbackInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.ProductId == "" || input.Rating < 1 || input.Rating > 5 {
		return response.Error(400, "ProductId và rating (1-5) là bắt buộc"), nil
	}

	feedback := models.Feedback{
		FeedbackId: uuid.New().String(),
		ProductId:  input.ProductId,
		UserId:     claims.Sub,
		UserName:   claims.Name,
		Rating:     input.Rating,
		Comment:    input.Comment,
	}
	feedback.SetDefaults()

	item, _ := attributevalue.MarshalMap(feedback)
	client := db.GetClient()
	_, err := client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item:      item,
	})
	if err != nil {
		return response.Error(500, "Lỗi khi tạo đánh giá"), nil
	}

	return response.Success(201, feedback), nil
}

func getAllFeedback(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()
	result, err := client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(tableName),
	})
	if err != nil {
		return response.Error(500, "Lỗi khi lấy danh sách đánh giá"), nil
	}

	var feedbacks []models.Feedback
	attributevalue.UnmarshalListOfMaps(result.Items, &feedbacks)

	return response.Success(200, feedbacks), nil
}

func deleteFeedback(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	client := db.GetClient()

	_, err := client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"feedbackId": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		return response.Error(500, "Lỗi khi xóa đánh giá"), nil
	}

	return response.SuccessMessage(200, "Đã xóa đánh giá"), nil
}

func main() {
	lambda.Start(handler)
}
