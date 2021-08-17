import {
  assert,
  assertEquals,
  assertObjectMatch,
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
  const carol = { name: "Carol", age: 13 };

  const idA = await db.insert(alice);
  assert(idA);
  const findA = await db.find(idA);
  assert(findA);
  assertObjectMatch(findA, alice);
  const [idB, idC] = await db.insertMany(bob, carol);
  assert(idB);
  assert(idC);
  const [findB, findC] = await db.findMany(idB, idC);
  assert(findB);
  assert(findC);
  assertObjectMatch(findB, bob);
  assertObjectMatch(findC, carol);
});
