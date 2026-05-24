"use strict";

import referee from "@sinonjs/referee";

import astModule, {
  AST,
  Suite,
  Ident,
  IfStmt,
  Echo,
  ForEach,
  GetAttr,
  Call,
  SyncCall,
  Str,
  Num,
  Bool,
  Hash,
  Or,
  And,
  Not,
  Empty,
  BinOp,
  GetArr,
} from "../lib/jazz/ast.js";

const assert = referee.assert;

describe("ast - node toString", function () {
  it("should stringify every node type", function () {
    const rootSuite = new Suite([
      new Echo(new Str("hello")),
      new IfStmt(new Bool("true"), new Suite([]), null),
    ]);
    const tree = new AST(rootSuite, [new Ident("name"), null]);

    assert.equals(
      tree.toString(),
      "AST(globals=[Ident(name), undefined], Suite(Echo(Str('hello')), IfStmt(Bool(true), Suite(), null)))",
    );

    const foreach = new ForEach(
      new Ident("item"),
      new Ident("items"),
      new Suite([new Echo(new Ident("item"))]),
    );
    assert.equals(
      foreach.toString(),
      "ForEach(Ident(item), Ident(items), Suite(Echo(Ident(item))))",
    );

    const attr = new GetAttr(new Ident("user"), new Ident("name"));
    assert.equals(attr.toString(), "GetAttr(Ident(user), Ident(name))");

    const indexedAttr = new GetAttr(new Ident("user"), new Str("name"), true);
    assert.equals(
      indexedAttr.toString(),
      "GetAttr(Ident(user), [Str('name')])",
    );

    const call = new Call(new Ident("sum"), [new Num("1"), new Num("2")]);
    assert.equals(call.toString(), "Call(undefined, [Num(1), Num(2)])");
    call.id = new Ident("sum");
    assert.equals(call.toString(), "Call(Ident(sum), [Num(1), Num(2)])");

    const syncCall = new SyncCall(new Ident("sum"), [new Num("3")]);
    assert.equals(syncCall.toString(), "SyncCall(undefined, [Num(3)])");
    syncCall.id = new Ident("sync");
    assert.equals(syncCall.toString(), "SyncCall(Ident(sync), [Num(3)])");

    const hash = new Hash([
      [new Str("a"), new Num("1")],
      [new Str("b"), new Bool("false")],
    ]);
    assert.equals(
      hash.toString(),
      "Hash(Str('a'):Num(1), Str('b'):Bool(false))",
    );

    assert.equals(
      new And(new Ident("a"), new Ident("b")).toString(),
      "And(Ident(a), Ident(b))",
    );
    assert.equals(
      new Or(new Ident("a"), new Ident("b")).toString(),
      "Or(Ident(a), Ident(b))",
    );
    assert.equals(new Not(new Ident("a")).toString(), "Not(Ident(a))");
    assert.equals(new Empty(new Ident("a")).toString(), "Empty(Ident(a))");
    assert.equals(
      new BinOp(new Ident("a"), new Ident("b"), "==").toString(),
      "BinOp(Ident(a), ==, Ident(b))",
    );
    assert.equals(
      new GetArr(new Ident("arr"), new Num("0")).toString(),
      "GetArr(Ident(arr), Num(0))",
    );

    assert.equals(
      new IfStmt(new Bool("true"), new Suite([]), new Suite([])).toString(),
      "IfStmt(Bool(true), Suite(), Suite())",
    );
  });

  it("should expose node constructors in default export", function () {
    assert.same(astModule.AST, AST);
    assert.same(astModule.Suite, Suite);
    assert.same(astModule.Ident, Ident);
    assert.same(astModule.IfStmt, IfStmt);
    assert.same(astModule.Echo, Echo);
    assert.same(astModule.ForEach, ForEach);
    assert.same(astModule.GetAttr, GetAttr);
    assert.same(astModule.Call, Call);
    assert.same(astModule.SyncCall, SyncCall);
    assert.same(astModule.Str, Str);
    assert.same(astModule.Num, Num);
    assert.same(astModule.Bool, Bool);
    assert.same(astModule.Hash, Hash);
    assert.same(astModule.Or, Or);
    assert.same(astModule.And, And);
    assert.same(astModule.Not, Not);
    assert.same(astModule.Empty, Empty);
    assert.same(astModule.BinOp, BinOp);
    assert.same(astModule.GetArr, GetArr);
  });
});
