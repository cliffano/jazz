import jazz from "jazz";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = fs.readFileSync(__dirname + "/letter.jazz", "utf8");
const template = jazz.compile(data);
template.eval(
  {
    recipient: "Tom",
    friendly: true,
    amount: "200.00",
    company: "Gimme, Inc.",
  },
  function (data) {
    console.log(data);
  },
);
