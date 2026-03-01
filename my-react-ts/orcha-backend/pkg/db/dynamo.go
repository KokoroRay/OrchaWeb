package db

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var client *dynamodb.Client

func GetClient() *dynamodb.Client {
	if client == nil {
		cfg, err := config.LoadDefaultConfig(context.TODO())
		if err != nil {
			panic("unable to load AWS SDK config: " + err.Error())
		}
		client = dynamodb.NewFromConfig(cfg)
	}
	return client
}
