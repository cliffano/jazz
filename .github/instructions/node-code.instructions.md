---
description: "Node.js code conventions and standard practices for Node.js projects"
applyTo: "**/*.js"
---

# Node.js Code Guidelines

## Style & Formatting

### Prettier Formatter

All code must pass `prettier` formatting:

```bash
make style  # Via Suntory
```

**Guidelines**:

- Use double quotes for strings (Prettier default)
- Don't manually format — `prettier` is authoritative
- Line length: 80 characters max

### ESLint Static Analysis

All code should have zero ESLint error and warning:

```bash
make lint
```

**Guidelines**:

- Disable rules only when justified: `/* eslint rule-name: 0 */`
- Use specific rule names, not blanket disables when the exemptions are only specific lines
- Attempt to fix warning root causes before disabling

## Node.js Conventions

### Module System

Use ES modules (`"type": "module"` in `package.json`):

```js
"use strict";
import async from "async";
import p from "path";
import fs from "fs";
```

- Always include `"use strict";` at the top of every file
- Use named imports where possible
- Group imports: built-in Node.js modules first, then third-party, then local

```js
"use strict";
import fs from "fs";
import p from "path";

import async from "async";
import sinon from "sinon";

import config from "./config.js";
import runner from "./runner.js";
```

### Classes

Use ES6 classes for object-oriented modules:

```js
class MyService {
  /**
   * Constructor for initialising MyService.
   *
   * @param {Object} opts: optional
   * - configFile: path to the configuration file
   * - timeout: request timeout in milliseconds
   */
  constructor(opts) {
    this.opts = opts;
  }

  /**
   * Execute the main operation.
   *
   * @param {Array} items: list of items to process
   * @param {Function} cb: standard cb(err, result) callback
   */
  execute(items, cb) {
    // implementation
  }
}

export default MyService;
```

### Callbacks

Use the Node.js standard callback convention `cb(err, result)`:

```js
function doSomething(input, cb) {
  if (!input) {
    cb(new Error("Input is required"));
  } else {
    cb(null, result);
  }
}
```

- Always check for errors before using results
- Use `async` library for control flow (series, parallel, waterfall)

### Naming Conventions

- **Classes**: `PascalCase` (e.g., `DataProcessor`, `ConfigManager`)
- **Functions/Methods**: `camelCase` (e.g., `processData`, `_formatOutput`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_BATCH_SIZE`, `DEFAULT_TIMEOUT`)
- **Private/Internal**: Prefix with `_` (e.g., `_internalHelper`, `_formatError`)
- **Variables**: `camelCase` (e.g., `resultData`, `itemCount`)
- **Files**: `kebab-case.js` or match the module name (e.g., `bagofcli.js`, `config.js`)

### Logging

Use `bagofcli` or a dedicated logger — never use `console.log` directly in library code.

For CLI output, use the logger provided by `bagofcli`:

```js
import bag from "bagofcli";

bag.cli.exit(err, result);
```

**Guidelines**:

- Use `console.error` only for fatal/unexpected errors in CLI entry points
- Library modules must not call `console.log` or `process.exit` directly
- Pass errors back via callbacks or throw them

## File Organization

### Module Structure

```js
// 1. Strict mode directive
"use strict";

// 2. Imports — built-ins, then third-party, then local
import fs from "fs";
import async from "async";
import config from "./config.js";

// 3. Constants
const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;

// 4. Class or function definitions
class MyModule {
  ...
}

// 5. Export
export default MyModule;
```

### CLI Entry Points

CLI files live in `bin/` and delegate all logic to `lib/`:

```js
#!/usr/bin/env node
"use strict";
import cli from "../lib/cli.js";
cli.exec();
```

### Command Configuration

CLI commands are defined in `conf/commands.json`:

```json
{
  "commands": {
    "mycommand": {
      "desc": "Description of the command",
      "options": [
        {
          "arg": "-f, --flag",
          "desc": "Flag description"
        }
      ]
    }
  }
}
```

## Error Handling

### Use Callbacks with Errors, Not Exceptions

```js
// Good: pass errors via callback
function readConfig(file, cb) {
  fs.readFile(file, "utf8", function (err, data) {
    if (err) {
      cb(err);
    } else {
      cb(null, JSON.parse(data));
    }
  });
}
```

### Propagate Errors Up

```js
function processAll(items, cb) {
  async.eachSeries(
    items,
    function (item, next) {
      processOne(item, function (err) {
        if (err) {
          next(err);
        } else {
          next();
        }
      });
    },
    cb
  );
}
```

## JSDoc Documentation

Add JSDoc comments to all public classes and methods:

```js
/**
 * Process a list of items in batches.
 *
 * @param {Array} items: list of items to process
 * @param {Number} batchSize: number of items per batch
 * @param {Function} cb: standard cb(err, result) callback
 */
function processBatch(items, batchSize, cb) {
  ...
}
```

**Guidelines**:

- Document all parameters with `@param {Type} name: description`
- Document return value with `@return {Type} description` for synchronous functions
- Use `@param {Function} cb: standard cb(err, result) callback` for async functions
