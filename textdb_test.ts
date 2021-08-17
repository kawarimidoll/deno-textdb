import { assert, assertEquals } from "./deps.ts";
import { TextDB } from "./textdb.ts";

// test page id
const TEXTDB_ENDPOINT = "247213c6-8bb7-4576-a89f-e72584046c71";

Deno.test("TextDB", async () => {
  const db = new TextDB(TEXTDB_ENDPOINT);
  assert(db);

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
});
