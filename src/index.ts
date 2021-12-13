
import { Convert, Index } from "./models/foo";

import fs from "fs";

const rawdata = fs.readFileSync('Pokedex.json', 'utf8');
const index = Convert.toIndex(rawdata);
console.log(index)