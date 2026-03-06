package models

import "time"

type OrderStatus string

const (
	OrderPendingPayment OrderStatus = "PENDING_PAYMENT" // Waiting for payment
	OrderPending        OrderStatus = "PENDING"         // Payment confirmed, pending processing
	OrderConfirmed      OrderStatus = "CONFIRMED"       // Order confirmed by admin
	OrderShipping       OrderStatus = "SHIPPING"        // Order shipped
	OrderDelivered      OrderStatus = "DELIVERED"       // Order delivered
	OrderCancelled      OrderStatus = "CANCELLED"       // Order cancelled
)

type PaymentMethod string

const (
	PaymentCOD   PaymentMethod = "COD"
	PaymentPayOS PaymentMethod = "PAYOS"
)

type RefundStatus string

const (
	RefundNone      RefundStatus = "NONE"      // No refund needed
	RefundPending   RefundStatus = "PENDING"   // Refund requested
	RefundCompleted RefundStatus = "COMPLETED" // Refund completed
)

type Order struct {
	OrderId       string        `json:"orderId" dynamodbav:"orderId"`
	UserId        string        `json:"userId" dynamodbav:"userId"`
	UserEmail     string        `json:"userEmail" dynamodbav:"userEmail"`
	UserName      string        `json:"userName" dynamodbav:"userName"`
	Items         []OrderItem   `json:"items" dynamodbav:"items"`
	TotalAmount   float64       `json:"totalAmount" dynamodbav:"totalAmount"`
	Status        OrderStatus   `json:"status" dynamodbav:"status"`
	PaymentMethod PaymentMethod `json:"paymentMethod" dynamodbav:"paymentMethod"`
	RefundStatus  RefundStatus  `json:"refundStatus,omitempty" dynamodbav:"refundStatus,omitempty"`
	ShippingName  string        `json:"shippingName" dynamodbav:"shippingName"`
	ShippingPhone string        `json:"shippingPhone" dynamodbav:"shippingPhone"`
	ShippingAddr  string        `json:"shippingAddress" dynamodbav:"shippingAddress"`
	Note          string        `json:"note,omitempty" dynamodbav:"note,omitempty"`
	CreatedAt     string        `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt     string        `json:"updatedAt" dynamodbav:"updatedAt"`
}

type OrderItem struct {
	ProductId   string  `json:"productId" dynamodbav:"productId"`
	ProductName string  `json:"productName" dynamodbav:"productName"`
	Price       float64 `json:"price" dynamodbav:"price"`
	Quantity    int     `json:"quantity" dynamodbav:"quantity"`
	ImageUrl    string  `json:"imageUrl,omitempty" dynamodbav:"imageUrl,omitempty"`
}

type CreateOrderInput struct {
	ShippingName  string        `json:"shippingName"`
	ShippingPhone string        `json:"shippingPhone"`
	ShippingAddr  string        `json:"shippingAddress"`
	Note          string        `json:"note,omitempty"`
	PaymentMethod PaymentMethod `json:"paymentMethod"`
}

type UpdateOrderStatusInput struct {
	Status       OrderStatus  `json:"status"`
	RefundStatus RefundStatus `json:"refundStatus,omitempty"`
}

func (o *Order) SetDefaults() {
	now := time.Now().UTC().Format(time.RFC3339)
	o.CreatedAt = now
	o.UpdatedAt = now
	// Set initial status based on payment method
	if o.PaymentMethod == PaymentPayOS {
		o.Status = OrderPendingPayment
	} else {
		o.Status = OrderPending
	}
	o.RefundStatus = RefundNone
}
