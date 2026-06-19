SUNTORY_VERSION = 1.1.0

################################################################
# User configuration variables
# These variables should be stored in suntory.yml config file,
# and they will be parsed using yq https://github.com/mikefarah/yq
# Example:
# ---
# package_name: somepackage
# author: Some Author

# PACKAGE_NAME is the name of the node.js package
PACKAGE_NAME=$(shell yq .package_name suntory.yml)

# AUTHOR is the author of the node.js package
AUTHOR ?= $(shell yq .author suntory.yml)

$(info ################################################################)
$(info Building node.js package using Suntory with user configurations...)
$(info - Package name = ${PACKAGE_NAME})
$(info - Author = ${AUTHOR})

export PATH := node_modules/bin:$(PATH)

################################################################
# Base targets

# CI target to be executed by CI/CD tool
all:ci
ci: deps clean style lint test coverage complexity doc package reinstall test-integration

# Ensure stage directory exists
stage:
	mkdir -p stage

# Remove all temporary (staged, generated, cached) files
clean:
	bob clean

# Retrieve the Pyhon package dependencies
deps:
	npm install -g bob@5.2.1
	bob dep

deps-extra-apt:
	apt-get update
	apt-get install -y markdownlint

deps-upgrade:
	bob updep

rmdeps:
	bob rmdep

# Update Makefile to the latest version tag
update-to-latest: TARGET_SUNTORY_VERSION = $(shell curl -s https://api.github.com/repos/cliffano/suntory/tags | jq -r '.[0].name')
update-to-latest: update-to-version

# Update Makefile to the main branch
update-to-main:
	curl https://raw.githubusercontent.com/cliffano/suntory/main/src/Makefile-suntory -o Makefile

# Update Makefile to the version defined in TARGET_SUNTORY_VERSION parameter
update-to-version:
	curl https://raw.githubusercontent.com/cliffano/suntory/$(TARGET_SUNTORY_VERSION)/src/Makefile-suntory -o Makefile

# Update dotfiles using the generator-node
update-dotfiles: GENERATOR_COMPONENT = $(shell yq .generator.component suntory.yml)
update-dotfiles: GENERATOR_INPUTS_PROJECT_ID = $(shell yq .generator.inputs.project_id suntory.yml)
update-dotfiles: GENERATOR_INPUTS_PROJECT_NAME = $(shell yq .generator.inputs.project_name suntory.yml)
update-dotfiles: GENERATOR_INPUTS_PROJECT_DESC = $(shell yq .generator.inputs.project_desc suntory.yml)
update-dotfiles: GENERATOR_INPUTS_AUTHOR_NAME = $(shell yq .generator.inputs.author_name suntory.yml)
update-dotfiles: GENERATOR_INPUTS_AUTHOR_EMAIL = $(shell yq .generator.inputs.author_email suntory.yml)
update-dotfiles: GENERATOR_INPUTS_AUTHOR_URL = $(shell yq .generator.inputs.author_url suntory.yml)
update-dotfiles: GENERATOR_INPUTS_GITHUB_ID = $(shell yq .generator.inputs.github_id suntory.yml)
update-dotfiles: GENERATOR_INPUTS_GITHUB_REPO = $(shell yq .generator.inputs.github_repo suntory.yml)
update-dotfiles: GENERATOR_INPUTS_GITHUB_TOKEN_PREFIX = $(shell yq .generator.inputs.github_token_prefix suntory.yml)
update-dotfiles: stage
	cd stage/ && \
	  rm -rf generator-node/ && \
	  git clone https://github.com/cliffano/generator-node && \
	  cd generator-node && \
	  make deps && \
	  node_modules/.bin/plop $(GENERATOR_COMPONENT) -- \
	    --project_id "$(GENERATOR_INPUTS_PROJECT_ID)" \
		--project_name "$(GENERATOR_INPUTS_PROJECT_NAME)" \
		--project_desc "$(GENERATOR_INPUTS_PROJECT_DESC)" \
		--author_name "$(GENERATOR_INPUTS_AUTHOR_NAME)" \
		--author_email "$(GENERATOR_INPUTS_AUTHOR_EMAIL)" \
		--author_url "$(GENERATOR_INPUTS_AUTHOR_URL)" \
		--github_id "$(GENERATOR_INPUTS_GITHUB_ID)" \
		--github_repo "$(GENERATOR_INPUTS_GITHUB_REPO)" \
		--github_token_prefix "$(GENERATOR_INPUTS_GITHUB_TOKEN_PREFIX)"
	cd stage/generator-node/stage/$(GENERATOR_COMPONENT) && \
	  cp -R .github/. ../../../../.github/ && \
	  cp .bob.json ../../../../.bob.json && \
	  cp .gitignore ../../../../.gitignore && \
	  cp eslint.config.js ../../../../eslint.config.js && \
	  cp .rtk.json ../../../../.rtk.json
	make -f Makefile-extras x-overwrite-dotfiles

# Update partial snippets using the generator-node
update-partials: GENERATOR_COMPONENT = $(shell yq .generator.component suntory.yml)
update-partials: GENERATOR_INPUTS_PROJECT_ID = $(shell yq .generator.inputs.project_id suntory.yml)
update-partials: GENERATOR_INPUTS_PROJECT_NAME = $(shell yq .generator.inputs.project_name suntory.yml)
update-partials: GENERATOR_INPUTS_PROJECT_DESC = $(shell yq .generator.inputs.project_desc suntory.yml)
update-partials: GENERATOR_INPUTS_AUTHOR_NAME = $(shell yq .generator.inputs.author_name suntory.yml)
update-partials: GENERATOR_INPUTS_AUTHOR_EMAIL = $(shell yq .generator.inputs.author_email suntory.yml)
update-partials: GENERATOR_INPUTS_AUTHOR_URL = $(shell yq .generator.inputs.author_url suntory.yml)
update-partials: GENERATOR_INPUTS_GITHUB_ID = $(shell yq .generator.inputs.github_id suntory.yml)
update-partials: GENERATOR_INPUTS_GITHUB_REPO = $(shell yq .generator.inputs.github_repo suntory.yml)
update-partials: GENERATOR_INPUTS_GITHUB_TOKEN_PREFIX = $(shell yq .generator.inputs.github_token_prefix suntory.yml)
update-partials: stage
	cd stage/ && \
	  rm -rf generator-node/ && \
	  git clone https://github.com/cliffano/generator-node && \
	  cd generator-node && \
	  make deps && \
	  node_modules/.bin/plop $(GENERATOR_COMPONENT)-partials -- \
	    --project_id "$(GENERATOR_INPUTS_PROJECT_ID)" \
		--project_name "$(GENERATOR_INPUTS_PROJECT_NAME)" \
		--project_desc "$(GENERATOR_INPUTS_PROJECT_DESC)" \
		--author_name "$(GENERATOR_INPUTS_AUTHOR_NAME)" \
		--author_email "$(GENERATOR_INPUTS_AUTHOR_EMAIL)" \
		--author_url "$(GENERATOR_INPUTS_AUTHOR_URL)" \
		--github_id "$(GENERATOR_INPUTS_GITHUB_ID)" \
		--github_repo "$(GENERATOR_INPUTS_GITHUB_REPO)" \
		--github_token_prefix "$(GENERATOR_INPUTS_GITHUB_TOKEN_PREFIX)"
	for block in AVATAR BADGES BUILD_REPORTS DEVELOPERS_GUIDE; do \
	  partial_file=$$(printf "%s" "$$block" | tr "A-Z" "a-z"); \
	  ex -s \
	    -c "/<!-- BEGIN:$$block -->/+1,/<!-- END:$$block -->/-1d" \
	    -c "/<!-- BEGIN:$$block -->/r stage/generator-node/stage/$(GENERATOR_COMPONENT)-partials/$$partial_file.txt" \
	    -c 'wq' \
	    README.md; \
	done

################################################################
# Formatting targets

style:
	bob style

################################################################
# Testing targets

lint: stage
	bob lint
	mdl -r ~MD013,~MD029 $(shell find . -path ./stage -prune -o -path ./node_modules -prune -o -name "CHANGELOG.md" -prune -o -name "*.md" -print)

complexity: stage
	bob complexity

test:
	MOCHA_OPTIONS="--timeout 5000" bob test

test-integration:
	MOCHA_OPTIONS="--timeout 5000" bob test-integration

test-examples:
	mkdir -p stage/test-examples/
	cd examples && \
	for f in *.sh; do \
	  bash -x "$$f"; \
	done

coverage:
	MOCHA_OPTIONS="--timeout 5000" bob coverage

################################################################
# Release targets

release-major:
	rtk release --release-increment-type major

release-minor:
	rtk release --release-increment-type minor

release-patch:
	rtk release --release-increment-type patch

################################################################
# Packaging, installation, and publishing targets

package:
	bob package

install: package
	npm link .

uninstall:
	npm unlink .

reinstall: uninstall install

publish:
	npm publish

################################################################
# Documentation targets

doc: stage
	bob doc

################################################################

.PHONY: all ci clean complexity configurations coverage deps deps-extra-apt deps-upgrade rmdeps doc export export export install install-wheel lint name package package publish reinstall release-major release-minor release-patch stage style test test-examples test-integration uninstall update-dotfiles update-partials update-to-latest update-to-latest update-to-main update-to-version