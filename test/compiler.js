"use strict";

import referee from "@sinonjs/referee";

import compilerModule, {
  CompileError,
  Program,
  CompilerJS,
  createCompiler,
  events,
} from "../lib/jazz/compiler.js";
import * as ast from "../lib/jazz/ast.js";
import { createParser } from "../lib/jazz/parser.js";
import { createScanner } from "../lib/jazz/scanner.js";

const assert = referee.assert;

function parseSource(source) {
  return createParser(createScanner(source, "compiler.jazz")).parse();
}

describe("compiler - exports", function () {
  it("should expose compiler api and events module", function () {
    assert.same(compilerModule.CompileError, CompileError);
    assert.same(compilerModule.Program, Program);
    assert.same(compilerModule.CompilerJS, CompilerJS);
    assert.same(compilerModule.createCompiler, createCompiler);
    assert.isFunction(events.EventEmitter);
  });
});

describe("compiler - CompileError", function () {
  it("should render compile error string with fallback location", function () {
    const err = new CompileError("file.jazz", null, undefined, "bad");

    assert.equals(err.name, "CompileError");
    assert.equals(err.toString(), "file.jazz:?:?: bad");
  });
});

describe("compiler - Program", function () {
  it("should process namespace values in global order", function (done) {
    const program = new Program(
      function (cb, name, score) {
        cb(`${name}:${score}`);
      },
      ["name", "score"],
    );

    program.process({ score: 7, name: "Tom" }, function (output) {
      assert.equals(output, "Tom:7");
      done();
    });
  });

  it("should support eval alias for backwards compatibility", function (done) {
    const program = new Program(
      function (cb, value) {
        cb(value);
      },
      ["value"],
    );

    program.eval({ value: "legacy" }, function (output) {
      assert.equals(output, "legacy");
      done();
    });
  });
});

describe("compiler - compile", function () {
  it("should compile and execute mixed template statements", function (done) {
    const compiler = createCompiler();
    const templateAst = parseSource(
      "Hi {name}! {if isVip}VIP{else}REG{end} {foreach item in items}[{__count}:{__index}:{item}]{end} {sum(1, 2)} {@sync('ok')} {if empty none}empty{end}",
    );

    const program = compiler.compile(templateAst);
    program.process(
      {
        name: "Ada",
        isVip: true,
        items: ["a", "b"],
        sum: function (a, b, cb) {
          cb((a + b).toString());
        },
        sync: function (value) {
          return value.toUpperCase();
        },
        none: [],
      },
      function (output) {
        assert.equals(output, "Hi Ada! VIP [1:0:a][2:1:b] 3 OK empty");
        done();
      },
    );
  });

  it("should compile foreach over object values", function (done) {
    const compiler = createCompiler();
    const templateAst = parseSource(
      "{foreach pair in map}{pair.key}={pair.value};{end}",
    );

    const program = compiler.compile(templateAst);
    program.process({ map: { a: 1, b: 2 } }, function (output) {
      assert.isTrue(output.indexOf("a=1;") > -1);
      assert.isTrue(output.indexOf("b=2;") > -1);
      done();
    });
  });

  it("should compile direct GetArr statement branch", function (done) {
    const compiler = createCompiler();
    const tree = new ast.AST(
      new ast.Suite([new ast.GetArr(new ast.Ident("arr"), new ast.Num("1"))]),
      ["arr"],
    );

    const program = compiler.compile(tree);
    program.process({ arr: ["x", "y"] }, function (output) {
      assert.equals(output, "y");
      done();
    });
  });
});

describe("compiler - internals", function () {
  it("should create incrementing temporary variable names", function () {
    const compiler = createCompiler();

    assert.equals(compiler._newVar(), "__jazz_var0");
    assert.equals(compiler._newVar(), "__jazz_var1");
  });

  it("should compile each expression type", function () {
    const compiler = createCompiler();

    assert.equals(compiler._compileExpr(new ast.Ident("name")), "name");
    assert.equals(
      compiler._compileExpr(
        new ast.GetAttr(new ast.Ident("user"), new ast.Ident("name")),
      ),
      "(user).name",
    );
    assert.equals(
      compiler._compileExpr(
        new ast.GetAttr(new ast.Ident("user"), new ast.Str("name"), true),
      ),
      '(user)["name"]',
    );
    assert.equals(
      compiler._compileExpr(
        new ast.And(new ast.Ident("a"), new ast.Ident("b")),
      ),
      "((a) && (b))",
    );
    assert.equals(
      compiler._compileExpr(new ast.Or(new ast.Ident("a"), new ast.Ident("b"))),
      "((a) || (b))",
    );
    assert.equals(
      compiler._compileExpr(new ast.Not(new ast.Ident("a"))),
      "(!(a))",
    );
    assert.equals(
      compiler._compileExpr(
        new ast.BinOp(new ast.Num("1"), new ast.Num("2"), "=="),
      ),
      "((1)==(2))",
    );
    assert.equals(
      compiler._compileExpr(new ast.Str('a\n\r\t"b')),
      '"a\\n\\r\\t\\"b"',
    );
    assert.equals(compiler._compileExpr(new ast.Num("7")), "7");
    assert.equals(compiler._compileExpr(new ast.Bool("true")), "true");
    assert.equals(
      compiler._compileExpr(new ast.Empty(new ast.Ident("value"))),
      "(!value || (value instanceof Array && value.length == 0))",
    );
    assert.equals(
      compiler._compileExpr(
        new ast.Hash([
          [new ast.Str("a"), new ast.Num("1")],
          [new ast.Str("b"), new ast.Num("2")],
        ]),
      ),
      '{"a":1,"b":2}',
    );
    assert.equals(
      compiler._compileExpr(
        new ast.SyncCall(new ast.Ident("fn"), [
          new ast.Num("1"),
          new ast.Num("2"),
        ]),
      ),
      "(fn)(1, 2)",
    );
    assert.equals(
      compiler._compileExpr(
        new ast.GetArr(new ast.Ident("arr"), new ast.Num("0")),
      ),
      "(arr)[0]",
    );
  });

  it("should throw compile error for unknown expression", function () {
    const compiler = createCompiler();

    assert.exception(
      function () {
        compiler._compileExpr({ row: 3, col: 4, unknown: true });
      },
      function (err) {
        assert.isTrue(err instanceof CompileError);
        assert.isTrue(err.message.indexOf("unknown expression type") > -1);
        return true;
      },
    );
  });

  it("should throw compile error for unknown statement", function () {
    const compiler = createCompiler();

    assert.exception(
      function () {
        compiler._compileStatement({ row: 1, col: 2, type: "mystery" });
      },
      function (err) {
        assert.isTrue(err instanceof CompileError);
        assert.equals(err.message, "unknown statement type: mystery");
        return true;
      },
    );
  });
});
