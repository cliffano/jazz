import jazz from "../lib/jazz";
import fs from "fs";

const data = fs.readFileSync(__dirname + "/simple.jazz", "utf8");
const template = jazz.compile(data);
template.eval({}, function (data) {
  console.log(data);
});
