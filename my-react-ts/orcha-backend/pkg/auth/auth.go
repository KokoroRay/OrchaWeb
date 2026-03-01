package auth

import (
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

type Claims struct {
	Sub   string
	Email string
	Name  string
}

// ExtractClaims extracts user claims from the Cognito authorizer context
func ExtractClaims(request events.APIGatewayProxyRequest) Claims {
	claims := request.RequestContext.Authorizer
	if claims == nil {
		return Claims{}
	}

	return Claims{
		Sub:   getStringClaim(claims, "claims.sub", "sub"),
		Email: getStringClaim(claims, "claims.email", "email"),
		Name:  getStringClaim(claims, "claims.name", "name"),
	}
}

func getStringClaim(claims map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if val, ok := claims[key]; ok {
			if s, ok := val.(string); ok {
				return s
			}
		}
	}
	return ""
}

// IsAdmin checks if the user has admin role
// For simplicity, we check a custom attribute or a group claim
func IsAdmin(request events.APIGatewayProxyRequest) bool {
	claims := request.RequestContext.Authorizer
	if claims == nil {
		return false
	}

	// Check cognito:groups for admin group
	if groups, ok := claims["claims.cognito:groups"]; ok {
		if s, ok := groups.(string); ok {
			return strings.Contains(s, "admin")
		}
	}

	return false
}
