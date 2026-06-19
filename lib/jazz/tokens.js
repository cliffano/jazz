"use strict";

/** @type {string} */
const TOKEN_PREFIX = "jazz.tokens.";

/** @type {string} */
const ECHO = `${TOKEN_PREFIX}ECHO`;
/** @type {string} */
const IF = `${TOKEN_PREFIX}IF`;
/** @type {string} */
const ELIF = `${TOKEN_PREFIX}ELIF`;
/** @type {string} */
const ELSE = `${TOKEN_PREFIX}ELSE`;
/** @type {string} */
const FOREACH = `${TOKEN_PREFIX}FOREACH`;
/** @type {string} */
const IN = `${TOKEN_PREFIX}IN`;
/** @type {string} */
const AND = `${TOKEN_PREFIX}AND`;
/** @type {string} */
const OR = `${TOKEN_PREFIX}OR`;
/** @type {string} */
const NOT = `${TOKEN_PREFIX}NOT`;
/** @type {string} */
const IDENT = `${TOKEN_PREFIX}IDENT`;
/** @type {string} */
const END = `${TOKEN_PREFIX}END`;
/** @type {string} */
const STR = `${TOKEN_PREFIX}STR`;
/** @type {string} */
const NUM = `${TOKEN_PREFIX}NUM`;
/** @type {string} */
const BOOL = `${TOKEN_PREFIX}BOOL`;
/** @type {string} */
const EQ = `${TOKEN_PREFIX}EQ`;
/** @type {string} */
const NEQ = `${TOKEN_PREFIX}NEQ`;
/** @type {string} */
const GT = `${TOKEN_PREFIX}GT`;
/** @type {string} */
const EMPTY = `${TOKEN_PREFIX}EMPTY`;
/** @type {string} */
const EOF = "<eof>";

export {
  ECHO,
  IF,
  ELIF,
  ELSE,
  FOREACH,
  IN,
  AND,
  OR,
  NOT,
  IDENT,
  END,
  STR,
  NUM,
  BOOL,
  EQ,
  NEQ,
  GT,
  EMPTY,
  EOF,
};

export default {
  ECHO,
  IF,
  ELIF,
  ELSE,
  FOREACH,
  IN,
  AND,
  OR,
  NOT,
  IDENT,
  END,
  STR,
  NUM,
  BOOL,
  EQ,
  NEQ,
  GT,
  EMPTY,
  EOF,
};
