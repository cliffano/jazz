"use strict";

import referee from "@sinonjs/referee";

import parserModule, { Parser, createParser } from "../lib/jazz/parser.js";
import { createScanner } from "../lib/jazz/scanner.js";
import { SyntaxError } from "../lib/jazz/error.js";
import * as ast from "../lib/jazz/ast.js";
import * as tokens from "../lib/jazz/tokens.js";

const assert = referee.assert;

function parseSource(source) {
  const scanner = createScanner(source, "parser.jazz");
  const parser = createParser(scanner);
  return parser.parse();
}

describe("parser - exports", function () {
  it("should expose parser class and factory", function () {
    assert.same(parserModule.Parser, Parser);
    assert.same(parserModule.createParser, createParser);
  });
});

describe("parser - parse", function () {
  it("should parse echo text and expression statements", function () {
    const tree = parseSource("Hello {name} {fn()} {@syncFn(1)}");

    assert.isTrue(tree.root instanceof ast.Suite);
    assert.equals(tree.root.body.length, 6);
    assert.isTrue(tree.root.body[0] instanceof ast.Echo);
    assert.isTrue(tree.root.body[1] instanceof ast.Echo);
    assert.isTrue(tree.root.body[2] instanceof ast.Echo);
    assert.isTrue(tree.root.body[3] instanceof ast.Call);
    assert.isTrue(tree.root.body[4] instanceof ast.Echo);
    assert.isTrue(tree.root.body[5] instanceof ast.Echo);
    assert.equals(tree.globals.join(","), "name,fn,syncFn");
  });

  it("should parse if elif else statements", function () {
    const tree = parseSource("{if first}A{elif second}B{else}C{end}");

    const ifStmt = tree.root.body[0];
    assert.isTrue(ifStmt instanceof ast.IfStmt);
    assert.isTrue(ifStmt.suite instanceof ast.Suite);
    assert.isTrue(ifStmt.orelse instanceof ast.IfStmt);
    assert.isTrue(ifStmt.orelse.orelse instanceof ast.Suite);
    assert.equals(tree.globals.join(","), "first,second");
  });

  it("should parse foreach and keep iterator as local", function () {
    const tree = parseSource("{foreach item in items}{item}{items[0]}{end}");

    const foreach = tree.root.body[0];
    assert.isTrue(foreach instanceof ast.ForEach);
    assert.equals(foreach.ident.name, "item");
    assert.equals(tree.globals.join(","), "items");
  });

  it("should parse get attribute chains hash literals and boolean expressions", function () {
    const tree = parseSource(
      "{user.profile['name']} {if (a and b) or not empty values and true neq false and 5 gt 3 and a eq b}ok{end} {fn({'x': 1, 'y': two})}",
    );

    assert.isTrue(tree.root.body[0] instanceof ast.Echo);
    assert.isTrue(tree.root.body[1] instanceof ast.Echo);
    assert.isTrue(tree.root.body[2] instanceof ast.IfStmt);
    assert.isTrue(tree.root.body[3] instanceof ast.Echo);
    assert.isTrue(tree.root.body[4] instanceof ast.Call);
  });

  it("should parse call argument list with zero and multiple values", function () {
    const tree = parseSource("{noop()} {sum(1, 2, 3)}");

    const first = tree.root.body[0];
    const second = tree.root.body[2];
    assert.isTrue(first instanceof ast.Call);
    assert.equals(first.args.length, 0);
    assert.isTrue(second instanceof ast.Call);
    assert.equals(second.args.length, 3);
  });

  it("should raise syntax error when expression is invalid", function () {
    assert.exception(
      function () {
        parseSource("{if ,}{end}");
      },
      function (err) {
        assert.isTrue(err instanceof SyntaxError);
        assert.isTrue(err.message.indexOf("expected expression") > -1);
        return true;
      },
    );
  });

  it("should raise syntax error when required token is missing", function () {
    assert.exception(
      function () {
        parseSource("{if true}x");
      },
      function (err) {
        assert.isTrue(err instanceof SyntaxError);
        assert.isTrue(err.message.indexOf("expected jazz.tokens.END") > -1);
        return true;
      },
    );
  });
});

describe("parser - helpers", function () {
  it("should peek next token and reuse buffered token", function () {
    const parser = createParser(createScanner("x{name}", "peek.jazz"));

    parser.next();
    const firstPeek = parser.peek();
    const secondPeek = parser.peek();
    assert.same(firstPeek, secondPeek);
    assert.equals(firstPeek.type, tokens.IDENT);
  });

  it("should track locals and globals without duplicates", function () {
    const parser = createParser(createScanner("", "locals.jazz"));

    parser.locals = [];
    parser.globals = [];

    parser._declareLocal("item");
    parser._declareLocal("item");
    parser._declareGlobal("users");
    parser._declareGlobal("users");

    assert.equals(parser.locals.length, 1);
    assert.equals(parser.globals.length, 1);
    assert.isTrue(parser._isLocal("item"));

    parser._pushLocals();
    parser.locals = [];
    parser._popLocals();
    assert.isTrue(parser._isLocal("item"));
  });

  it("should tolerate parseGetAttrList default switch branch", function () {
    const parser = createParser(createScanner("", "branch.jazz"));
    let currentCalls = 0;

    parser.current = function () {
      currentCalls += 1;
      if (currentCalls === 1) {
        return { type: "." };
      }
      return { type: "," };
    };

    const result = parser._parseGetAttrList(new ast.Ident("base"));
    assert.equals(result.name, "base");
  });
});
