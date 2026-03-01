package models

import "time"

type OrderStatus string

const (
	OrderPending    OrderStatus = "PENDING"
	OrderConfirmed  OrderStatus = "CONFIRMED"
	OrderShipping   OrderStatus = "SHIPPING"
	OrderDelivered  OrderStatus = "DELIVERED"
	OrderCancelled  OrderStatus = "CANCELLED"
)

type Order struct {
	OrderId       string      `json:"orderId" dynamodbav:"orderId"`
	UserId        string      `json:"userId" dynamodbav:"userId"`
	UserEmail     string      `json:"userEmail" dynamodbav:"userEmail"`
	UserName      string      `json:"userName" dynamodbav:"userName"`
	Items         []OrderItem `json:"items" dynamodbav:"items"`
	TotalAmount   float64     `json:"totalAmount" dynamodbav:"totalAmount"`
	Status        OrderStatus `json:"status" dynamodbav:"status"`
	ShippingName  string      `json:"shippingName" dynamodbav:"shippingName"`
	ShippingPhone string      `json:"shippingPhone" dynamodbav:"shippingPhone"`
	ShippingAddr  string      `json:"shippingAddress" dynamodbav:"shippingAddress"`
	Note          string      `json:"note,omitempty" dynamodbav:"note,omitempty"`
	CreatedAt     string      `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt     string      `json:"updatedAt" dynamodbav:"updatedAt"`
}

type OrderItem struct {
	ProductId   string  `json:"productId" dynamodbav:"productId"`
	ProductName string  `json:"productName" dynamodbav:"productName"`
	Price       float64 `json:"price" dynamodbav:"price"`
	Quantity    int     `json:"quantity" dynamodbav:"quantity"`
	ImageUrl    string  `json:"imageUrl,omitempty" dynamodbav:"imageUrl,omitempty"`
}

type CreateOrderInput struct {
	ShippingName  string `json:"shippingName"`
	ShippingPhone string `json:"shippingPhone"`
	ShippingAddr  string `json:"shippingAddress"`
	Note          string `json:"note,omitempty"`
}

type UpdateOrderStatusInput struct {
	Status OrderStatus `json:"status"`
}

func (o *Order) SetDefaults() {
	now := time.Now().UTC().Format(time.RFC3339)
	o.CreatedAt = now
	o.UpdatedAt = now
	o.Status = OrderPending
}
