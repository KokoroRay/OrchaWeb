.PHONY: build clean deploy

build:
	sam build

clean:
	rm -rf .aws-sam

deploy: build
	sam deploy --guided

deploy-ci: build
	sam deploy --no-confirm-changeset --no-fail-on-empty-changeset

local:
	sam local start-api --warm-containers EAGER

validate:
	sam validate

logs-products:
	sam logs -n ProductsFunction --stack-name orcha-backend --tail

logs-orders:
	sam logs -n OrdersFunction --stack-name orcha-backend --tail
