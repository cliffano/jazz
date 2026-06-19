"use strict";

/**
 * Syntax error raised during template scanning or parsing.
 */
class SyntaxError extends Error {
  /**
   * Create a syntax error.
   *
   * @param {string} filename: template filename
   * @param {number|string} row: source row number
   * @param {number|string} col: source column number
   * @param {string} message: syntax error details
   */
  constructor(filename, row, col, message) {
    super(message);
    this.name = "SyntaxError";
    this.filename = filename;
    this.row = row || "?";
    this.col = col || "?";
  }

  /**
   * Format this syntax error into a readable location-prefixed string.
   *
   * @returns {string} formatted error string
   */
  toString() {
    return `${this.filename}:${this.row.toString()}:${this.col.toString()}: ${this.message}`;
  }
}

export { SyntaxError };

export default {
  SyntaxError,
};
