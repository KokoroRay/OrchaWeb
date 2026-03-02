package models

import "time"

type Category struct {
	CategoryId   string `json:"categoryId" dynamodbav:"categoryId"`
	Name         string `json:"name" dynamodbav:"name"`
	NameEn       string `json:"nameEn" dynamodbav:"nameEn"`
	Icon         string `json:"icon" dynamodbav:"icon"`
	Description  string `json:"description,omitempty" dynamodbav:"description,omitempty"`
	ProductCount int    `json:"productCount,omitempty" dynamodbav:"productCount,omitempty"`
	IsActive     bool   `json:"isActive" dynamodbav:"isActive"`
	CreatedAt    string `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt    string `json:"updatedAt" dynamodbav:"updatedAt"`
}

type CreateCategoryInput struct {
	Name        string `json:"name"`
	NameEn      string `json:"nameEn"`
	Icon        string `json:"icon"`
	Description string `json:"description,omitempty"`
}

type UpdateCategoryInput struct {
	Name        *string `json:"name,omitempty"`
	NameEn      *string `json:"nameEn,omitempty"`
	Icon        *string `json:"icon,omitempty"`
	Description *string `json:"description,omitempty"`
}

func (c *Category) SetDefaults() {
	now := time.Now().UTC().Format(time.RFC3339)
	c.CreatedAt = now
	c.UpdatedAt = now
	c.IsActive = true
	c.ProductCount = 0
}

func (c *Category) BeforeUpdate() {
	c.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
}
