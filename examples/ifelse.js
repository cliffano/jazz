import jazz from "jazz";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = fs.readFileSync(__dirname + "/ifelse.jazz", "utf8");
const template = jazz.compile(data);

//
// Render the template three times with different inputs
//

template.eval(
  {
    firstVar: "MONKEYS!",
  },
  function (data) {
    console.log(data);
  },
);

template.eval(
  {
    secondVar: "GIBBONS!",
  },
  function (data) {
    console.log(data);
  },
);

template.eval({}, function (data) {
  console.log(data);
});
