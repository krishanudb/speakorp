.PHONY: install dev build validate deploy start stop logs status clean

PROFILE ?= speakorp
TARGET  ?= default
APP     ?= speakorp

# Install dependencies
install:
	npm install

# Run locally with hot reload
dev:
	npm run dev

# Build client + server for production
build:
	npm run build

# Validate the app (typecheck, lint, build, tests) before deploying
validate:
	databricks apps validate --profile $(PROFILE)

# Validate, deploy, start the app, and print its URL
deploy:
	databricks apps deploy -t $(TARGET) --profile $(PROFILE)

# Start a stopped app without redeploying
start:
	databricks apps start $(APP) --profile $(PROFILE)

# Stop the running app
stop:
	databricks apps stop $(APP) --profile $(PROFILE)

# Stream live app logs
logs:
	databricks apps logs $(APP) --follow --profile $(PROFILE)

# Show app status and URL
status:
	databricks apps get $(APP) --profile $(PROFILE) -o json

# Remove build artifacts and dependencies
clean:
	npm run clean
