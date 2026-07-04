import jazz from "../lib/jazz";
import fs from "fs";

const data = fs.readFileSync(__dirname + "/filter.jazz", "utf8");
const template = jazz.compile(data);
template.eval({
  "h": function(s, cb) {
    cb(s.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  },
  "value": "<foo!>"
}, function(data) { console.log(data); });



