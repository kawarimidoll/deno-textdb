# deno-textdb

[![ci](https://github.com/kawarimidoll/deno-textdb/workflows/ci/badge.svg)](.github/workflows/ci.yml)
[![deno version](https://img.shields.io/badge/deno-%5E1.13.0-green?logo=deno)](https://deno.land)
[![vr scripts](https://badges.velociraptor.run/flat.svg)](https://velociraptor.run)
[![deno.land](https://img.shields.io/github/v/tag/kawarimidoll/deno-textdb?style=flat&logo=deno&label=deno.land&color=steelblue&sort=semver)](https://deno.land/x/textdb)
[![LICENSE](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

Use [textdb.dev](https://textdb.dev)
([bontaq/textdb](https://github.com/bontaq/textdb)) from Deno🦕

## Usage

For API information, see:
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/textdb/mod.ts)

### TextDB

Put and get text data using TextDB.

#### Example

```ts
import { TextDB } from "https://deno.land/x/textdb/mod.ts";
const db = new TextDB(TEXTDB_ENDPOINT);

await db.clear();
assertEquals(await db.get(), "");

await db.put("this is text db!");
assertEquals(await db.get(), "this is text db!");

await db.put(`
  this is multiline input!
  this is multiline input!
  this is multiline input!
`.trim());
assertEquals(
  await db.get(),
  `
  this is multiline input!
  this is multiline input!
  this is multiline input!
`.trim(),
);
```

### JsonDB

Use TextDB like KVS.

#### Example

```ts
import { JsonDB } from "https://deno.land/x/textdb/mod.ts";

// model schema
type Person = {
  name: string;
  age: number;
  gender: "m" | "f";
};

const db = new JsonDB<Person>(TEXTDB_ENDPOINT);

await db.clear();
assertEquals(await db.all(), []);

const alice: Person = { name: "Alice", age: 12, gender: "f" };
const bob: Person = { name: "Bob", age: 10, gender: "m" };
const carol: Person = { name: "Carol", age: 10, gender: "f" };

const idA = await db.save(alice);
assert(idA);
const findA = await db.find(idA);
assert(findA);
assertObjectMatch(findA, alice);

const [idB, idC] = await db.saveMany(bob, carol);
assert(idB);
assert(idC);
const [findB, findC] = await db.findMany(idB, idC);
assert(findB);
assert(findC);
assertObjectMatch(findB, bob);
assertObjectMatch(findC, carol);

assertRejects(
  async () => {
    await db.save({ _id: "dummy", name: "Dave", age: 10, gender: "m" });
  },
  Error,
  "dummy is invalid UUID",
);

// the iteration order is not guaranteed
assertArrayIncludes((await db.where({ age: 10 })), [findB, findC]);
assertArrayIncludes((await db.where({ age: 10, gender: "m" })), [findB]);

assertEquals(await db.delete(idB), 1);
assertEquals(await db.find(idB), undefined);
assertEquals(await db.deleteMany(idA, idB, idC), 2);
assertEquals(await db.all(), []);
```
