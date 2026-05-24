"use strict";

function arrayToString(arr) {
  return `[${arr
    .map((item) => {
      return item ? item.toString() : "undefined";
    })
    .join(", ")}]`;
}

class AST {
  constructor(root, globals) {
    this.root = root;
    this.globals = globals;
  }

  toString() {
    return `AST(globals=${arrayToString(this.globals)}, ${this.root.toString()})`;
  }
}

class Suite {
  constructor(body) {
    this.type = "jazz.ast.Suite";
    this.body = body;
  }

  toString() {
    return `Suite(${this.body.map((stmt) => stmt.toString()).join(", ")})`;
  }
}

class Ident {
  constructor(name) {
    this.type = "jazz.ast.Ident";
    this.name = name;
  }

  toString() {
    return `Ident(${this.name})`;
  }
}

class IfStmt {
  constructor(expr, suite, orelse) {
    this.type = "jazz.ast.IfStmt";
    this.expr = expr;
    this.suite = suite;
    this.orelse = orelse;
  }

  toString() {
    return `IfStmt(${this.expr.toString()}, ${this.suite.toString()}, ${this.orelse ? this.orelse.toString() : "null"})`;
  }
}

class ForEach {
  constructor(ident, expr, suite) {
    this.type = "jazz.ast.ForEach";
    this.ident = ident;
    this.expr = expr;
    this.suite = suite;
  }

  toString() {
    return `ForEach(${this.ident.toString()}, ${this.expr.toString()}, ${this.suite.toString()})`;
  }
}

class Echo {
  constructor(value) {
    this.type = "jazz.ast.EchoStmt";
    this.value = value;
  }

  toString() {
    return `Echo(${this.value.toString()})`;
  }
}

class GetAttr {
  constructor(expr, id, array) {
    this.expr = expr;
    this.id = id;
    this.array = array;
  }

  toString() {
    const id = this.array ? `[${this.id.toString()}]` : this.id.toString();
    return `GetAttr(${this.expr.toString()}, ${id})`;
  }
}

class Call {
  constructor(expr, args) {
    this.expr = expr;
    this.args = args;
  }

  toString() {
    return `Call(${this.id ? this.id.toString() : "undefined"}, ${arrayToString(this.args)})`;
  }
}

class Str {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Str('${this.value.replace(/'/g, "\\'")}')`;
  }
}

class Num {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Num(${this.value})`;
  }
}

class Bool {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Bool(${this.value})`;
  }
}

class And {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  toString() {
    return `And(${this.left.toString()}, ${this.right.toString()})`;
  }
}

class Or {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  toString() {
    return `Or(${this.left.toString()}, ${this.right.toString()})`;
  }
}

class Not {
  constructor(expr) {
    this.expr = expr;
  }

  toString() {
    return `Not(${this.expr.toString()})`;
  }
}

class BinOp {
  constructor(left, right, op) {
    this.left = left;
    this.right = right;
    this.op = op;
  }

  toString() {
    return `BinOp(${this.left.toString()}, ${this.op}, ${this.right.toString()})`;
  }
}

class Empty {
  constructor(expr) {
    this.expr = expr;
  }

  toString() {
    return `Empty(${this.expr.toString()})`;
  }
}

class Hash {
  constructor(body) {
    this.body = body;
  }

  toString() {
    return `Hash(${this.body
      .map((kv) => `${kv[0].toString()}:${kv[1].toString()}`)
      .join(", ")})`;
  }
}

class SyncCall {
  constructor(expr, args) {
    this.expr = expr;
    this.args = args;
  }

  toString() {
    return `SyncCall(${this.id ? this.id.toString() : "undefined"}, ${arrayToString(this.args)})`;
  }
}

class GetArr {
  constructor(expr, index) {
    this.expr = expr;
    this.index = index;
    this.value = this;
  }

  toString() {
    return `GetArr(${this.expr.toString()}, ${this.index.toString()})`;
  }
}

export {
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
};

export default {
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
};
