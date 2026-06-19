"use strict";

import { createCompiler } from "./jazz/compiler.js";
import { SyntaxError } from "./jazz/error.js";
import { createParser } from "./jazz/parser.js";
import { createScanner } from "./jazz/scanner.js";

/**
 * Compile a Jazz template into an executable program.
 *
 * @param {string} source: template source text
 * @param {Object} [options]: optional compiler and parser options
 * @param {string} [options.filename]: filename used for error reporting
 * @param {boolean} [options["parser:debug"]]: enable parser debug mode
 * @param {boolean} [options["compiler:debug"]]: enable compiler debug mode
 * @returns {Object} compiled program with process(namespace, cb)
 */
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
