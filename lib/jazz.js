"use strict";

import { createCompiler } from "./jazz/compiler.js";
import { SyntaxError } from "./jazz/error.js";
import { createParser } from "./jazz/parser.js";
import { createScanner } from "./jazz/scanner.js";

function compile(source, options) {
  const opts = options || {};
  const scanner = createScanner(source, opts.filename);
  const parser = createParser(scanner);
  parser.debug = opts["parser:debug"] || false;

  const compiler = createCompiler();
  compiler.debug = opts["compiler:debug"] || false;

  const parsed = parser.parse();
  return compiler.compile(parsed);
}

const jazz = {
  SyntaxError,
  createScanner,
  createParser,
  createCompiler,
  compile,
};

export { SyntaxError, createScanner, createParser, createCompiler, compile };

export default jazz;

