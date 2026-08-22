import jazz from "jazz";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = fs.readFileSync(__dirname + "/include_main.jazz", "utf8");
const template = jazz.compile(data);
const params = {
  include: function (filename, cb) {
    const tpl = jazz.compile(
      fs.readFileSync(__dirname + "/" + filename, "utf8"),
    );
    tpl.eval(params, cb);
  },
};

template.eval(params, function (data) {
  console.log(data);
});
