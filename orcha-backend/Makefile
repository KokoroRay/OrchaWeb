.PHONY: build clean deploy

build:
	sam build

clean:
	rm -rf .aws-sam

deploy: build
	@echo "❌ Local deploy bị tắt. Hãy deploy qua GitHub Actions workflow: deploy-backend.yml"
	@exit 1

deploy-ci: build
	@echo "❌ Local deploy bị tắt. Hãy deploy qua GitHub Actions workflow: deploy-backend.yml"
	@exit 1

local:
	sam local start-api --warm-containers EAGER

validate:
	sam validate

logs-products:
	sam logs -n ProductsFunction --stack-name orcha-backend --tail

logs-orders:
	sam logs -n OrdersFunction --stack-name orcha-backend --tail
