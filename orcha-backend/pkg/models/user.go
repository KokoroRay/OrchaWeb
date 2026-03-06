package models

import "time"

type UserRole string

const (
	RoleCustomer UserRole = "CUSTOMER"
	RoleAdmin    UserRole = "ADMIN"
)

type User struct {
	UserId    string   `json:"userId" dynamodbav:"userId"`
	Email     string   `json:"email" dynamodbav:"email"`
	Name      string   `json:"name" dynamodbav:"name"`
	Phone     string   `json:"phone,omitempty" dynamodbav:"phone,omitempty"`
	Address   string   `json:"address,omitempty" dynamodbav:"address,omitempty"`
	AvatarUrl string   `json:"avatarUrl,omitempty" dynamodbav:"avatarUrl,omitempty"`
	Role      UserRole `json:"role" dynamodbav:"role"`
	IsActive  bool     `json:"isActive" dynamodbav:"isActive"`
	CreatedAt string   `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt string   `json:"updatedAt" dynamodbav:"updatedAt"`
}

type UpdateProfileInput struct {
	Name      string `json:"name"`
	Phone     string `json:"phone,omitempty"`
	Address   string `json:"address,omitempty"`
	AvatarUrl string `json:"avatarUrl,omitempty"`
}

type AdminUpdateUserInput struct {
	Role     UserRole `json:"role,omitempty"`
	IsActive *bool    `json:"isActive,omitempty"`
}

func (u *User) SetDefaults() {
	now := time.Now().UTC().Format(time.RFC3339)
	u.CreatedAt = now
	u.UpdatedAt = now
	u.Role = RoleCustomer
	u.IsActive = true
}
