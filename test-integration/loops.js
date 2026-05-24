"use strict";

import referee from "@sinonjs/referee";

import { renderTemplate } from "./helpers/render.js";

const assert = referee.assert;

describe("jazz - foreach", function () {
  it("should iterate over arrays", async function () {
    const output = await renderTemplate("{foreach user in users}{user}\\n{end}", {
      users: ["tom", "ben", "stan"],
    });
    assert.equals(output, "tom\nben\nstan\n");
  });

  it("should iterate nested foreach blocks", async function () {
    const output = await renderTemplate(
      "{foreach i in outer}{i}\\n{foreach j in inner}  {j}\\n{end}{end}",
      { outer: [1, 2, 3], inner: [4, 5, 6] },
    );
    assert.equals(output, "1\n  4\n  5\n  6\n2\n  4\n  5\n  6\n3\n  4\n  5\n  6\n");
  });

  it("should iterate over object key-value pairs", async function () {
    const output = await renderTemplate(
      "{foreach smurfism in smurf}{smurfism.key} = {smurfism.value}\\n{end}",
      {
        smurf: {
          name: "Papa",
          age: 1123123,
          colour: "Blue",
        },
      },
    );
    assert.equals(output, "name = Papa\nage = 1123123\ncolour = Blue\n");
  });

  it("should expose __index for array iteration", async function () {
    const output = await renderTemplate(
      "{foreach a in sambuca}{__index}{end}{foreach a in sambuca}{__index}{end}",
      { sambuca: ["a", "b", "c"] },
    );
    assert.equals(output, "012012");
  });

  it("should expose __count for array iteration", async function () {
    const output = await renderTemplate(
      "{foreach a in sambuca}{__count}{end}{foreach a in sambuca}{__count}{end}",
      { sambuca: ["a", "b", "c"] },
    );
    assert.equals(output, "123123");
  });

  it("should keep trailing text outside foreach block", async function () {
    const output = await renderTemplate("{foreach a in sambuca}{a}{end}a", {});
    assert.equals(output, "a");
  });
});
