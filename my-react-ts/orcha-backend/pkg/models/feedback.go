package models

import "time"

type Feedback struct {
	FeedbackId  string `json:"feedbackId" dynamodbav:"feedbackId"`
	ProductId   string `json:"productId" dynamodbav:"productId"`
	UserId      string `json:"userId" dynamodbav:"userId"`
	UserName    string `json:"userName" dynamodbav:"userName"`
	Rating      int    `json:"rating" dynamodbav:"rating"`
	Comment     string `json:"comment" dynamodbav:"comment"`
	CreatedAt   string `json:"createdAt" dynamodbav:"createdAt"`
}

type CreateFeedbackInput struct {
	ProductId string `json:"productId"`
	Rating    int    `json:"rating"`
	Comment   string `json:"comment"`
}

func (f *Feedback) SetDefaults() {
	f.CreatedAt = time.Now().UTC().Format(time.RFC3339)
}
