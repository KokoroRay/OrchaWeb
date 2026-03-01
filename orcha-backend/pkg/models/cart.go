package models

type CartItem struct {
	UserId    string  `json:"userId" dynamodbav:"userId"`
	ProductId string  `json:"productId" dynamodbav:"productId"`
	Quantity  int     `json:"quantity" dynamodbav:"quantity"`
	AddedAt   string  `json:"addedAt" dynamodbav:"addedAt"`
}

type CartItemWithProduct struct {
	CartItem
	ProductName string  `json:"productName"`
	Price       float64 `json:"price"`
	SalePrice   float64 `json:"salePrice,omitempty"`
	ImageUrl    string  `json:"imageUrl,omitempty"`
	Stock       int     `json:"stock"`
}

type AddToCartInput struct {
	ProductId string `json:"productId"`
	Quantity  int    `json:"quantity"`
}

type UpdateCartInput struct {
	ProductId string `json:"productId"`
	Quantity  int    `json:"quantity"`
}
