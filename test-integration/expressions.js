"use strict";

import referee from "@sinonjs/referee";

import { renderTemplate } from "./helpers/render.js";

const assert = referee.assert;

describe("jazz - expressions", function () {
  it("should render string literal expressions", async function () {
    const output = await renderTemplate("{'test'}");
    assert.equals(output, "test");
  });

  it("should render number literal expressions", async function () {
    const output = await renderTemplate("{45}");
    assert.equals(output, "45");
  });

  it("should evaluate and expression to right-hand value", async function () {
    const output = await renderTemplate("{1 and 2}");
    assert.equals(output, "2");
  });

  it("should evaluate numeric equality expression", async function () {
    const output = await renderTemplate("{1 eq b}", { b: 1 });
    assert.equals(output, "true");
  });

  it("should evaluate greater-than comparison", async function () {
    const output = await renderTemplate("{1.5 gt b}", { b: 1.0 });
    assert.equals(output, "true");
  });

  it("should parse hexadecimal numbers in arithmetic calls", async function () {
    const output = await renderTemplate("{product(10, 0x0a)}", {
      product: function (a, b, cb) {
        cb(a * b);
      },
    });
    assert.equals(output, "100");
  });

  it("should evaluate combined boolean and comparison expression", async function () {
    const output = await renderTemplate(
      "{if a eq 'foo' and b eq 'bar'}{a},{b}{else}{a}{end}",
      {
        a: "foo",
        b: "bar",
      },
    );
    assert.equals(output, "foo,bar");
  });
});
