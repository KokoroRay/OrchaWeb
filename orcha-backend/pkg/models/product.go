package models

import "time"

type Product struct {
	ProductId   string   `json:"productId" dynamodbav:"productId"`
	Name        string   `json:"name" dynamodbav:"name"`
	Description string   `json:"description" dynamodbav:"description"`
	Price       float64  `json:"price" dynamodbav:"price"`
	SalePrice   float64  `json:"salePrice,omitempty" dynamodbav:"salePrice,omitempty"`
	Category    string   `json:"category" dynamodbav:"category"`
	Images      []string `json:"images" dynamodbav:"images"`
	Stock       int      `json:"stock" dynamodbav:"stock"`
	Unit        string   `json:"unit" dynamodbav:"unit"`
	IsActive    bool     `json:"isActive" dynamodbav:"isActive"`
	CreatedAt   string   `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt   string   `json:"updatedAt" dynamodbav:"updatedAt"`
}

type CreateProductInput struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Price       float64  `json:"price"`
	SalePrice   float64  `json:"salePrice,omitempty"`
	Category    string   `json:"category"`
	Images      []string `json:"images"`
	Stock       int      `json:"stock"`
	Unit        string   `json:"unit"`
}

func (p *Product) SetDefaults() {
	now := time.Now().UTC().Format(time.RFC3339)
	p.CreatedAt = now
	p.UpdatedAt = now
	p.IsActive = true
}
