import jazz from "../lib/jazz";
import fs from "fs";

const data = fs.readFileSync(__dirname + "/getattr.jazz", "utf8");
const template = jazz.compile(data);
template.eval(
  { user: { email_addresses: ["bob@foo.com", "bleh@blah.com"] } },
  function (data) {
    console.log(data);
  },
);
