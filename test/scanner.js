"use strict";

import referee from "@sinonjs/referee";

import scannerModule, { Scanner, createScanner } from "../lib/jazz/scanner.js";
import { SyntaxError } from "../lib/jazz/error.js";
import * as tokens from "../lib/jazz/tokens.js";

const assert = referee.assert;

function scanAll(source, filename) {
  const scanner = createScanner(source, filename || "template.jazz");
  const result = [];
  for (;;) {
    const token = scanner.next();
    result.push(token);
    if (token.type === tokens.EOF) {
      break;
    }
  }
  return result;
}

describe("scanner - exports", function () {
  it("should expose Scanner and factory in default export", function () {
    assert.same(scannerModule.Scanner, Scanner);
    assert.same(scannerModule.createScanner, createScanner);
  });

  it("should create scanner instance from factory", function () {
    const scanner = createScanner("plain", "x.jazz");
    assert.isTrue(scanner instanceof Scanner);
    assert.equals(scanner.filename, "x.jazz");
  });

  it("should default filename when none is provided", function () {
    const scanner = createScanner("plain");
    assert.equals(scanner.filename, "<unknown>");
  });
});

describe("scanner - next", function () {
  it("should scan echo text and escaped braces", function () {
    const scanned = scanAll("Hello {{name}}\n");

    assert.equals(scanned.length, 2);
    assert.equals(scanned[0].type, tokens.ECHO);
    assert.equals(scanned[0].value, "Hello {name}\n");
    assert.equals(scanned[0].row, 1);
    assert.equals(scanned[0].col, 1);
    assert.equals(scanned[1].type, tokens.EOF);
  });

  it("should scan code keywords punctuation and primitives", function () {
    const source =
      "{if cond and other or not flag eq true neq false gt 10 foreach item in items end else elif empty val @fn(0x1A, 12.5, \"ok\", {'key': 1}) . [ ] : , ( )}";

    const scanned = scanAll(source);
    const types = scanned.map((token) => token.type);

    assert.equals(types[0], tokens.IF);
    assert.isTrue(types.indexOf(tokens.AND) > 0);
    assert.isTrue(types.indexOf(tokens.OR) > 0);
    assert.isTrue(types.indexOf(tokens.NOT) > 0);
    assert.isTrue(types.indexOf(tokens.EQ) > 0);
    assert.isTrue(types.indexOf(tokens.NEQ) > 0);
    assert.isTrue(types.indexOf(tokens.GT) > 0);
    assert.isTrue(types.indexOf(tokens.FOREACH) > 0);
    assert.isTrue(types.indexOf(tokens.IN) > 0);
    assert.isTrue(types.indexOf(tokens.END) > 0);
    assert.isTrue(types.indexOf(tokens.ELSE) > 0);
    assert.isTrue(types.indexOf(tokens.ELIF) > 0);
    assert.isTrue(types.indexOf(tokens.EMPTY) > 0);
    assert.isTrue(types.indexOf("@") > 0);
    assert.isTrue(types.indexOf(".") > 0);
    assert.isTrue(types.indexOf("[") > 0);
    assert.isTrue(types.indexOf("]") > 0);
    assert.isTrue(types.indexOf(":") > 0);
    assert.isTrue(types.indexOf(",") > 0);
    assert.isTrue(types.indexOf("(") > 0);
    assert.isTrue(types.indexOf(")") > 0);

    const numericValues = scanned
      .filter((token) => token.type === tokens.NUM)
      .map((token) => token.value);
    assert.isTrue(numericValues.indexOf("10") > -1);
    assert.isTrue(numericValues.indexOf("0x1A") > -1);
    assert.isTrue(numericValues.indexOf("12.5") > -1);

    const strToken = scanned.filter((token) => token.type === tokens.STR)[0];
    assert.equals(strToken.value, "ok");
  });

  it("should decode escaped characters and keep unknown escape sequences", function () {
    const scanned = scanAll("{'\\q'}");
    const strToken = scanned.filter((token) => token.type === tokens.STR)[0];

    assert.equals(strToken.value, "\\q");
  });

  it("should throw syntax error for malformed escape-heavy string input", function () {
    const escaped =
      String.raw`\n` + String.raw`\r` + String.raw`\t` + String.raw`\\`;

    assert.exception(
      function () {
        scanAll(`{'${escaped}'}`);
      },
      function (err) {
        assert.isTrue(err instanceof SyntaxError);
        assert.equals(err.message, "unexpected token: '\\'");
        return true;
      },
    );
  });

  it("should parse hexadecimal numbers containing lowercase letters", function () {
    const scanned = scanAll("{0xfa}");
    const numToken = scanned.filter((token) => token.type === tokens.NUM)[0];

    assert.equals(numToken.value, "0xfa");
  });

  it("should return accumulated value for unterminated strings", function () {
    const scanned = scanAll("{'abc");
    const strToken = scanned.filter((token) => token.type === tokens.STR)[0];

    assert.equals(strToken.value, "abc");
    assert.equals(scanned[scanned.length - 1].type, tokens.EOF);
  });

  it("should keep dotted keywords as identifiers", function () {
    const scanned = scanAll("{obj.if}");
    const types = scanned.map((token) => token.type);

    assert.equals(types[0], tokens.IDENT);
    assert.equals(scanned[0].value, "obj");
    assert.equals(types[1], ".");
    assert.equals(types[2], tokens.IDENT);
    assert.equals(scanned[2].value, "if");
  });

  it("should process nested braces and return eof after closing code block", function () {
    const scanned = scanAll("{ {'a': 1} }");
    const types = scanned.map((token) => token.type);

    assert.isTrue(types.indexOf("{") > -1);
    assert.isTrue(types.indexOf("}") > -1);
    assert.equals(types[types.length - 1], tokens.EOF);
  });

  it("should advance row and reset column while scanning code newlines", function () {
    const scanned = scanAll("{\nif\ntrue\n}");

    assert.equals(scanned[0].type, tokens.IF);
    assert.equals(scanned[0].row, 2);
    assert.equals(scanned[1].type, tokens.BOOL);
    assert.equals(scanned[1].row, 3);
  });

  it("should recognise keyword at end of source", function () {
    const scanned = scanAll("{if");

    assert.equals(scanned[0].type, tokens.IF);
    assert.equals(scanned[1].type, tokens.EOF);
  });

  it("should throw syntax error for unexpected token in echo state", function () {
    const scanner = createScanner("oops}", "bad.jazz");

    assert.exception(
      function () {
        scanner.next();
      },
      function (err) {
        assert.isTrue(err instanceof SyntaxError);
        assert.equals(err.message, "unexpected token: '}'");
        assert.equals(err.filename, "bad.jazz");
        return true;
      },
    );
  });

  it("should throw syntax error for unsupported elsif keyword", function () {
    const scanner = createScanner("{elsif x}", "bad.jazz");

    assert.exception(
      function () {
        scanner.next();
      },
      function (err) {
        assert.isTrue(err instanceof SyntaxError);
        assert.equals(
          err.message,
          "unexpected token: 'elsif', did you mean 'elif'",
        );
        return true;
      },
    );
  });

  it("should throw syntax error for unknown code token", function () {
    const scanner = createScanner("{?}", "bad.jazz");

    assert.exception(
      function () {
        scanner.next();
      },
      function (err) {
        assert.isTrue(err instanceof SyntaxError);
        assert.equals(err.message, "unexpected token: '?'");
        return true;
      },
    );
  });
});

describe("scanner - internal helpers", function () {
  it("should create tokens from string and object attrs", function () {
    const scanner = createScanner("", "meta.jazz");

    const stringToken = scanner._makeToken(tokens.ECHO, "value", {
      row: 8,
      col: 4,
    });
    assert.equals(stringToken.type, tokens.ECHO);
    assert.equals(stringToken.value, "value");
    assert.equals(stringToken.row, 8);
    assert.equals(stringToken.col, 4);

    const objectToken = scanner._makeToken(
      "custom",
      { foo: "bar" },
      {
        row: 2,
        col: 3,
      },
    );
    assert.equals(objectToken.type, "custom");
    assert.equals(objectToken.foo, "bar");
    assert.equals(objectToken.row, 2);
    assert.equals(objectToken.col, 3);
  });
});
