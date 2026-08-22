import jazz from "jazz";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = fs.readFileSync(__dirname + "/foreach.jazz", "utf8");
const template = jazz.compile(data);
template.eval({ people: ["Tom", "Danny", "Steve"] }, function (data) {
  console.log(data);
});
