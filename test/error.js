"use strict";

import referee from "@sinonjs/referee";

import errorModule, { SyntaxError } from "../lib/jazz/error.js";

const assert = referee.assert;

describe("error - SyntaxError", function () {
  it("should set name location and message", function () {
    const err = new SyntaxError("file.jazz", 2, 5, "bad token");

    assert.equals(err.name, "SyntaxError");
    assert.equals(err.filename, "file.jazz");
    assert.equals(err.row, 2);
    assert.equals(err.col, 5);
    assert.equals(err.message, "bad token");
  });

  it("should use fallback location placeholders when row or col is missing", function () {
    const err = new SyntaxError("file.jazz", null, undefined, "oops");

    assert.equals(err.row, "?");
    assert.equals(err.col, "?");
    assert.equals(err.toString(), "file.jazz:?:?: oops");
  });

  it("should expose SyntaxError via default export", function () {
    assert.same(errorModule.SyntaxError, SyntaxError);
  });
});
