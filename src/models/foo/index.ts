// To parse this data:
//
//   import { Convert, Index } from "./file";
//
//   const index = Convert.toIndex(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Index {
    pokemon: Pokemon[];
}

export interface Pokemon {
    id:             number;
    num:            string;
    name:           string;
    img:            string;
    type:           Type[];
    height:         string;
    weight:         string;
    candy:          string;
    candyCount?:    number;
    egg:            Egg;
    spawnChance:    number;
    avgSpawns:      number;
    spawnTime:      string;
    multipliers:    number[] | null;
    weaknesses:     Type[];
    nextEvolution?: Evolution[];
    prevEvolution?: Evolution[];
}

export enum Egg {
    NotInEggs = "Not in Eggs",
    OmanyteCandy = "Omanyte Candy",
    The10km = "10 km",
    The2km = "2 km",
    The5km = "5 km",
}

export interface Evolution {
    num:  string;
    name: string;
}

export enum Type {
    Bug = "Bug",
    Dark = "Dark",
    Dragon = "Dragon",
    Electric = "Electric",
    Fairy = "Fairy",
    Fighting = "Fighting",
    Fire = "Fire",
    Flying = "Flying",
    Ghost = "Ghost",
    Grass = "Grass",
    Ground = "Ground",
    Ice = "Ice",
    Normal = "Normal",
    Poison = "Poison",
    Psychic = "Psychic",
    Rock = "Rock",
    Steel = "Steel",
    Water = "Water",
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toIndex(json: any): Index {
        return cast(json, r("Index"));
    }

    public static indexToJson(value: Index): any {
        return uncast(value, r("Index"));
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Index": o([
        { json: "pokemon", js: "pokemon", typ: a(r("Pokemon")) },
    ], false),
    "Pokemon": o([
        { json: "id", js: "id", typ: 0 },
        { json: "num", js: "num", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "img", js: "img", typ: "" },
        { json: "type", js: "type", typ: a(r("Type")) },
        { json: "height", js: "height", typ: "" },
        { json: "weight", js: "weight", typ: "" },
        { json: "candy", js: "candy", typ: "" },
        { json: "candy_count", js: "candyCount", typ: u(undefined, 0) },
        { json: "egg", js: "egg", typ: r("Egg") },
        { json: "spawn_chance", js: "spawnChance", typ: 3.14 },
        { json: "avg_spawns", js: "avgSpawns", typ: 3.14 },
        { json: "spawn_time", js: "spawnTime", typ: "" },
        { json: "multipliers", js: "multipliers", typ: u(a(3.14), null) },
        { json: "weaknesses", js: "weaknesses", typ: a(r("Type")) },
        { json: "next_evolution", js: "nextEvolution", typ: u(undefined, a(r("Evolution"))) },
        { json: "prev_evolution", js: "prevEvolution", typ: u(undefined, a(r("Evolution"))) },
    ], false),
    "Evolution": o([
        { json: "num", js: "num", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "Egg": [
        "Not in Eggs",
        "Omanyte Candy",
        "10 km",
        "2 km",
        "5 km",
    ],
    "Type": [
        "Bug",
        "Dark",
        "Dragon",
        "Electric",
        "Fairy",
        "Fighting",
        "Fire",
        "Flying",
        "Ghost",
        "Grass",
        "Ground",
        "Ice",
        "Normal",
        "Poison",
        "Psychic",
        "Rock",
        "Steel",
        "Water",
    ],
};
