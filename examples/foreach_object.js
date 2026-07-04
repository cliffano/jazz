import jazz from "../lib/jazz";
import fs from "fs";

const data = fs.readFileSync(__dirname + "/foreach_object.jazz", "utf8");
const template = jazz.compile(data);
template.eval(
  {
    doc: {
      title: "First",
      content: "Some content",
    },
  },
  function (data) {
    console.log(data);
  },
);
