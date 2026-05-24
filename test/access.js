"use strict";

import referee from "@sinonjs/referee";

import { renderTemplate } from "./helpers/render.js";

const assert = referee.assert;

class Muffin {
  constructor(numberOfBites) {
    this._numberOfBites = numberOfBites;
  }

  get numberOfBites() {
    return this._numberOfBites;
  }
}

describe("jazz - access", function () {
  it("should resolve object getter properties", async function () {
    const output = await renderTemplate("{muffin.numberOfBites}", {
      muffin: new Muffin(5),
    });
    assert.equals(output, "5");
  });

  it("should access array by numeric index", async function () {
    const output = await renderTemplate("{array[0]}", {
      array: ["one"],
    });
    assert.equals(output, "one");
  });

  it("should access nested array value", async function () {
    const output = await renderTemplate("{array[0][1]}", {
      array: [["one", ["two"]]],
    });
    assert.equals(output, "two");
  });

  it("should access array via nested object path", async function () {
    const output = await renderTemplate("{obj.array[0]}", {
      obj: { array: ["one"] },
    });
    assert.equals(output, "one");
  });

  it("should access array using variable index", async function () {
    const output = await renderTemplate("{array[obj.prop]}", {
      array: ["one", "two"],
      obj: { prop: 1 },
    });
    assert.equals(output, "two");
  });

  it("should access object property using string key", async function () {
    const output = await renderTemplate("{array['text prop']}", {
      array: { "text prop": "two" },
    });
    assert.equals(output, "two");
  });

  it("should access object property using expression key", async function () {
    const output = await renderTemplate("{array[abba]}", {
      array: { "text prop": "two" },
      abba: "text prop",
    });
    assert.equals(output, "two");
  });

  it("should chain expression key with attribute access", async function () {
    const output = await renderTemplate("{array[abba].eye}", {
      array: { "text prop": { eye: "two" } },
      abba: "text prop",
    });
    assert.equals(output, "two");
  });

  it("should access array using nested index expression", async function () {
    const output = await renderTemplate("{array[obj.prop[1]]}", {
      array: ["one", "two"],
      obj: { prop: [0, 1] },
    });
    assert.equals(output, "two");
  });

  it("should access property named end", async function () {
    const output = await renderTemplate("{pagination.end}", {
      pagination: { end: "This shouldn't be picked up as a token" },
    });
    assert.equals(output, "This shouldn't be picked up as a token");
  });
});
