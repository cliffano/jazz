import jazz from "jazz";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = fs.readFileSync(__dirname + "/html.jazz", "utf8");
const template = jazz.compile(data);

template.eval({ username: "" }, function (data) {
  console.log(data);
});

template.eval(
  {
    errors: ["Invalid username", "Please try again"],
    username: "bert",
  },
  function (data) {
    console.log(data);
  },
);
