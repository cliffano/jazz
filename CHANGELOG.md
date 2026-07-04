# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Upgrade Suntory to 1.1.0
- Update Makefile-extras target to fit Suntory run hook

### Fixed
- Fix integration test type to mocha

## 1.0.0 - 2026-05-24
### Added
- Start using Suntory as Makefile
- Add tests with 100% coverage

### Changed
- Refactor codebase to ESM

## 0.0.18 - 2011-08-09
### Changed
- Simplified conditional parsing behavior to align with standard syntax.

### Removed
- Removed support for the non-standard `elsif` conditional keyword.

### Fixed
- Added explicit validation for `elsif` usage to surface clearer template errors.

## 0.0.17 - 2011-08-09
### Added
- Added support for `elsif` and `else if` conditional aliases.

### Changed
- Improved array access behavior in template expressions.

## 0.0.16 - 2011-08-08
### Added
- Added basic support for array-like property access in templates.

### Changed
- Integrated community contribution for array access support.

## 0.0.15 - 2011-04-10
### Added
- Added support for using synchronous methods in echo expressions.

## 0.0.14 - 2011-02-11
### Added
- Added `foreach` syntax for iterating over object properties.

### Changed
- Expanded coverage for object-property iteration behavior.

## 0.0.13 - 2011-01-21
### Changed
- Updated release metadata and packaging details.

## 0.0.12 - 2011-01-19
### Changed
- Improved template execution efficiency.

## 0.0.11 - 2010-10-06
### Fixed
- Fixed synchronous method calls with multiple parameters.

## 0.0.10 - 2010-10-05
### Added
- Added `@obj.method()` notation support for synchronous method calls in `if` conditions.

## 0.0.9 - 2010-09-30
### Added
- Initial version
