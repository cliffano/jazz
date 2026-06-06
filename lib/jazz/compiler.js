"use strict";

import events from "events";
import * as ast from "./ast.js";

class CompileError extends Error {
  constructor(filename, row, col, message) {
    super(message);
    this.name = "CompileError";
    this.filename = filename;
    this.row = row || "?";
    this.col = col || "?";
  }

  toString() {
    return `${this.filename}:${this.row.toString()}:${this.col.toString()}: ${this.message.toString()}`;
  }
}

class Program {
  constructor(fn, globals) {
    this.fn = fn;
    this.globals = globals;
  }

  // Kept for backward compatibility.
  eval(namespace, cb) {
    return this.process(namespace, cb);
  }

  process(namespace, cb) {
    const args = [cb].concat(this._namespaceToArgs(namespace));
    return this.fn.apply(this.fn, args);
  }

  _namespaceToArgs(namespace) {
    const args = [];
    for (let i = 0; i < this.globals.length; i += 1) {
      args.push(namespace[this.globals[i]]);
    }
    return args;
  }
}

class CompilerJS {
  constructor() {
    this.debug = false;
    this.nextVar = 0;
  }

  _prologue(globals) {
    let code = "";
    code += "(function() {\n";
    code += "var __jazz_cb = arguments[0];\n";
    code += "var __jazz_emitter = new events.EventEmitter();\n";
    code += "var __jazz_expected = 0;\n";
    code += "var __jazz_seen     = 0;\n";
    code += "var __jazz_output = [];\n";
    code += "var __jazz_ready = false;\n";
    code += "function __jazz_check_complete() {\n";
    code += "  if (__jazz_ready && __jazz_expected == __jazz_seen) {\n";
    code += "    __jazz_cb(__jazz_output.join(''));\n";
    code += "  }\n";
    code += "}\n";

    code += "__jazz_emitter.addListener('data', function(pos, chunk) {\n";
    code += "  __jazz_output[pos] = chunk;\n";
    code += "  __jazz_seen++;\n";
    code += "  __jazz_check_complete();\n";
    code += "});\n";

    for (let i = 0; i < globals.length; i += 1) {
      const argIndex = i + 1;
      code += `var ${globals[i]} = arguments[${argIndex}];\n`;
    }

    return code;
  }

  _epilogue() {
    let code = "";
    code += "__jazz_ready = true;\n";
    code += "__jazz_check_complete();\n";
    code += "})";
    return code;
  }

  compile(astRoot) {
    let code = this._prologue(astRoot.globals);
    code += this._compileSuite(astRoot.root);
    code += this._epilogue();
    return new Program(eval(code), astRoot.globals);
  }

  _newVar() {
    const name = `__jazz_var${this.nextVar}`;
    this.nextVar += 1;
    return name;
  }

  _compileSuite(suite) {
    let code = "{\n";
    for (let i = 0; i < suite.body.length; i += 1) {
      code += this._compileStatement(suite.body[i]);
    }
    code += "}\n";
    return code;
  }

  _compileStatement(stmt) {
    let code = "";

    if (stmt.constructor === ast.IfStmt) {
      code += this._compileIfStmt(stmt);
    } else if (stmt.constructor === ast.ForEach) {
      code += this._compileForEach(stmt);
    } else if (stmt.constructor === ast.Echo) {
      code += this._compileEcho(stmt);
    } else if (stmt.constructor === ast.Call) {
      code += this._compileCall(stmt);
    } else if (stmt.constructor === ast.Suite) {
      code += this._compileSuite(stmt);
    } else if (stmt.constructor === ast.GetArr) {
      code += this._compileEcho(stmt);
    } else {
      throw new CompileError(
        "!FIXME!",
        stmt.row,
        stmt.col,
        `unknown statement type: ${stmt.type}`,
      );
    }

    return code;
  }

  _compileEcho(stmt) {
    let code = "";
    const slotVar = this._newVar();
    code += `var ${slotVar} = __jazz_expected++;\n`;
    code += `__jazz_emitter.emit('data', ${slotVar}, ${this._compileExpr(stmt.value)});\n`;
    return code;
  }

  _compileCall(stmt) {
    let code = "";
    const slotVar = this._newVar();

    code += `var ${slotVar} = __jazz_expected++;\n`;
    code += `(${this._compileExpr(stmt.expr)})(`;
    for (let i = 0; i < stmt.args.length; i += 1) {
      code += this._compileExpr(stmt.args[i]);
      code += ", ";
    }
    code += `function(data) { __jazz_emitter.emit('data', ${slotVar}, data); });\n`;

    return code;
  }

  _compileIfStmt(stmt) {
    let code = "if (";
    code += this._compileExpr(stmt.expr);
    code += ") ";
    code += this._compileSuite(stmt.suite);
    if (stmt.orelse) {
      code += ` else ${this._compileStatement(stmt.orelse)}`;
    }
    return code;
  }

  _compileForEach(stmt) {
    const exprVar = this._newVar();
    const indexVar = this._newVar();
    const lengthVar = this._newVar();
    const countVar = this._newVar();
    let code = `var ${exprVar} = ${this._compileExpr(stmt.expr)};\n`;

    code += `if (${exprVar} instanceof Array) {\n`;
    code += `var ${lengthVar} = ${exprVar} ? ${exprVar}.length : 0;\n`;
    code += `for (var ${indexVar} = 0, ${countVar} = 1; ${indexVar} < ${lengthVar}; ${indexVar}++, ${countVar}++) `;
    code += "(function() {\n";
    code += `  var __index = ${indexVar};\n`;
    code += `  var __count = ${countVar};\n`;
    code += `  var ${stmt.ident.name} = ${exprVar}[${indexVar}];\n`;
    code += `  ${this._compileSuite(stmt.suite)}`;
    code += "})();\n";
    code += "}\n";

    code += "else {\n";
    code += `var ${countVar} = 1;\n`;
    code += `for (var ${indexVar} in ${exprVar}) `;
    code += "(function() {\n";
    code += `  if (${exprVar}.hasOwnProperty(${indexVar})) {\n`;
    code += `  var __index = ${indexVar};\n`;
    code += `  var __count = ${countVar};\n`;
    code += `  var ${stmt.ident.name} = {'key': __index, 'value': ${exprVar}[__index]};\n`;
    code += `  ${this._compileSuite(stmt.suite)}\n`;
    code += `  ${countVar}++;\n`;
    code += "  }\n";
    code += "})();\n";
    code += "}\n";

    return code;
  }

  _compileHash(hash) {
    let code = "{";
    const body = hash.body;

    for (let i = 0; i < body.length; i += 1) {
      const element = body[i];
      code += this._compileExpr(element[0]);
      code += ":";
      code += this._compileExpr(element[1]);
      if (i < body.length - 1) {
        code += ",";
      }
    }

    code += "}";
    return code;
  }

  _compileExpr(expr) {
    if (expr.constructor === ast.Ident) {
      return expr.name;
    }

    if (expr.constructor === ast.GetAttr) {
      if (expr.array) {
        return `(${this._compileExpr(expr.expr)})[${this._compileExpr(expr.id)}]`;
      }
      return `(${this._compileExpr(expr.expr)}).${this._compileExpr(expr.id)}`;
    }

    if (expr.constructor === ast.And) {
      return `((${this._compileExpr(expr.left)}) && (${this._compileExpr(expr.right)}))`;
    }

    if (expr.constructor === ast.Or) {
      return `((${this._compileExpr(expr.left)}) || (${this._compileExpr(expr.right)}))`;
    }

    if (expr.constructor === ast.Not) {
      return `(!(${this._compileExpr(expr.expr)}))`;
    }

    if (expr.constructor === ast.BinOp) {
      return `((${this._compileExpr(expr.left)})${expr.op}(${this._compileExpr(expr.right)}))`;
    }

    if (expr.constructor === ast.Str) {
      return `"${expr.value
        .replace(/\\/g, "\\\\")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t")
        .replace(/"/g, '\\"')}"`;
    }

    if (expr.constructor === ast.Num) {
      return expr.value;
    }

    if (expr.constructor === ast.Bool) {
      return expr.value;
    }

    if (expr.constructor === ast.Empty) {
      const compiledExpr = this._compileExpr(expr.expr);
      let statement = "(";
      statement += `!${compiledExpr} || `;
      statement += `(${compiledExpr} instanceof Array && ${compiledExpr}.length == 0)`;
      statement += ")";
      return statement;
    }

    if (expr.constructor === ast.Hash) {
      return this._compileHash(expr);
    }

    if (expr.constructor === ast.SyncCall) {
      let code = "";
      const argsLength = expr.args.length;
      code += `(${this._compileExpr(expr.expr)})(`;
      for (let i = 0; i < argsLength; i += 1) {
        code += this._compileExpr(expr.args[i]);
        if (i !== argsLength - 1) {
          code += ", ";
        }
      }
      code += ")";
      return code;
    }

    if (expr.constructor === ast.GetArr) {
      return `(${this._compileExpr(expr.expr)})[${this._compileExpr(expr.index)}]`;
    }

    throw new CompileError(
      "!FIXME!",
      expr.row,
      expr.col,
      `unknown expression type: ${JSON.stringify(expr)}`,
    );
  }
}

function createCompiler() {
  return new CompilerJS();
}

export { CompileError, Program, CompilerJS, createCompiler, events };

export default {
  CompileError,
  Program,
  CompilerJS,
  createCompiler,
};
