import jazz from "jazz";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = fs.readFileSync(__dirname + "/getattr.jazz", "utf8");
const template = jazz.compile(data);
template.eval(
  { user: { email_addresses: ["bob@foo.com", "bleh@blah.com"] } },
  function (data) {
    console.log(data);
  },
);
