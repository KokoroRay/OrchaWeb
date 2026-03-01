package auth

import (
	"fmt"
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

	nestedClaims := getNestedClaims(claims)

	return Claims{
		Sub:   getStringClaim(claims, nestedClaims, "sub"),
		Email: getStringClaim(claims, nestedClaims, "email"),
		Name:  getStringClaim(claims, nestedClaims, "name"),
	}
}

func getStringClaim(authorizerClaims map[string]interface{}, nestedClaims map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if val, ok := authorizerClaims["claims."+key]; ok {
			if s, ok := val.(string); ok {
				return s
			}
		}

		if val, ok := authorizerClaims[key]; ok {
			if s, ok := val.(string); ok {
				return s
			}
		}

		if val, ok := nestedClaims[key]; ok {
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

	nestedClaims := getNestedClaims(claims)

	if role := strings.ToUpper(strings.TrimSpace(getStringClaim(claims, nestedClaims, "custom:role", "role"))); role == "ADMIN" {
		return true
	}

	if hasGroup(getClaimValue(claims, nestedClaims, "cognito:groups"), "admin") {
		return true
	}

	if hasGroup(getClaimValue(claims, nestedClaims, "groups"), "admin") {
		return true
	}

	return false
}

func getNestedClaims(authorizerClaims map[string]interface{}) map[string]interface{} {
	if raw, ok := authorizerClaims["claims"]; ok {
		if claimMap, ok := raw.(map[string]interface{}); ok {
			return claimMap
		}
	}
	return map[string]interface{}{}
}

func getClaimValue(authorizerClaims map[string]interface{}, nestedClaims map[string]interface{}, key string) interface{} {
	if val, ok := authorizerClaims["claims."+key]; ok {
		return val
	}
	if val, ok := authorizerClaims[key]; ok {
		return val
	}
	if val, ok := nestedClaims[key]; ok {
		return val
	}
	return nil
}

func hasGroup(raw interface{}, group string) bool {
	if raw == nil {
		return false
	}

	groupLower := strings.ToLower(strings.TrimSpace(group))

	switch value := raw.(type) {
	case string:
		lower := strings.ToLower(value)
		if strings.Contains(lower, groupLower) {
			return true
		}
		for _, part := range strings.Split(value, ",") {
			if strings.EqualFold(strings.TrimSpace(part), group) {
				return true
			}
		}
	case []interface{}:
		for _, item := range value {
			if strings.EqualFold(strings.TrimSpace(fmt.Sprintf("%v", item)), group) {
				return true
			}
		}
	}

	return false
}
