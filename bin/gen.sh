#!/bin/sh

echo "Generating..."

quicktype \
  --src examples/ts/config/plan.json \
  --src-lang json \
  --lang ts \
  --raw-type any \
  --nice-property-names \
  --acronym-style lowerCase \
  --out src/schemas/plan.ts
#     "gen": "quicktype --src examples/ts/config/variables.json --src-lang json --lang ts --raw-type any --nice-property-names --acronym-style lowerCase --out examples/ts/src/imono/schemas/variables.ts"

prettier --write src/schemas