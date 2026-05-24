"use strict";

import referee from "@sinonjs/referee";

import tokenMap, {
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
} from "../lib/jazz/tokens.js";

const assert = referee.assert;

describe("tokens - constants", function () {
  it("should expose all token constants as namespaced values", function () {
    assert.equals(ECHO, "jazz.tokens.ECHO");
    assert.equals(IF, "jazz.tokens.IF");
    assert.equals(ELIF, "jazz.tokens.ELIF");
    assert.equals(ELSE, "jazz.tokens.ELSE");
    assert.equals(FOREACH, "jazz.tokens.FOREACH");
    assert.equals(IN, "jazz.tokens.IN");
    assert.equals(AND, "jazz.tokens.AND");
    assert.equals(OR, "jazz.tokens.OR");
    assert.equals(NOT, "jazz.tokens.NOT");
    assert.equals(IDENT, "jazz.tokens.IDENT");
    assert.equals(END, "jazz.tokens.END");
    assert.equals(STR, "jazz.tokens.STR");
    assert.equals(NUM, "jazz.tokens.NUM");
    assert.equals(BOOL, "jazz.tokens.BOOL");
    assert.equals(EQ, "jazz.tokens.EQ");
    assert.equals(NEQ, "jazz.tokens.NEQ");
    assert.equals(GT, "jazz.tokens.GT");
    assert.equals(EMPTY, "jazz.tokens.EMPTY");
    assert.equals(EOF, "<eof>");
  });

  it("should expose constants in default export", function () {
    assert.equals(tokenMap.ECHO, ECHO);
    assert.equals(tokenMap.IF, IF);
    assert.equals(tokenMap.ELIF, ELIF);
    assert.equals(tokenMap.ELSE, ELSE);
    assert.equals(tokenMap.FOREACH, FOREACH);
    assert.equals(tokenMap.IN, IN);
    assert.equals(tokenMap.AND, AND);
    assert.equals(tokenMap.OR, OR);
    assert.equals(tokenMap.NOT, NOT);
    assert.equals(tokenMap.IDENT, IDENT);
    assert.equals(tokenMap.END, END);
    assert.equals(tokenMap.STR, STR);
    assert.equals(tokenMap.NUM, NUM);
    assert.equals(tokenMap.BOOL, BOOL);
    assert.equals(tokenMap.EQ, EQ);
    assert.equals(tokenMap.NEQ, NEQ);
    assert.equals(tokenMap.GT, GT);
    assert.equals(tokenMap.EMPTY, EMPTY);
    assert.equals(tokenMap.EOF, EOF);
  });
});
