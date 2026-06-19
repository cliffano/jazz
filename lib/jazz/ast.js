"use strict";

/**
 * Render an array of AST values using each value's toString output.
 *
 * @param {Array<*>} arr: values to stringify
 * @returns {string} array representation for debug output
 */
function arrayToString(arr) {
  return `[${arr
    .map((item) => {
      return item ? item.toString() : "undefined";
    })
    .join(", ")}]`;
}

/**
 * AST root wrapping parsed template body and discovered globals.
 */
class AST {
  /**
   * Create an AST root.
   *
   * @param {Suite} root: root suite node
   * @param {Array<string>} globals: discovered global variable names
   */
  constructor(root, globals) {
    this.root = root;
    this.globals = globals;
  }

  toString() {
    return `AST(globals=${arrayToString(this.globals)}, ${this.root.toString()})`;
  }
}

/**
 * Statement suite containing zero or more child statements.
 */
class Suite {
  /**
   * Create a suite node.
   *
   * @param {Array<*>} body: statement nodes
   */
  constructor(body) {
    this.type = "jazz.ast.Suite";
    this.body = body;
  }

  toString() {
    return `Suite(${this.body.map((stmt) => stmt.toString()).join(", ")})`;
  }
}

/**
 * Identifier expression.
 */
class Ident {
  /**
   * Create an identifier node.
   *
   * @param {string} name: identifier name
   */
  constructor(name) {
    this.type = "jazz.ast.Ident";
    this.name = name;
  }

  toString() {
    return `Ident(${this.name})`;
  }
}

/**
 * If/elif/else statement node.
 */
class IfStmt {
  /**
   * Create an if statement node.
   *
   * @param {*} expr: condition expression
   * @param {Suite} suite: true branch suite
   * @param {*} [orelse]: else branch suite or chained if node
   */
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

/**
 * Foreach statement node.
 */
class ForEach {
  /**
   * Create a foreach statement node.
   *
   * @param {Ident} ident: loop variable identifier
   * @param {*} expr: iterable expression
   * @param {Suite} suite: loop body suite
   */
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

/**
 * Echo statement node.
 */
class Echo {
  /**
   * Create an echo statement node.
   *
   * @param {*} value: expression to output
   */
  constructor(value) {
    this.type = "jazz.ast.EchoStmt";
    this.value = value;
  }

  toString() {
    return `Echo(${this.value.toString()})`;
  }
}

/**
 * Attribute or index access expression node.
 */
class GetAttr {
  /**
   * Create an attribute access node.
   *
   * @param {*} expr: target expression
   * @param {*} id: attribute identifier or index expression
   * @param {boolean} [array]: true when array-style indexing is used
   */
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

/**
 * Async function call expression node.
 */
class Call {
  /**
   * Create a call expression node.
   *
   * @param {*} expr: callable expression
   * @param {Array<*>} args: call arguments
   */
  constructor(expr, args) {
    this.expr = expr;
    this.args = args;
  }

  toString() {
    return `Call(${this.id ? this.id.toString() : "undefined"}, ${arrayToString(this.args)})`;
  }
}

/**
 * String literal expression node.
 */
class Str {
  /**
   * Create a string literal node.
   *
   * @param {string} value: literal string value
   */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Str('${this.value.replace(/'/g, "\\'")}')`;
  }
}

/**
 * Number literal expression node.
 */
class Num {
  /**
   * Create a number literal node.
   *
   * @param {string|number} value: literal numeric value
   */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Num(${this.value})`;
  }
}

/**
 * Boolean literal expression node.
 */
class Bool {
  /**
   * Create a boolean literal node.
   *
   * @param {string|boolean} value: literal boolean value
   */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `Bool(${this.value})`;
  }
}

/**
 * Logical AND expression node.
 */
class And {
  /**
   * Create a logical AND node.
   *
   * @param {*} left: left expression
   * @param {*} right: right expression
   */
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  toString() {
    return `And(${this.left.toString()}, ${this.right.toString()})`;
  }
}

/**
 * Logical OR expression node.
 */
class Or {
  /**
   * Create a logical OR node.
   *
   * @param {*} left: left expression
   * @param {*} right: right expression
   */
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  toString() {
    return `Or(${this.left.toString()}, ${this.right.toString()})`;
  }
}

/**
 * Logical NOT expression node.
 */
class Not {
  /**
   * Create a logical NOT node.
   *
   * @param {*} expr: expression to negate
   */
  constructor(expr) {
    this.expr = expr;
  }

  toString() {
    return `Not(${this.expr.toString()})`;
  }
}

/**
 * Binary operation expression node.
 */
class BinOp {
  /**
   * Create a binary operation node.
   *
   * @param {*} left: left expression
   * @param {*} right: right expression
   * @param {string} op: operator string
   */
  constructor(left, right, op) {
    this.left = left;
    this.right = right;
    this.op = op;
  }

  toString() {
    return `BinOp(${this.left.toString()}, ${this.op}, ${this.right.toString()})`;
  }
}

/**
 * Empty-check expression node.
 */
class Empty {
  /**
   * Create an empty-check node.
   *
   * @param {*} expr: expression to evaluate for emptiness
   */
  constructor(expr) {
    this.expr = expr;
  }

  toString() {
    return `Empty(${this.expr.toString()})`;
  }
}

/**
 * Hash/object literal expression node.
 */
class Hash {
  /**
   * Create a hash literal node.
   *
   * @param {Array<Array<*>>} body: key-value pair expressions
   */
  constructor(body) {
    this.body = body;
  }

  toString() {
    return `Hash(${this.body
      .map((kv) => `${kv[0].toString()}:${kv[1].toString()}`)
      .join(", ")})`;
  }
}

/**
 * Synchronous function call expression node.
 */
class SyncCall {
  /**
   * Create a synchronous call node.
   *
   * @param {*} expr: callable expression
   * @param {Array<*>} args: call arguments
   */
  constructor(expr, args) {
    this.expr = expr;
    this.args = args;
  }

  toString() {
    return `SyncCall(${this.id ? this.id.toString() : "undefined"}, ${arrayToString(this.args)})`;
  }
}

/**
 * Array indexing expression node.
 */
class GetArr {
  /**
   * Create an array index access node.
   *
   * @param {*} expr: array expression
   * @param {*} index: index expression
   */
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
