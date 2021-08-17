import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.104.0/testing/asserts.ts";
import { JsonDB } from "./jsondb.ts";

type Person = {
  name: string;
  age: number;
};

// test page id
const TEXTDB_ENDPOINT = "247213c6-8bb7-4576-a89f-e72584046c71";

Deno.test("TextDB", async () => {
  const db = new JsonDB<Person>(TEXTDB_ENDPOINT);
  assert(db);

  await db.clear();
  assertEquals(await db.getAll(), {});

  const alice = { name: "Alice", age: 12 };
  const bob = { name: "Bob", age: 10 };

  assert(await db.putAll({ alice, bob }));

  assertEquals(await db.getAll(), { alice, bob });

  assertEquals(await db.find("alice"), alice);
  assertEquals(await db.find("bob"), bob);
  assertEquals(await db.find("carol"), undefined);

  await db.clear();
  const idA = await db.insert(alice);
  assert(idA);
  assertEquals(await db.find(idA), alice);
});
