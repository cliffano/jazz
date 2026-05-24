"use strict";

import * as ast from "./ast.js";
import { SyntaxError } from "./error.js";
import * as tokens from "./tokens.js";

function inArray(value, arr) {
  return arr.indexOf(value) >= 0;
}

class Parser {
  constructor(scanner) {
    this.scanner = scanner;
    this.globals = [];
    this.debug = false;
    this.locals = [];
    this.localsStack = [];
  }

  peek() {
    if (this.nextToken) {
      return this.nextToken;
    }
    this.nextToken = this.scanner.next();
    return this.nextToken;
  }

  next() {
    if (!this.nextToken) {
      this.nextToken = this.scanner.next();
    }
    this.currentToken = this.nextToken;
    delete this.nextToken;
    return this.currentToken;
  }

  current() {
    return this.currentToken;
  }

  parse() {
    this.next();
    const suite = this._parseSuite();
    this._check(tokens.EOF);
    return new ast.AST(suite, this.globals);
  }

  _pushLocals() {
    this.localsStack.push(this.locals);
  }

  _popLocals() {
    this.locals = this.localsStack.pop();
  }

  _declareLocal(name) {
    if (!inArray(name, this.locals)) {
      this.locals.push(name);
    }
  }

  _declareGlobal(name) {
    if (!inArray(name, this.globals)) {
      this.globals.push(name);
    }
  }

  _isLocal(name) {
    return inArray(name, this.locals);
  }

  _syntaxError(tok, message) {
    throw new SyntaxError(this.scanner.filename, tok.row, tok.col, message);
  }

  _check(type) {
    const curr = this.current();
    if (curr.type !== type) {
      this._syntaxError(curr, `expected ${type}, but got ${curr.type}`);
    }
    return curr;
  }

  _expect(type) {
    this._check(type);
    return this.next();
  }

  _parseExpr() {
    let result = this._parseComparisonExpr();
    if (this.current().type === tokens.AND) {
      this.next();
      result = new ast.And(result, this._parseExpr());
    } else if (this.current().type === tokens.OR) {
      this.next();
      result = new ast.Or(result, this._parseExpr());
    }
    return result;
  }

  _parseComparisonExpr() {
    let result = this._parseSimpleExpr();

    if (this.current().type === tokens.EQ) {
      this.next();
      result = new ast.BinOp(result, this._parseComparisonExpr(), "==");
    } else if (this.current().type === tokens.NEQ) {
      this.next();
      result = new ast.BinOp(result, this._parseComparisonExpr(), "!=");
    } else if (this.current().type === tokens.GT) {
      this.next();
      result = new ast.BinOp(result, this._parseComparisonExpr(), ">");
    }

    return result;
  }

  _parseSimpleExpr() {
    let result;

    if (this.current().type === tokens.NOT) {
      this.next();
      result = new ast.Not(this._parseSimpleExpr());
    } else if (this.current().type === "(") {
      this.next();
      result = this._parseExpr();
      this._expect(")");
    } else if (this.current().type === "{") {
      this.next();
      result = this._parseHash();
      this._expect("}");
    } else if (this.current().type === "@") {
      this.next();
      const expr = this._parseExpr();
      this.next();
      const args = this._parseArgumentList();
      this._expect(")");
      result = new ast.SyncCall(expr, args);
    } else if (this.current().type === tokens.IDENT) {
      result = this._parseIdent();
      if (!this._isLocal(result.name)) {
        this._declareGlobal(result.name);
      }
      result = this._parseGetAttrList(result);
    } else if (this.current().type === tokens.STR) {
      const stringToken = this._check(tokens.STR);
      this.next();
      result = new ast.Str(stringToken.value);
    } else if (this.current().type === tokens.NUM) {
      const numberToken = this._check(tokens.NUM);
      this.next();
      result = new ast.Num(numberToken.value);
    } else if (this.current().type === tokens.BOOL) {
      const boolToken = this._check(tokens.BOOL);
      this.next();
      result = new ast.Bool(boolToken.value);
    } else if (this.current().type === tokens.EMPTY) {
      this.next();
      result = new ast.Empty(this._parseSimpleExpr());
    } else {
      this._syntaxError(
        this.current(),
        `expected expression, but got ${this.current().type}`,
      );
    }

    return result;
  }

  _parseGetAttrList(expr) {
    let result = expr;

    while (this.current().type === "." || this.current().type === "[") {
      switch (this.current().type) {
        case ".":
          this.next();
          result = new ast.GetAttr(result, this._parseIdent());
          break;
        case "[":
          this.next();
          result = new ast.GetAttr(result, this._parseSimpleExpr(), true);
          this._expect("]");
          break;
        default:
      }
    }

    return result;
  }

  _parseHash() {
    const body = [];

    while (this.current().type !== "}") {
      const key = this._parseSimpleExpr();
      this._expect(":");
      const value = this._parseExpr();
      body.push([key, value]);
      if (this.current().type === ",") {
        this.next();
      }
    }

    return new ast.Hash(body);
  }

  _parseIdent() {
    const identToken = this._check(tokens.IDENT);
    this.next();
    return new ast.Ident(identToken.value);
  }

  _parseSuite() {
    const body = [];
    let more = true;

    while (more) {
      const curr = this.current();
      switch (curr.type) {
        case tokens.IF:
          body.push(this._parseIfStmt());
          break;
        case tokens.ECHO:
          body.push(this._parseEcho());
          break;
        case tokens.IDENT:
        case tokens.NUM:
        case tokens.STR:
        case tokens.BOOL:
        case tokens.NOT:
        case "(":
        case "@":
          body.push(this._parseEchoExpr());
          break;
        case tokens.FOREACH:
          body.push(this._parseForEach());
          break;
        default:
          more = false;
      }
    }

    return new ast.Suite(body);
  }

  _parseIfStmt() {
    this._expect(tokens.IF);
    const expr = this._parseExpr();
    const suite = this._parseSuite();
    const root = new ast.IfStmt(expr, suite);
    let ref = root;

    while (this.current().type === tokens.ELIF) {
      this._expect(tokens.ELIF);
      ref.orelse = new ast.IfStmt(this._parseExpr(), this._parseSuite());
      ref = ref.orelse;
    }

    if (this.current().type === tokens.ELSE) {
      this._expect(tokens.ELSE);
      ref.orelse = this._parseSuite();
    }

    this._expect(tokens.END);
    return root;
  }

  _parseEcho() {
    const value = this._check(tokens.ECHO).value;
    this.next();
    return new ast.Echo(new ast.Str(value));
  }

  _parseEchoExpr() {
    const result = this._parseExpr();
    if (this.current().type === "(") {
      this.next();
      const args = this._parseArgumentList();
      this._expect(")");
      return new ast.Call(result, args);
    }

    return new ast.Echo(this._parseGetAttrList(result));
  }

  _parseArgumentList() {
    if (this.current().type === ")") {
      return [];
    }

    const args = [];
    for (;;) {
      const expr = this._parseExpr();
      args.push(expr);
      if (this.current().type !== ",") {
        break;
      }
      this.next();
    }

    return args;
  }

  _parseForEach() {
    this._pushLocals();
    this._expect(tokens.FOREACH);
    const ident = this._parseIdent();
    this._declareLocal(ident.name);
    this._expect(tokens.IN);
    const expr = this._parseExpr();
    const suite = this._parseSuite();
    this._expect(tokens.END);
    this._popLocals();
    return new ast.ForEach(ident, expr, suite);
  }
}

function createParser(scanner) {
  return new Parser(scanner);
}

export { Parser, createParser };

export default {
  Parser,
  createParser,
};