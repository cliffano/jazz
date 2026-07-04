import jazz from "../lib/jazz";
import fs from "fs";

const data = fs.readFileSync(__dirname + "/foreach.jazz", "utf8");
const template = jazz.compile(data);
template.eval({"people": ["Tom", "Danny", "Steve"]}, function(data) { console.log(data); });
