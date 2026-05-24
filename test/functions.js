"use strict";

import referee from "@sinonjs/referee";

import { renderTemplate } from "./helpers/render.js";

const assert = referee.assert;

describe("jazz - functions", function () {
  it("should call asynchronous function without arguments", async function () {
    const output = await renderTemplate("{foo()}", {
      foo: function (cb) {
        cb("Hello!");
      },
    });
    assert.equals(output, "Hello!");
  });

  it("should call asynchronous function with one string argument", async function () {
    const output = await renderTemplate("{foo('a string')}", {
      foo: function (s, cb) {
        cb(s);
      },
    });
    assert.equals(output, "a string");
  });

  it("should call asynchronous function with multiple arguments", async function () {
    const output = await renderTemplate("{foo('bar','baz')}", {
      foo: function (a, b, cb) {
        cb(a + "=" + b);
      },
    });
    assert.equals(output, "bar=baz");
  });

  it("should call namespaced asynchronous function", async function () {
    const output = await renderTemplate("{math.sum(2, 5)}", {
      math: {
        sum: function (a, b, cb) {
          cb(a + b);
        },
      },
    });
    assert.equals(output, "7");
  });

  it("should render delayed asynchronous function results", async function () {
    const output = await renderTemplate("{delay(tv)}", {
      tv: 10,
      delay: function (tv, cb) {
        setTimeout(function () {
          cb("Done!");
        }, tv);
      },
    });
    assert.equals(output, "Done!");
  });

  it("should support html escaping via function", async function () {
    const output = await renderTemplate("{html(s)}", {
      s: "<lol>",
      html: function (s, cb) {
        cb(s.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      },
    });
    assert.equals(output, "&lt;lol&gt;");
  });

  it("should pass hash literals to functions", async function () {
    const output = await renderTemplate("{consumeMuffin({'jeepers': 'cool'})}", {
      consumeMuffin: function (hash, cb) {
        cb(hash.jeepers);
      },
    });
    assert.equals(output, "cool");
  });

  it("should pass nested hash literals to functions", async function () {
    const output = await renderTemplate(
      "{chokeMuffin({'oh wow': { 'this isnt cool at all': 'really isnt' }})}",
      {
        chokeMuffin: function (hash, cb) {
          cb(hash["oh wow"]["this isnt cool at all"]);
        },
      },
    );
    assert.equals(output, "really isnt");
  });

  it("should pass expression values inside hash literals", async function () {
    const output = await renderTemplate("{megaMuffin({'size':pewpew.maximum})}", {
      pewpew: { maximum: 5 },
      megaMuffin: function (hash, cb) {
        cb(hash.size);
      },
    });
    assert.equals(output, "5");
  });

  it("should call function with indexed expression and hash argument", async function () {
    const output = await renderTemplate(
      "{imafunction(array[abba], { something: array[abba] })}",
      {
        imafunction: function (one, two, cb) {
          cb(one + two.something);
        },
        array: { kno: "AA" },
        abba: "kno",
      },
    );
    assert.equals(output, "AAAA");
  });

  it("should render synchronous function output using @ in echo", async function () {
    const output = await renderTemplate("{@foo()}", {
      foo: function () {
        return "Hey!";
      },
    });
    assert.equals(output, "Hey!");
  });

  it("should evaluate synchronous function output in comparisons", async function () {
    const output = await renderTemplate("{if @blah('a', 'b') eq 'AB'}HI SIR{end}", {
      blah: function (first, second) {
        return first.toUpperCase() + second.toUpperCase();
      },
    });
    assert.equals(output, "HI SIR");
  });
});
