"use strict";

import referee from "@sinonjs/referee";
import esmock from "esmock";

import jazz, {
  SyntaxError as exportedSyntaxError,
  createCompiler as exportedCreateCompiler,
  createParser as exportedCreateParser,
  createScanner as exportedCreateScanner,
  compile as exportedCompile,
} from "../lib/jazz.js";

const assert = referee.assert;

describe("jazz - exports", function () {
  it("should expose default and named api members", function () {
    assert.isObject(jazz);
    assert.same(jazz.SyntaxError, exportedSyntaxError);
    assert.same(jazz.createScanner, exportedCreateScanner);
    assert.same(jazz.createParser, exportedCreateParser);
    assert.same(jazz.createCompiler, exportedCreateCompiler);
    assert.same(jazz.compile, exportedCompile);
  });
});

describe("jazz - compile", function () {
  it("should wire scanner parser and compiler with default options", async function () {
    const compileResult = { process: function () {} };
    const parser = {
      parse: function () {
        return { some: "ast" };
      },
    };
    const compiler = {
      compile: function (parsedAst) {
        assert.equals(parsedAst.some, "ast");
        return compileResult;
      },
    };

    const mockedJazz = await esmock("../lib/jazz.js", {
      "../lib/jazz/scanner.js": {
        createScanner: function (source, filename) {
          assert.equals(source, "Hi {name}");
          assert.isUndefined(filename);
          return { scanner: true };
        },
      },
      "../lib/jazz/parser.js": {
        createParser: function (scanner) {
          assert.isTrue(scanner.scanner);
          return parser;
        },
      },
      "../lib/jazz/compiler.js": {
        createCompiler: function () {
          return compiler;
        },
      },
      "../lib/jazz/error.js": {
        SyntaxError: class MockSyntaxError extends Error {},
      },
    });

    const result = mockedJazz.compile("Hi {name}");

    assert.same(result, compileResult);
    assert.isFalse(parser.debug);
    assert.isFalse(compiler.debug);
  });

  it("should apply parser and compiler debug flags and filename", async function () {
    const parser = {
      parse: function () {
        return { root: true };
      },
    };
    const compiler = {
      compile: function () {
        return "compiled";
      },
    };

    const mockedJazz = await esmock("../lib/jazz.js", {
      "../lib/jazz/scanner.js": {
        createScanner: function (source, filename) {
          assert.equals(source, "source");
          assert.equals(filename, "template.jazz");
          return { scan: true };
        },
      },
      "../lib/jazz/parser.js": {
        createParser: function () {
          return parser;
        },
      },
      "../lib/jazz/compiler.js": {
        createCompiler: function () {
          return compiler;
        },
      },
      "../lib/jazz/error.js": {
        SyntaxError: class MockSyntaxError extends Error {},
      },
    });

    const result = mockedJazz.compile("source", {
      filename: "template.jazz",
      "parser:debug": true,
      "compiler:debug": true,
    });

    assert.equals(result, "compiled");
    assert.isTrue(parser.debug);
    assert.isTrue(compiler.debug);
  });
});
