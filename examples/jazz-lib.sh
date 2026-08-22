#!/usr/bin/env bash
set -o errexit
set -o nounset

cd ../
npm link .
cd examples/

npm link jazz

printf "\n\n========================================\n"
printf "Run filter function:\n"
node filter.js

printf "\n\n========================================\n"
printf "Run foreach function:\n"
node foreach.js

printf "\n\n========================================\n"
printf "Run foreach_object function:\n"
node foreach_object.js

printf "\n\n========================================\n"
printf "Run getattr function:\n"
node getattr.js

printf "\n\n========================================\n"
printf "Run html function:\n"
node html.js

printf "\n\n========================================\n"
printf "Run ifelse function:\n"
node ifelse.js

printf "\n\n========================================\n"
printf "Run include function:\n"
node include.js

printf "\n\n========================================\n"
printf "Run letter function:\n"
node letter.js

printf "\n\n========================================\n"
printf "Run simple function:\n"
node simple.js
