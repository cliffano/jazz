"use strict";

import jazz from "../../lib/jazz.js";

function renderTemplate(source, params, options) {
  const template = jazz.compile(source, options || {});
  return new Promise((resolve) => {
    template.process(params || {}, function (output) {
      resolve(output);
    });
  });
}

function renderTemplateWithEval(source, params, options) {
  const template = jazz.compile(source, options || {});
  return new Promise((resolve) => {
    template.eval(params || {}, function (output) {
      resolve(output);
    });
  });
}

export { renderTemplate, renderTemplateWithEval };
