package main

import (
	"context"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"math"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	payos "github.com/payOSHQ/payos-lib-golang"

	"orcha-backend/pkg/auth"
	"orcha-backend/pkg/db"
	"orcha-backend/pkg/models"
	"orcha-backend/pkg/response"
)

var (
	ordersTable       string
	payosClientID     string
	payosAPIKey       string
	payosChecksumKey  string
	payosPartnerCode  string
	payosInitialized  bool
	payosInitErrorMsg string
)

type createPayOSRequest struct {
	OrderID      string `json:"orderId"`
	Amount       int    `json:"amount"`
	Description  string `json:"description"`
	ReturnURL    string `json:"returnUrl"`
	CancelURL    string `json:"cancelUrl"`
	BuyerName    string `json:"buyerName"`
	BuyerEmail   string `json:"buyerEmail"`
	BuyerPhone   string `json:"buyerPhone"`
	BuyerAddress string `json:"buyerAddress"`
}

func init() {
	ordersTable = os.Getenv("ORDERS_TABLE")
	payosClientID = strings.TrimSpace(os.Getenv("PAYOS_CLIENT_ID"))
	payosAPIKey = strings.TrimSpace(os.Getenv("PAYOS_API_KEY"))
	payosChecksumKey = strings.TrimSpace(os.Getenv("PAYOS_CHECKSUM_KEY"))
	payosPartnerCode = strings.TrimSpace(os.Getenv("PAYOS_PARTNER_CODE"))

	if payosClientID == "" || payosAPIKey == "" || payosChecksumKey == "" {
		payosInitErrorMsg = "PayOS chưa được cấu hình trên backend"
		return
	}

	var err error
	if payosPartnerCode != "" {
		err = payos.Key(payosClientID, payosAPIKey, payosChecksumKey, payosPartnerCode)
	} else {
		err = payos.Key(payosClientID, payosAPIKey, payosChecksumKey)
	}

	if err != nil {
		payosInitErrorMsg = "Khởi tạo PayOS thất bại"
		return
	}

	payosInitialized = true
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return response.Options(), nil
	}

	path := request.Path
	method := request.HTTPMethod

	switch {
	case method == "POST" && path == "/payment/payos/create":
		return createPayOSPayment(ctx, request)
	case method == "GET" && strings.HasPrefix(path, "/payment/payos/verify/"):
		return verifyPayOSPayment(ctx, request)
	case method == "POST" && strings.HasPrefix(path, "/payment/payos/cancel/"):
		return cancelPayOSPayment(ctx, request)
	default:
		return response.Error(404, "Route not found"), nil
	}
}

func createPayOSPayment(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if !payosInitialized {
		return response.Error(500, payosInitErrorMsg), nil
	}

	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	var input createPayOSRequest
	if err := json.Unmarshal([]byte(request.Body), &input); err != nil {
		return response.Error(400, "Dữ liệu thanh toán không hợp lệ"), nil
	}

	if input.OrderID == "" || input.ReturnURL == "" || input.CancelURL == "" {
		return response.Error(400, "Thiếu thông tin thanh toán bắt buộc"), nil
	}

	order, errRes := getOrderByID(ctx, input.OrderID)
	if errRes != nil {
		return *errRes, nil
	}

	if order.UserId != claims.Sub {
		return response.Error(403, "Bạn không có quyền thanh toán đơn hàng này"), nil
	}

	if order.Status != models.OrderPending {
		return response.Error(400, "Đơn hàng không ở trạng thái chờ thanh toán"), nil
	}

	amount := int(math.Round(order.TotalAmount))
	if amount <= 0 {
		return response.Error(400, "Số tiền đơn hàng không hợp lệ"), nil
	}

	orderCode := buildPayOSOrderCode(order.OrderId)
	description := sanitizePayOSDescription(input.Description, order.OrderId)

	items := make([]payos.Item, 0, len(order.Items))
	for _, orderItem := range order.Items {
		itemPrice := int(math.Round(orderItem.Price))
		if itemPrice < 0 {
			itemPrice = 0
		}
		items = append(items, payos.Item{
			Name:     truncate(orderItem.ProductName, 80),
			Quantity: orderItem.Quantity,
			Price:    itemPrice,
		})
	}

	buyerName := strings.TrimSpace(input.BuyerName)
	if buyerName == "" {
		buyerName = strings.TrimSpace(order.ShippingName)
	}
	buyerPhone := strings.TrimSpace(input.BuyerPhone)
	if buyerPhone == "" {
		buyerPhone = strings.TrimSpace(order.ShippingPhone)
	}
	buyerAddress := strings.TrimSpace(input.BuyerAddress)
	if buyerAddress == "" {
		buyerAddress = strings.TrimSpace(order.ShippingAddr)
	}
	buyerEmail := strings.TrimSpace(input.BuyerEmail)
	if buyerEmail == "" {
		buyerEmail = strings.TrimSpace(order.UserEmail)
	}

	checkoutReq := payos.CheckoutRequestType{
		OrderCode:    orderCode,
		Amount:       amount,
		Description:  description,
		CancelUrl:    input.CancelURL,
		ReturnUrl:    input.ReturnURL,
		Items:        items,
		BuyerName:    toOptionalString(buyerName),
		BuyerEmail:   toOptionalString(buyerEmail),
		BuyerPhone:   toOptionalString(buyerPhone),
		BuyerAddress: toOptionalString(buyerAddress),
	}

	checkoutRes, err := payos.CreatePaymentLink(checkoutReq)
	if err != nil {
		return response.Error(502, fmt.Sprintf("Không thể tạo link thanh toán PayOS: %v", err)), nil
	}

	return response.Success(200, map[string]interface{}{
		"paymentUrl":    checkoutRes.CheckoutUrl,
		"orderId":       order.OrderId,
		"qrCode":        checkoutRes.QRCode,
		"binCode":       checkoutRes.Bin,
		"accountNumber": checkoutRes.AccountNumber,
		"amount":        checkoutRes.Amount,
	}), nil
}

func verifyPayOSPayment(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if !payosInitialized {
		return response.Error(500, payosInitErrorMsg), nil
	}

	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	orderID := strings.TrimSpace(request.PathParameters["orderId"])
	if orderID == "" {
		return response.Error(400, "Thiếu mã đơn hàng"), nil
	}

	order, errRes := getOrderByID(ctx, orderID)
	if errRes != nil {
		return *errRes, nil
	}

	if order.UserId != claims.Sub {
		return response.Error(403, "Bạn không có quyền xem thanh toán đơn hàng này"), nil
	}

	orderCode := strconv.FormatInt(buildPayOSOrderCode(order.OrderId), 10)
	payInfo, err := payos.GetPaymentLinkInformation(orderCode)
	if err != nil {
		return response.Error(502, fmt.Sprintf("Không thể xác minh thanh toán PayOS: %v", err)), nil
	}

	success := strings.EqualFold(payInfo.Status, "PAID")
	message := "Thanh toán chưa hoàn tất"
	if success {
		message = "Thanh toán thành công"
	}

	return response.Success(200, map[string]interface{}{
		"success":       success,
		"orderId":       order.OrderId,
		"transactionId": payInfo.Id,
		"amount":        payInfo.AmountPaid,
		"message":       message,
	}), nil
}

func cancelPayOSPayment(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if !payosInitialized {
		return response.Error(500, payosInitErrorMsg), nil
	}

	claims := auth.ExtractClaims(request)
	if claims.Sub == "" {
		return response.Error(401, "Unauthorized"), nil
	}

	orderID := strings.TrimSpace(request.PathParameters["orderId"])
	if orderID == "" {
		return response.Error(400, "Thiếu mã đơn hàng"), nil
	}

	order, errRes := getOrderByID(ctx, orderID)
	if errRes != nil {
		return *errRes, nil
	}

	if order.UserId != claims.Sub {
		return response.Error(403, "Bạn không có quyền hủy thanh toán đơn hàng này"), nil
	}

	orderCode := strconv.FormatInt(buildPayOSOrderCode(order.OrderId), 10)
	reason := "Khách hàng huỷ thanh toán"
	_, err := payos.CancelPaymentLink(orderCode, &reason)
	if err != nil {
		return response.Error(502, fmt.Sprintf("Không thể hủy thanh toán PayOS: %v", err)), nil
	}

	return response.Success(200, map[string]interface{}{
		"success": true,
	}), nil
}

func getOrderByID(ctx context.Context, orderID string) (models.Order, *events.APIGatewayProxyResponse) {
	client := db.GetClient()
	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(ordersTable),
		Key: map[string]types.AttributeValue{
			"orderId": &types.AttributeValueMemberS{Value: orderID},
		},
	})
	if err != nil {
		errResp := response.Error(500, "Không thể truy vấn đơn hàng")
		return models.Order{}, &errResp
	}
	if result.Item == nil {
		errResp := response.Error(404, "Không tìm thấy đơn hàng")
		return models.Order{}, &errResp
	}

	var order models.Order
	if err := attributevalue.UnmarshalMap(result.Item, &order); err != nil {
		errResp := response.Error(500, "Không thể đọc dữ liệu đơn hàng")
		return models.Order{}, &errResp
	}

	return order, nil
}

func buildPayOSOrderCode(orderID string) int64 {
	h := fnv.New64a()
	_, _ = h.Write([]byte(orderID))

	const maxSafeOrderCode int64 = 9007199254740991
	const minOrderCode int64 = 10000000

	n := int64(h.Sum64() % uint64(maxSafeOrderCode))
	if n < minOrderCode {
		n += minOrderCode
	}

	return n
}

func sanitizePayOSDescription(inputDescription, orderID string) string {
	description := strings.TrimSpace(inputDescription)
	if description == "" {
		tail := orderID
		if len(orderID) > 8 {
			tail = orderID[len(orderID)-8:]
		}
		description = "ORCHA " + tail
	}

	description = truncate(description, 25)
	if description == "" {
		description = "ORCHA Payment"
	}

	return description
}

func truncate(value string, maxLen int) string {
	if maxLen <= 0 {
		return ""
	}
	runes := []rune(strings.TrimSpace(value))
	if len(runes) <= maxLen {
		return string(runes)
	}
	return string(runes[:maxLen])
}

func toOptionalString(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func main() {
	lambda.Start(handler)
}
