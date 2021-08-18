import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertObjectMatch,
} from "./deps.ts";
import { JsonDB } from "./jsondb.ts";

type Person = {
  name: string;
  age: number;
  gender: string;
};

// test page id
const TEXTDB_ENDPOINT = "247213c6-8bb7-4576-a89f-e72584046c71";

Deno.test("JsonDB", async () => {
  const db = new JsonDB<Person>(TEXTDB_ENDPOINT);
  assert(db);

  await db.clear();
  assertEquals(await db.getAll(), {});

  const alice = { name: "Alice", age: 12, gender: "f" };
  const bob = { name: "Bob", age: 10, gender: "m" };
  const carol = { name: "Carol", age: 10, gender: "f" };

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

  // the iteration order is not guaranteed
  assertArrayIncludes((await db.where({ age: 10 })), [findB, findC]);
  assertArrayIncludes((await db.where({ age: 10, gender: "m" })), [findB]);

  assertEquals(await db.delete(idB), 1);
  assertEquals(await db.find(idB), undefined);
  assertEquals(await db.deleteMany(idA, idB, idC), 2);
  assertEquals(await db.getAll(), {});
});
