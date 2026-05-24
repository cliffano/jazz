"use strict";

/**
 * Syntax error raised during template scanning or parsing.
 */
class SyntaxError extends Error {
  constructor(filename, row, col, message) {
    super(message);
    this.name = "SyntaxError";
    this.filename = filename;
    this.row = row || "?";
    this.col = col || "?";
  }

  toString() {
    return `${this.filename}:${this.row.toString()}:${this.col.toString()}: ${this.message}`;
  }
}

export { SyntaxError };

export default {
  SyntaxError,
};

