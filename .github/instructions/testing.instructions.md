---
description: "Testing conventions and standard practices for Node.js projects"
applyTo: "test/**/*.js,test-integration/**/*.js"
---

# Testing Guidelines

## Test Structure

### Unit Tests

**Location**: `test/<module>.js`

**Purpose**: Test individual functions/methods in isolation

**Scope**:

- No filesystem and network calls (mock them)
- Faster execution
- High code coverage

### Integration Tests

**Location**: `test-integration/<module>.js`

**Purpose**: Test end-to-end flows with real or semi-real external systems

**Scope**:

- May use filesystem and network calls (with test fixtures or mocks if needed)
- Slower execution
- Broader coverage (fewer, larger tests)

## Naming Conventions

### Test Files

```text
test/
  module1.js          # Tests for lib/module1.js
  module2.js          # Tests for lib/module2.js
  util.js             # Tests for lib/util.js

test-integration/
  cli.js               # Integration tests for CLI
  commands.yml         # Integration test command definitions
```

### Test Suites

Use `describe` blocks to group tests by module and method:

```js
describe("modulename - methodname", function () {
  ...
});

describe("cli - exec", function () {
  ...
});

describe("config - load", function () {
  ...
});
```

**Pattern**: `<modulename> - <methodname>`

### Test Cases

```js
it("should do something when condition", function (done) {
  ...
});

it("should pass error to callback when input is invalid", function (done) {
  ...
});

it("should construct commands and pass them to series", function (done) {
  ...
});
```

**Pattern**: `should <expected behaviour> when <condition>`

## Mocha Execution

### Running Tests

```bash
# All tests
make test

# Specific file
node_modules/.bin/mocha test/config.js

# Test matching a keyword
node_modules/.bin/mocha --grep "load"
```

### Configuration

- Framework: `mocha`
- Timeout: `5000ms` (set via `MOCHA_OPTIONS="--timeout 5000"`)
- Coverage: `c8` (via `make coverage`)

## Mocking Best Practices

### Import Mocking

```js
import sinon from "sinon";
import referee from "@sinonjs/referee";
```

### Sinon Mocks and Stubs

Use `sinon.mock()` for verifiable mock expectations and `sinon.stub()` for simple replacements:

```js
describe("mymodule - process", function () {
  beforeEach(function () {
    this.mockFs = sinon.mock(fs);
  });

  afterEach(function () {
    this.mockFs.verify();
    this.mockFs.restore();
  });

  it("should read file and process contents", function (done) {
    this.mockFs
      .expects("readFile")
      .once()
      .withExactArgs("config.json", "utf8")
      .callsArgWith(2, null, '{"key":"value"}');
    mymodule.process("config.json", function (err, result) {
      referee.assert.isNull(err);
      referee.assert.equals(result.key, "value");
      done();
    });
  });
});
```

### Stub Values

Use `sinon.stub().value()` to replace module-level imports or object properties:

```js
sinon.stub(bag, "command").value(function (base, actions) {
  actions.commands.release.action({ releaseIncrementType: "minor" });
});
```

### Restore After Each Test

Always restore mocks and stubs in `afterEach` to avoid cross-test pollution:

```js
afterEach(function () {
  this.mockDependency.verify();
  this.mockDependency.restore();
  sinon.restore();
});
```

### Mock Structure

```js
// Create mock
this.mockRunner = sinon.mock(runner);

// Set expectations
this.mockRunner
  .expects("execSeries")
  .withArgs(["command1", "command2"])
  .callsArgWith(2, null, "someresult");

// Verify and restore
this.mockRunner.verify();
this.mockRunner.restore();
```

### Mocking Async Callbacks

Use `callsArgWith(index, err, result)` to simulate async callback invocations:

```js
this.mockRunner
  .expects("execSeries")
  .once()
  .callsArgWith(2, null, "someresult");
```

### Mocking File I/O

```js
this.mockFs
  .expects("readFileSync")
  .once()
  .withExactArgs("/some/package.json")
  .returns(JSON.stringify({ version: "1.2.3" }));
```

## Test Assertion Patterns

Use `@sinonjs/referee` for assertions:

```js
import referee from "@sinonjs/referee";
const assert = referee.assert;
```

### Basic Assertions

```js
// Null / undefined
referee.assert.isNull(err);
referee.assert.isUndefined(result);

// Equality
referee.assert.equals(result, "expectedvalue");
referee.assert.equals(err.message, "someerror");

// Type checking
referee.assert.isString(base);
referee.assert.isFunction(actions.commands.release.action);

// Truthiness
referee.assert.isTrue(flag);
referee.assert.isFalse(flag);
```

### Mock Assertions

```js
// Expectation set via sinon mock — verified in afterEach
this.mockRunner.expects("execSeries").once();
this.mockRunner.verify(); // called in afterEach

// Manual assertion on stub call count
referee.assert.equals(stubFn.callCount, 2);
```

## Test File Structure

```js
"use strict";
import MyClass from "../lib/mymodule.js";
import dependency from "../lib/dependency.js";
import referee from "@sinonjs/referee";
import sinon from "sinon";

describe("mymodule - methodname", function () {
  beforeEach(function () {
    this.mockDependency = sinon.mock(dependency);
  });

  afterEach(function () {
    this.mockDependency.verify();
    this.mockDependency.restore();
  });

  it("should do expected thing when condition is met", function (done) {
    this.mockDependency
      .expects("someMethod")
      .once()
      .callsArgWith(1, null, "result");

    const instance = new MyClass({});
    instance.methodname("input", function (err, result) {
      referee.assert.isNull(err);
      referee.assert.equals(result, "result");
      done();
    });
  });

  it("should pass error to callback when dependency fails", function (done) {
    this.mockDependency
      .expects("someMethod")
      .once()
      .callsArgWith(1, new Error("someerror"));

    const instance = new MyClass({});
    instance.methodname("input", function (err, result) {
      referee.assert.equals(err.message, "someerror");
      referee.assert.isUndefined(result);
      done();
    });
  });
});
```

## Coverage

### Generate Coverage Report

```bash
make coverage
```

### Coverage Goals

- Aim for >= 90% code coverage
- Focus on critical paths (success flows, error handling)
- Be pedantic and don't ignore trivial getters/setters

### Coverage Tooling

- Coverage engine: `c8`
- Unit coverage output: `.bob/coverage/c8/`
- LCOV report: `.bob/coverage/c8/lcov.info`
- HTML report: `.bob/coverage/c8/index.html`

### Coverage Guidelines

- Prioritise meaningful branch and error-path coverage, not just line coverage
- Add tests for callback error paths (`cb(err)`) and success paths (`cb(null, result)`)
- Include coverage for CLI command option parsing and command dispatch
- Keep unit tests deterministic and isolated from network/filesystem unless explicitly integration tests

## CI Integration

Tests are run as part of `make ci`:

```bash
make test              # Unit tests
make test-integration  # Integration tests
```

All tests must pass before merging.
