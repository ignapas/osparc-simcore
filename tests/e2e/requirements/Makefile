.DEFAULT_GOAL := help

ROOT_DIR  = $(realpath $(CURDIR)/../../../)
VENV_DIR ?= $(realpath $(ROOT_DIR)/.venv)

.PHONY: reqs
requirements.txt: requirements.in
	# pip compiling $<
	@pip-compile --upgrade --build-isolation --output-file $@ $<

reqs: requirements.txt ## alias to compile requirements.txt

.PHONY: install
install: $(VENV_DIR) requirements.txt ## installs dependencies
	# installing requirements
	@pip install -r requirements.txt


.PHONY: help
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## this colorful help
	@echo "Recipes for tests/swarm-deploy:"
	@echo ""
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
