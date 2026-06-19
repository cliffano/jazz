---
description: "Standard Node.js project conventions and tooling using Suntory"
---

# Node.js Project Standards

This repository contains a Node.js project following a **unified standard** for tooling, build automation, and coding conventions. All projects share the same tooling stack and conventions to ensure consistency and maintainability. The key components of the standard include:

- Build automation (Suntory)
- Project definition and dependency management (npm)
- Code formatting (Prettier)
- Static analysis (ESLint)
- Testing (Mocha + Sinon)

This document outlines the common conventions that apply across the Node.js projects.

## Node.js Version & Dependencies

- **Node.js Version**: 22+
- **Dependency Manager**: npm
- **Lock File**: `package-lock.json` (checked in)
- **Dependency Specification**: `package.json`

### Adding Dependencies

```bash
npm install package_name          # Add to runtime deps
npm install --save-dev pkg_name   # Add to dev deps
make deps                         # Install all deps
```

### Project Structure

```text
project/
├── bin/                      # CLI entry points
│   └── <project>.js
├── conf/                     # Configuration files (commands.json, etc.)
├── examples/                 # Example configs and usage
│   └── *.sh
├── lib/                      # Main module source files
│   ├── <module>.js
│   └── ...
├── test/                     # Unit tests
│   ├── <module>.js
│   └── ...
├── test-integration/         # Integration tests
├── stage/                    # Temporary stage files
├── .bob/                     # Bob build output directory
├── .bob.json                 # Bob build tool configuration
├── .github/                  # GitHub workflows & Copilot instructions
├── .gitignore                # Git ignore rules
├── .rtk.json                 # RTK configuration
├── avatar.jpg                # Project avatar (80x80 pixels)
├── CHANGELOG.md              # Changelog file following Keep a Changelog format
├── eslint.config.js          # ESLint configuration
├── LICENSE                   # License file
├── Makefile                  # Build automation (Suntory)
├── Makefile-extras           # Additional Makefile targets specific to the project
├── package.json              # npm package definition
├── package-lock.json         # Locked dependencies
├── README.md                 # Project README
└── suntory.yml               # Suntory configuration
```

## Build Automation (Suntory)

This Node.js project uses **Suntory** as a standard build automation tool that unifies the build pipeline across all projects. The Makefile is sourced from the Suntory project and managed via `make update-to-latest` / `make update-to-version`.

Build tasks are delegated to **Bob** (`bob` CLI), which is the underlying build executor called by the Makefile targets.

### Common Commands

```bash
make ci                # Run full CI pipeline
make all               # Alias for ci
make clean             # Remove temporary files using bob clean
make stage             # Create stage directory using mkdir
make deps              # Install bob globally and run bob dep
make deps-upgrade      # Upgrade dependencies using bob updep
make rmdeps            # Remove node_modules and package-lock.json using bob rmdep
make style             # Check/format code using Prettier (bob style)
make lint              # Run static analysis using ESLint (bob lint)
make test              # Run unit tests using Mocha (bob test)
make test-examples     # Run example shell scripts using bash
make coverage          # Generate coverage reports using c8 (bob coverage)
make complexity        # Run complexity analysis (bob complexity)
make doc               # Generate documentation using JSDoc (bob doc)
make package           # Build package (bob package)
make install           # Link package locally using npm link
make uninstall         # Unlink package using npm unlink
make reinstall         # Uninstall then install
make test-integration  # Run integration tests (bob test-integration)
```

### Release Targets

```bash
make release-major     # Create major release using RTK
make release-minor     # Create minor release using RTK
make release-patch     # Create patch release using RTK
```

### Update Targets

```bash
make update-to-latest  # Update Makefile to latest Suntory tag using curl + GitHub API + jq
make update-to-main    # Update Makefile to Suntory main branch using curl
make update-to-version # Update Makefile to specific Suntory version using curl
make update-dotfiles   # Refresh project dotfiles using generator-node (git clone + plop + cp)
```

## Development Environment

This project is designed to be developed in a consistent environment via Docker image `cliffano/studio`.

You can run the container using: `docker run --rm --workdir /opt/workspace -v /var/run/docker.sock:/var/run/docker.sock -v $PWD:/opt/workspace -i -t cliffano/studio` and then run the build commands inside the container.

Alternatively you can run the Suntory Makefile targets via Docker container entrypoint, e.g. `docker run --rm --workdir /opt/workspace -v /var/run/docker.sock:/var/run/docker.sock -v $PWD:/opt/workspace -i -t cliffano/studio make ci`.

## Code Style, Testing, and Detailed Guidance

This file keeps the high-level project defaults. Detailed implementation rules live in scoped instruction files so they are only loaded when relevant.

### Code Style and Linting

- Formatting uses Prettier via `make style`
- Static analysis uses ESLint via `make lint`
- Detailed Node.js coding rules are in `.github/instructions/node-code.instructions.md`

### Testing

- Unit tests live in `test/`
- Integration tests live in `test-integration/`
- Run tests with `make test` and `make test-integration`
- Detailed testing rules are in `.github/instructions/testing.instructions.md`

### Documentation

- Documentation is generated with JSDoc via `make doc`
- Generated outputs live under `.bob/`

Common generated subdirectories under `.bob/`:

- `dep/` for dependency installation outputs
- `doc/` for generated API documentation
- `style/` for code formatting outputs
- `lint/` for lint reports
- `package/` for built package artifacts
- `coverage/` for coverage reports
- `complexity/` for complexity analysis reports
- `test/` for unit test reports
- `test-integration/` for integration test reports

## Continuous Integration Pipeline

The Makefile (Suntory) orchestrates standard build targets, with `make ci` running the following steps in sequence:

- deps              # 1. Install dependencies
- clean             # 2. Clean temp files
- style             # 3. Format & check code (prettier)
- lint              # 4. Static analysis (eslint)
- test              # 5. Unit tests (mocha)
- coverage          # 6. Coverage reports (c8)
- complexity        # 7. Complexity analysis
- doc               # 8. Generate documentation (jsdoc)
- package           # 9. Build distribution
- reinstall         # 10. Clean install from package
- test-integration  # 11. Integration tests

All steps must pass before code is merged. Developers should run `make ci` locally before pushing to ensure the CI pipeline will pass.

After the code is merged, the CI pipeline will run as GitHub CI workflow.

## Git Workflow: Branches, Commits, and Pull Requests

**Note**: These instructions apply to **local machine development only**. When working with GitHub Actions or other CI/CD environments, the git configuration and pakkunbot identity setup is not available. These steps assume you are developing on your local machine where `~/.gitconfig-pakkunbot` exists.

### Creating and Working with Feature Branches

```bash
# Create a feature branch from main
git checkout -b feature/your-feature-name

# Make your code changes, run tests locally
make ci

# Stage ALL changes (critical: never forget this step)
git -c include.path=~/.gitconfig-pakkunbot add -A

# Commit with Pakkun Pakkun identity (pakkunbot) via gitconfig override
git -c include.path=~/.gitconfig-pakkunbot commit -m "Your clear commit message"

# Push to remote
git -c include.path=~/.gitconfig-pakkunbot push
```

### Why `git add -A`

The `-A` flag ensures **all modified and new files** are staged for commit. Without it, changes can be missed (as discovered during development), causing incomplete commits and failed CI runs. Always explicitly run `git add -A` before committing.

### Pakkunbot Identity

The `git -c include.path=~/.gitconfig-pakkunbot` flag uses a separate Git configuration file (`~/.gitconfig-pakkunbot`) containing the Pakkun Pakkun bot identity (email: blah+pakkun@cliffano.com). This avoids modifying the repository's git configuration and keeps commits attributed to the bot account rather than your personal account.

**Always include this flag for all git operations** (add, commit, push, pull):

```bash
git -c include.path=~/.gitconfig-pakkunbot add -A
git -c include.path=~/.gitconfig-pakkunbot commit -m "message"
git -c include.path=~/.gitconfig-pakkunbot push
```

### Pull Request Process

1. **Push your feature branch** to the remote using the pakkunbot identity (see above).
2. **Open a pull request** on GitHub targeting `main`.
3. **Ensure all CI checks pass** (lint, tests, coverage, etc.). If any check fails, fix the issue locally and re-run `make ci`, then stage/commit/push again.
4. **Request review** from project maintainers.
5. **Merge** once approved and all checks pass.

### Common Commit Message Patterns

Use clear, imperative commit messages:

- `Fix test patch paths by avoiding command/module name collisions`
- `Add unit tests for blur-plates module`
- `Update README and example script to use categorise-orientation`
- `Remove deprecated blur-plates module and related code`

## GitHub Workflows

This repository defines the following workflows under `.github/workflows/`:

- **CI** (`ci-workflow.yaml`): Trigger: `push`, `pull_request`, and manual `workflow_dispatch`. Purpose: Runs the full quality pipeline (`bob build`) across a Node.js version matrix (usually LTS versions), publishes coverage to Coveralls, and publishes generated docs to GitHub Pages.

- **CodeQL** (`codeql-analysis.yml`): Trigger: `push` to `main`, `pull_request` targeting `main`, and weekly scheduled run (`cron`). Purpose: Performs GitHub CodeQL static security analysis for JavaScript and uploads code scanning results.

- **Publish** (`publish-workflow.yaml`): Trigger: `push` of any Git tag. Purpose: Builds and installs the package, then publishes it using `bob publish` with `NPMJS_TOKEN` secret.

- **Release Major** (`release-major-workflow.yaml`): Trigger: Manual `workflow_dispatch`. Purpose: Creates a major release via `cliffano/release-action` (`release_type: major`).

- **Release Minor** (`release-minor-workflow.yaml`): Trigger: Manual `workflow_dispatch`. Purpose: Creates a minor release via `cliffano/release-action` (`release_type: minor`).

- **Release Patch** (`release-patch-workflow.yaml`): Trigger: Manual `workflow_dispatch`. Purpose: Creates a patch release via `cliffano/release-action` (`release_type: patch`).

- **Upgrade Deps** (`upgrade-deps-workflow.yaml`): Trigger: Manual `workflow_dispatch`. Purpose: Upgrades dependencies using `bob updep build`, commits dependency updates, and pushes changes back to the current branch.
