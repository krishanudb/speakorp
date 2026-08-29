.PHONY: dev-setup lint format test validate deploy run destroy

TARGET ?= dev
PROFILE ?= DEFAULT # SETUP TODO: Change to your Databricks CLI profile name
JOB ?= hello_world_serverless_compute

# In CI, auth comes from env vars (DATABRICKS_HOST/CLIENT_ID/CLIENT_SECRET); no profile needed.
# Locally, use the named profile. Passing --profile in CI causes "no such file: ~/.databrickscfg".
PROFILE_FLAG = $(if $(filter true,$(GITHUB_ACTIONS)),,--profile $(PROFILE))

BUNDLE_FLAGS = $(PROFILE_FLAG) --target $(TARGET)

dev-setup:
	uv sync --all-groups

lint:
	uv run ruff check src/ tests/

format:
	uv run ruff check src/ tests/ --fix
	uv run ruff format src/ tests/

test:
	uv run pytest tests/

validate:
	databricks bundle validate $(BUNDLE_FLAGS)

deploy:
	databricks bundle deploy $(BUNDLE_FLAGS)

# Run a single job by its resource key, e.g. `make run JOB=monitoring`.
run:
	databricks bundle run $(BUNDLE_FLAGS) $(JOB)

destroy:
	databricks bundle destroy $(BUNDLE_FLAGS) --auto-approve
