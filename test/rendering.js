"use strict";

import referee from "@sinonjs/referee";

import { renderTemplate, renderTemplateWithEval } from "./helpers/render.js";

const assert = referee.assert;

describe("jazz - rendering", function () {
  it("should return plain text when template has no expressions", async function () {
    const output = await renderTemplate("Hello, World");
    assert.equals(output, "Hello, World");
  });

  it("should interpolate variables from namespace", async function () {
    const output = await renderTemplate("Hello, {name}", { name: "Tom" });
    assert.equals(output, "Hello, Tom");
  });

  it("should resolve nested object attributes", async function () {
    const output = await renderTemplate("{user.name}", {
      user: { name: "Tom" },
    });
    assert.equals(output, "Tom");
  });

  it("should keep line breaks and carriage returns", async function () {
    const source = "Hey,\nNice socks. Mind if I borrow them?\n\r";
    const output = await renderTemplate(source);
    assert.equals(output, source);
  });

  it("should keep quotes in output", async function () {
    const output = await renderTemplate("Testing \"Quotes\" y'see");
    assert.equals(output, "Testing \"Quotes\" y'see");
  });

  it("should render literal braces expression", async function () {
    const output = await renderTemplate("{{}}");
    assert.equals(output, "{}");
  });

  it("should support eval alias for backward compatibility", async function () {
    const output = await renderTemplateWithEval("Hello, {name}", { name: "Bob" });
    assert.equals(output, "Hello, Bob");
  });
});
