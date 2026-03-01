package response

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

var corsHeaders = map[string]string{
	"Content-Type":                "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "Content-Type,Authorization",
	"Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
}

type Body struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func Success(statusCode int, data interface{}) events.APIGatewayProxyResponse {
	body, _ := json.Marshal(Body{
		Success: true,
		Data:    data,
	})
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers:    corsHeaders,
		Body:       string(body),
	}
}

func SuccessMessage(statusCode int, message string) events.APIGatewayProxyResponse {
	body, _ := json.Marshal(Body{
		Success: true,
		Message: message,
	})
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers:    corsHeaders,
		Body:       string(body),
	}
}

func Error(statusCode int, errMsg string) events.APIGatewayProxyResponse {
	body, _ := json.Marshal(Body{
		Success: false,
		Error:   errMsg,
	})
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers:    corsHeaders,
		Body:       string(body),
	}
}

func Options() events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers:    corsHeaders,
		Body:       "",
	}
}
