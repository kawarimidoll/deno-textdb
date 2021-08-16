import { JsonDB } from "./jsondb.ts";

type Person = {
  name: string;
  age: number;
};

// test page id
const TEXTDB_ENDPOINT = "247213c6-8bb7-4576-a89f-e72584046c71";

const db = new JsonDB<Person>(TEXTDB_ENDPOINT);
console.log(await db.getAll());
const alice = { name: "Alice", age: 12 };
const bob = { name: "Bob", age: 10 };
await db.putAll({ alice, bob });
console.log(await db.getAll());
console.log(await db.find("alice"));
console.log(await db.find("bob"));
console.log(await db.find("carol"));
await db.clear();
console.log(await db.getAll());
