"use strict";

import referee from "@sinonjs/referee";

import { renderTemplate } from "./helpers/render.js";

const assert = referee.assert;

describe("jazz - conditionals", function () {
  it("should render if body when condition is true", async function () {
    const output = await renderTemplate("Hello, {if name}{name}{end}", {
      name: "Bob",
    });
    assert.equals(output, "Hello, Bob");
  });

  it("should skip if body when condition is false", async function () {
    const output = await renderTemplate("Hello, {if name}{name}{end}", {});
    assert.equals(output, "Hello, ");
  });

  it("should render else body when if condition is false", async function () {
    const output = await renderTemplate(
      "Hello, {if name}{name}{else}Anonymous{end}",
      {},
    );
    assert.equals(output, "Hello, Anonymous");
  });

  it("should render elif branch when primary condition is false", async function () {
    const output = await renderTemplate(
      "Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{else}Anonymous{end}",
      { lastName: "Lee" },
    );
    assert.equals(output, "Hello, Mr. Lee");
  });

  it("should evaluate multiple elif branches in order", async function () {
    const output = await renderTemplate(
      "Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{elif nickName}{nickName}{else}Anonymous{end}",
      { nickName: "Steve", lastName: "Lee" },
    );
    assert.equals(output, "Hello, Mr. Lee");
  });

  it("should evaluate empty operator for empty string", async function () {
    const output = await renderTemplate(
      "Hello, {if empty name}Anonymous{else}{name}{end}",
      { name: "" },
    );
    assert.equals(output, "Hello, Anonymous");
  });

  it("should evaluate not empty operator for non-empty array", async function () {
    const output = await renderTemplate(
      "Hello, {if not empty names}{flatten(names)}{else}Anonymous{end}",
      {
        names: ["Jim", "Joe"],
        flatten: function (names, cb) {
          cb(names[0] + names[1]);
        },
      },
    );
    assert.equals(output, "Hello, JimJoe");
  });

  it("should evaluate and/or precedence with parentheses", async function () {
    const output = await renderTemplate(
      "{if a and (b or c)}both{elif a}left{elif b or c}right{else}none{end}",
      { a: false, b: true, c: false },
    );
    assert.equals(output, "right");
  });

  it("should evaluate grouped expression with top-level or", async function () {
    const output = await renderTemplate(
      "{if (a and b) or c}either{else}neither{end}",
      { a: false, b: true, c: true },
    );
    assert.equals(output, "either");
  });

  it("should evaluate not unary operator", async function () {
    const output = await renderTemplate("{if not a}not a{else}a{end}", {
      a: false,
    });
    assert.equals(output, "not a");
  });

  it("should evaluate eq operator", async function () {
    const output = await renderTemplate("{if a eq 'test'}a{else}b{end}", {
      a: "test",
    });
    assert.equals(output, "a");
  });

  it("should evaluate neq operator", async function () {
    const output = await renderTemplate("{if a neq 'yes'}no :({else}yes :){end}", {
      a: "ffa",
    });
    assert.equals(output, "no :(");
  });

  it("should evaluate synchronous function calls in conditions", async function () {
    const output = await renderTemplate(
      "{if @thing('a') or @powpow.anotherthing('b')}blahblah{end}",
      {
        thing: function () {
          return false;
        },
        powpow: {
          anotherthing: function () {
            return true;
          },
        },
      },
    );
    assert.equals(output, "blahblah");
  });
});
