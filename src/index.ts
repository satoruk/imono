import YAML from 'yaml';
import fs from "fs";

import { Convert, Index } from "./models/foo";

const raw = fs.readFileSync('Pokedex.json', 'utf8');
const data = YAML.parse(raw)

const index = Convert.toIndex(data);
//    public static toIndex(json: string): Index {
//    public static toIndex(json: any): Index {
//        return cast(JSON.parse(json), r("Index"));
//        return cast(json, r("Index"));
//    }
// console.log(index)