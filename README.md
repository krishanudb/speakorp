
## Usage Guide
This repository is meant to be a very concise quickstart from which you can add complexity. Please see the Developer design questions below to understand why these decisions were made. If you think we're missing a feature or documentation, please submit a GitHub issue to this repository.

#### Download the Template 
Manual Steps
1. Download this GitHub Repository.
2. Move the code in `~/projects/dabs/repo_template` to your target repository of interest.

CLI Steps
1. Connect to VPN.
2. Clone this sparse checkout of the repository. Alternatively, you can navigate to this directory in the GitHub UI and manually download it, then run `git init` in the downloaded folder.
```sh
git clone --filter=blob:none --sparse \
  org-140212977@github.com:databricks-field-eng/reusable-ip-ai-components.git

cd reusable-ip-ai-components
git sparse-checkout set projects/dabs/repo_template
mv projects/dabs/repo_template ../repo_template
cd ..
rm -rf reusable-ip-ai-components
```

#### Update the Template for your Use Case
1. Handle all `SETUP TODO`s. Simply search for them with grep or in an IDE.
2. Deploy your bundle with `make deploy` and run the dummy jobs with `make run`, validating your new configuration e2e.

## Common Commands

The `Makefile` wraps the development and bundle lifecycle commands.

| Command | Description |
| --- | --- |
| `make dev-setup` | Install dependencies, including dev groups. |
| `make lint` | Check `src/` and `tests/` with ruff. |
| `make format` | Autofix and format `src/` and `tests/`. |
| `make test` | Run the unit tests. |
| `make validate` | Validate the bundle configuration. |
| `make deploy` | Deploy the bundle. |
| `make run` | Run a job, e.g. `make run JOB=monitoring`. |
| `make destroy` | Tear down all deployed bundle resources. |

`TARGET` selects the `databricks.yml` target and defaults to `dev`; `PROFILE` selects the Databricks CLI profile. Override either per invocation, e.g. `make deploy TARGET=staging PROFILE=my-profile`. In GitHub Actions the profile flag is dropped so auth comes from `DATABRICKS_HOST`/`DATABRICKS_CLIENT_ID`/`DATABRICKS_CLIENT_SECRET`.

## CI/CD

Workflow files are not included in this template. Copy them from the [CI/CD component](../../../components/cicd/) for your platform of choice (GitHub Actions, Azure DevOps, etc.) and resolve the `SETUP TODO` items. See the [CI/CD component README](../../../components/cicd/README.md) for setup instructions, required secrets, and design rationale.

## Developer Design Questions
### Why do we separate `notebooks` and `src`?
When DABs are deployed, importing custom modules requires appending the path to the python path. Building a whl (python package) via the DABs build process and attaching it to your cluster is best practice. Building a whl requires python files (not notebooks), so keeping python modules in `src` and notebooks in `notebooks` provides logical separation and enables whl-based deployment.

### How should I handle custom dependencies?
See the [DABs README section on custom dependencies](../README.md#6---how-should-i-handle-custom-dependencies) for detailed implementation steps.

### Working Examples

This template includes two jobs as starting points:

**Model Job:**
- Job: `resources/jobs/hello_world_serverless_compute.yml`
- Notebook: `notebooks/hello_world.py`

**Monitoring Job:**
- Job: `resources/jobs/monitoring.yml`
- Notebook: `notebooks/monitoring_job.py`

Both jobs use serverless compute with the whl build artifact for importing the local `src/` package.

### Do you have basic SWE tips for building a whl?
* If you want a path to be importable, you must include `__init__.py` in that directory. This is not a requirement when working in a Databricks workspace file system.
* Only include python files. Yes, it's ok to have config in a python file. 

### Should I use YAML for config?
Typically, no. It's rare the complexity warrants the cost. Instead, it's best practice to use a Python file.

**Pros**
* Simpler syntax than Python (in theory).

**Cons**
* You can't include YAML in MLflow-deployable artifacts.
* In a whl build context, you must add deployment configuration to include YAML files.
* Reading YAML is more verbose than importing a Python module.
* You can't use python linters on it.