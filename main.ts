import { TextDB } from "./textdb.ts";

const TEXTDB_ENDPOINT = Deno.env.get("TEXTDB_ENDPOINT");
if (!TEXTDB_ENDPOINT) {
  throw new Error("endpoint missing");
}

const db = new TextDB(TEXTDB_ENDPOINT);
console.log(await db.get());
await db.put("this is text db!");
console.log(await db.get());
await db.clear();
console.log(await db.get());
