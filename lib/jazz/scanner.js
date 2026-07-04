"use strict";

import * as tokens from "./tokens.js";
import { SyntaxError } from "./error.js";

const STATE_ECHO = 0;
const STATE_CODE = 1;

/**
 * Determine whether a character is a valid identifier character.
 *
 * @param {string|undefined} char: character to evaluate
 * @returns {boolean} true when character is valid for identifiers
 */
function isIdentChar(char) {
  if (typeof char === "undefined") {
    return false;
  }

  return (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    (char >= "0" && char <= "9") ||
    char === "_"
  );
}

/**
 * Check if source at index starts with a keyword boundary.
 *
 * @param {string} name: keyword name
 * @param {string} source: source string
 * @param {number} index: source offset
 * @returns {boolean} true when a full keyword match is found
 */
function keyword(name, source, index) {
  let cursor = index;

  if (source[cursor - 1] === ".") {
    return false;
  }

  while (cursor < source.length && cursor - index < name.length) {
    if (source[cursor] !== name[cursor - index]) {
      return false;
    }
    cursor += 1;
  }

  return !isIdentChar(source[cursor]);
}

/**
 * Parse an identifier token value from source.
 *
 * @param {string} source: source string
 * @param {number} index: source offset
 * @returns {string} parsed identifier
 */
function ident(source, index) {
  let result = "";
  let cursor = index;

  while (cursor < source.length) {
    if (isIdentChar(source[cursor])) {
      result += source[cursor];
      cursor += 1;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Parse a numeric token value from source.
 *
 * @param {string} source: source string
 * @param {number} index: source offset
 * @returns {string} parsed numeric literal text
 */
function num(source, index) {
  let isHex = false;
  let seenDecimal = false;
  let cursor = index;

  if (
    source.length >= index + 2 &&
    source[index] === "0" &&
    source[index + 1] === "x"
  ) {
    isHex = true;
    cursor += 2;
  }

  while (cursor < source.length) {
    if (source[cursor] >= "0" && source[cursor] <= "9") {
      cursor += 1;
    } else if (!isHex && !seenDecimal && source[cursor] === ".") {
      seenDecimal = true;
      cursor += 1;
    } else if (isHex) {
      if (
        (source[cursor] >= "a" && source[cursor] <= "f") ||
        (source[cursor] >= "A" && source[cursor] <= "F")
      ) {
        cursor += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return source.slice(index, cursor);
}

/**
 * Parse a quoted string token value from source.
 *
 * @param {string} source: source string
 * @param {number} index: source offset at opening quote
 * @returns {string} parsed string value
 */
function str(source, index) {
  let result = "";
  const quote = source[index];
  let escaped = false;
  let cursor = index + 1;

  while (cursor < source.length) {
    if (source[cursor] === quote) {
      return result;
    }

    if (!escaped && source[cursor] === "\\") {
      escaped = true;
      cursor += 1;
      continue;
    }

    if (escaped) {
      switch (source[cursor]) {
        case "\\":
          result += "\\";
          break;
        case "n":
          result += "\n";
          break;
        case "r":
          result += "\r";
          break;
        case "t":
          result += "\t";
          break;
        default:
          result += `\\${source[cursor]}`;
      }
      cursor += 1;
      escaped = false;
      continue;
    }

    result += source[cursor];
    cursor += 1;
  }

  return result;
}

/**
 * Scanner converting a Jazz template source string into tokens.
 */
class Scanner {
  /**
   * Create a scanner.
   *
   * @param {string} source: template source text
   * @param {string} [filename]: template filename for error reporting
   */
  constructor(source, filename) {
    this.source = source;
    this.pos = 0;
    this.filename = filename || "<unknown>";
    this.row = 1;
    this.col = 1;
    this.braceLevel = 0;
    this.state = STATE_ECHO;
  }

  /**
   * Produce the next token from the source stream.
   *
   * @returns {Object} token object with type and positional metadata
   */
  next() {
    if (this.state === STATE_ECHO) {
      return this._echoState();
    }

    return this._codeState();
  }

  _syntaxError(message) {
    throw new SyntaxError(this.filename, this.row, this.col, message);
  }

  _unexpectedToken(token, didYouMean) {
    const hint = didYouMean ? `, did you mean '${didYouMean}'` : "";
    return this._syntaxError(`unexpected token: '${token}'${hint}`);
  }

  _echoState() {
    const row = this.row;
    const col = this.col;
    let cursor = this.pos;
    const source = this.source;
    let value = "";

    const step = () => {
      cursor += 1;
      this.col += 1;
    };

    while (cursor < source.length) {
      if (source[cursor] === "{") {
        if (cursor + 1 < source.length && source[cursor + 1] === "{") {
          value += "{";
          step();
        } else {
          this.state = STATE_CODE;
          break;
        }
      } else if (source[cursor] === "}") {
        if (cursor + 1 < source.length && source[cursor + 1] === "}") {
          value += "}";
          step();
        } else {
          this._unexpectedToken(source[cursor]);
        }
      } else if (source[cursor] === "\n") {
        this.col = 0;
        this.row += 1;
        value += source[cursor];
      } else if (source[cursor] === "\\") {
        if (cursor + 1 < source.length) {
          switch (source[cursor + 1]) {
            case "n":
              value += "\n";
              break;
            case "r":
              value += "\r";
              break;
            case "t":
              value += "\t";
              break;
            case "\\":
              value += "\\";
              break;
            default:
              value += `\\${source[cursor + 1]}`;
          }
          step();
        } else {
          value += "\\";
        }
      } else {
        value += source[cursor];
      }

      step();
    }

    this.pos = cursor + 1;

    if (value.length > 0) {
      return this._makeToken(tokens.ECHO, value, { row, col });
    }

    if (this.pos >= source.length) {
      return this._makeToken(tokens.EOF);
    }

    return this.next();
  }

  _makeToken(type, attrs, options) {
    const row =
      options && typeof options.row !== "undefined" ? options.row : this.row;
    const col =
      options && typeof options.col !== "undefined" ? options.col : this.col;
    const result = { type, row, col };

    if (typeof attrs === "string") {
      result.value = attrs;
    } else if (attrs && typeof attrs === "object") {
      Object.keys(attrs).forEach((attr) => {
        if (Object.prototype.hasOwnProperty.call(attrs, attr)) {
          result[attr] = attrs[attr];
        }
      });
    }

    return result;
  }

  _codeState() {
    let cursor = this.pos;
    const source = this.source;
    let result;

    const step = (count = 1) => {
      cursor += count;
      this.col += count;
    };

    while (cursor < source.length) {
      if (source[cursor] === " " || source[cursor] === "\t") {
        step();
      } else if (source[cursor] === "{") {
        this.braceLevel += 1;
        result = this._makeToken("{");
        step();
        break;
      } else if (source[cursor] === "}" && this.braceLevel === 0) {
        this.state = STATE_ECHO;
        step();
        break;
      } else if (source[cursor] === "}") {
        this.braceLevel -= 1;
        result = this._makeToken("}");
        step();
        break;
      } else if (source[cursor] === "\n") {
        this.col = 1;
        this.row += 1;
        cursor += 1;
      } else if (source[cursor] === "(") {
        result = this._makeToken("(");
        step();
        break;
      } else if (source[cursor] === ")") {
        result = this._makeToken(")");
        step();
        break;
      } else if (source[cursor] === "[") {
        result = this._makeToken("[");
        step();
        break;
      } else if (source[cursor] === "]") {
        result = this._makeToken("]");
        step();
        break;
      } else if (source[cursor] === ",") {
        result = this._makeToken(",");
        step();
        break;
      } else if (source[cursor] === ".") {
        result = this._makeToken(".");
        step();
        break;
      } else if (source[cursor] === ":") {
        result = this._makeToken(":");
        step();
        break;
      } else if (source[cursor] === '"' || source[cursor] === "'") {
        const value = str(source, cursor);
        result = this._makeToken(tokens.STR, value);
        step(value.length + 2);
        break;
      } else if (source[cursor] >= "0" && source[cursor] <= "9") {
        const value = num(source, cursor);
        result = this._makeToken(tokens.NUM, value);
        step(value.length);
        break;
      } else if (source[cursor] === "@") {
        result = this._makeToken("@");
        step();
        break;
      } else if (keyword("if", source, cursor)) {
        result = this._makeToken(tokens.IF);
        step(2);
        break;
      } else if (keyword("elif", source, cursor)) {
        result = this._makeToken(tokens.ELIF);
        step(4);
        break;
      } else if (keyword("elsif", source, cursor)) {
        this._unexpectedToken("elsif", "elif");
      } else if (keyword("else", source, cursor)) {
        result = this._makeToken(tokens.ELSE);
        step(4);
        break;
      } else if (keyword("and", source, cursor)) {
        result = this._makeToken(tokens.AND);
        step(3);
        break;
      } else if (keyword("or", source, cursor)) {
        result = this._makeToken(tokens.OR);
        step(2);
        break;
      } else if (keyword("not", source, cursor)) {
        result = this._makeToken(tokens.NOT);
        step(3);
        break;
      } else if (keyword("eq", source, cursor)) {
        result = this._makeToken(tokens.EQ);
        step(2);
        break;
      } else if (keyword("neq", source, cursor)) {
        result = this._makeToken(tokens.NEQ);
        step(3);
        break;
      } else if (keyword("gt", source, cursor)) {
        result = this._makeToken(tokens.GT);
        step(2);
        break;
      } else if (keyword("foreach", source, cursor)) {
        result = this._makeToken(tokens.FOREACH);
        step(7);
        break;
      } else if (keyword("in", source, cursor)) {
        result = this._makeToken(tokens.IN);
        step(2);
        break;
      } else if (keyword("end", source, cursor)) {
        result = this._makeToken(tokens.END);
        step(3);
        break;
      } else if (keyword("empty", source, cursor)) {
        result = this._makeToken(tokens.EMPTY);
        step(5);
        break;
      } else if (keyword("true", source, cursor)) {
        result = this._makeToken(tokens.BOOL, "true");
        step(4);
        break;
      } else if (keyword("false", source, cursor)) {
        result = this._makeToken(tokens.BOOL, "false");
        step(5);
        break;
      } else if (
        (source[cursor] >= "a" && source[cursor] <= "z") ||
        (source[cursor] >= "A" && source[cursor] <= "Z") ||
        source[cursor] === "_"
      ) {
        const value = ident(source, cursor);
        result = this._makeToken(tokens.IDENT, value);
        step(value.length);
        break;
      } else {
        this._unexpectedToken(source[cursor]);
      }
    }

    this.pos = cursor;

    if (result) {
      return result;
    }

    if (this.pos >= source.length) {
      return this._makeToken(tokens.EOF);
    }

    return this.next();
  }
}

/**
 * Create a scanner instance from source input.
 *
 * @param {string} source: template source text
 * @param {string} [filename]: template filename for error reporting
 * @returns {Scanner} scanner instance
 */
function createScanner(source, filename) {
  return new Scanner(source, filename);
}

export { Scanner, createScanner };

export default {
  Scanner,
  createScanner,
};
