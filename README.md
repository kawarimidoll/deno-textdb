# deno-textdb

[![ci](https://github.com/kawarimidoll/deno-textdb/workflows/ci/badge.svg)](.github/workflows/ci.yml)
[![deno.land](https://img.shields.io/badge/deno-%5E1.13.0-green?logo=deno)](https://deno.land)
[![vr scripts](https://badges.velociraptor.run/flat.svg)](https://velociraptor.run)
[![LICENSE](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

Use [textdb](https://textdb.dev)
([bontaq/textdb](https://github.com/bontaq/textdb)) from Deno🦕

## TextDB

### Example

```ts
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

### API

#### new TextDB()

Create a client.

#### clear

Clear contents.

#### get

Get contents.

#### put

Put contents.

## JsonDB

### Example

```ts
// model schema
type Person = {
  name: string;
  age: number;
};

const db = new JsonDB<Person>(TEXTDB_ENDPOINT);

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
```

### API

#### new JsonDB<Schema>()

Create a client.

#### clear

Clear contents.

#### find

Get contents by id.

#### findMany

Get contents by multiple id.

#### insert

Insert contents and return inserted id.

#### insertMany

Insert multiple contents and return inserted ids.
