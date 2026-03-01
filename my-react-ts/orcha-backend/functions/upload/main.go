package main

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"orcha-backend/pkg/response"
)

type UploadResponse struct {
	Url       string `json:"url"`
	PublicId  string `json:"publicId"`
	SecureUrl string `json:"secureUrl"`
}

type CloudinaryResponse struct {
	SecureUrl string `json:"secure_url"`
	PublicId  string `json:"public_id"`
	Url       string `json:"url"`
}

type UploadInput struct {
	Image    string `json:"image"`    // Base64 encoded image
	FileName string `json:"fileName"` // Optional original filename
	Folder   string `json:"folder"`   // Optional cloudinary folder
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	if request.HTTPMethod != "POST" {
		return response.Error(405, "Method not allowed"), nil
	}

	var input UploadInput
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu không hợp lệ"), nil
	}

	if input.Image == "" {
		return response.Error(400, "Thiếu dữ liệu ảnh (base64)"), nil
	}

	if input.Folder == "" {
		input.Folder = "orcha-products"
	}

	if input.FileName == "" {
		input.FileName = "image.jpg"
	}

	// Parse Cloudinary URL
	cloudinaryUrl := os.Getenv("CLOUDINARY_URL")
	apiKey, apiSecret, cloudName, err := parseCloudinaryUrl(cloudinaryUrl)
	if err != nil {
		return response.Error(500, "Cloudinary chưa được cấu hình đúng"), nil
	}

	// Decode base64 image
	imageStr := input.Image
	// Strip data URL prefix if present (e.g., "data:image/png;base64,...")
	if idx := strings.Index(imageStr, ","); idx != -1 {
		imageStr = imageStr[idx+1:]
	}

	imageData, err := base64.StdEncoding.DecodeString(imageStr)
	if err != nil {
		return response.Error(400, "Ảnh base64 không hợp lệ"), nil
	}

	// Upload to Cloudinary via REST API
	uploadUrl := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", cloudName)
	timestamp := fmt.Sprintf("%d", time.Now().Unix())

	// Create signature: folder=xxx&timestamp=xxx + apiSecret
	signStr := fmt.Sprintf("folder=%s&timestamp=%s%s", input.Folder, timestamp, apiSecret)
	h := sha1.New()
	h.Write([]byte(signStr))
	signature := fmt.Sprintf("%x", h.Sum(nil))

	// Build multipart form
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	writer.WriteField("api_key", apiKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("folder", input.Folder)
	writer.WriteField("signature", signature)

	part, _ := writer.CreateFormFile("file", input.FileName)
	part.Write(imageData)
	writer.Close()

	req, _ := http.NewRequest("POST", uploadUrl, &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(500, "Lỗi khi upload ảnh lên Cloudinary"), nil
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return response.Error(500, fmt.Sprintf("Cloudinary error: %s", string(respBody))), nil
	}

	var cloudResp CloudinaryResponse
	json.Unmarshal(respBody, &cloudResp)

	return response.Success(200, UploadResponse{
		Url:       cloudResp.Url,
		PublicId:  cloudResp.PublicId,
		SecureUrl: cloudResp.SecureUrl,
	}), nil
}

func parseCloudinaryUrl(url string) (apiKey, apiSecret, cloudName string, err error) {
	// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
	url = strings.TrimPrefix(url, "cloudinary://")
	parts := strings.SplitN(url, "@", 2)
	if len(parts) != 2 {
		return "", "", "", fmt.Errorf("invalid cloudinary URL format")
	}
	cloudName = parts[1]

	creds := strings.SplitN(parts[0], ":", 2)
	if len(creds) != 2 {
		return "", "", "", fmt.Errorf("invalid cloudinary credentials")
	}
	apiKey = creds[0]
	apiSecret = creds[1]

	return apiKey, apiSecret, cloudName, nil
}

func main() {
	lambda.Start(handler)
}
