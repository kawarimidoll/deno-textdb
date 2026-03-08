/**
 * A Deno client for {@link https://textdb.dev | textdb.dev}, providing simple
 * text storage and JSON-based KVS functionality.
 *
 * @example Using TextDB for simple text storage
 * ```ts
 * import { TextDB } from "@kawarimidoll/textdb";
 *
 * const db = new TextDB("your-page-id");
 * await db.put("hello world");
 * const data = await db.get();
 * console.log(data); // "hello world"
 * ```
 *
 * @example Using JsonDB as a key-value store
 * ```ts
 * import { JsonDB } from "@kawarimidoll/textdb";
 *
 * type User = { name: string; age: number };
 * const db = new JsonDB<User>("your-page-id");
 *
 * const id = await db.save({ name: "Alice", age: 20 });
 * const user = await db.find(id!);
 * console.log(user); // { _id: "...", name: "Alice", age: 20 }
 * ```
 *
 * @module
 */
export * from "./textdb.ts";
export * from "./jsondb.ts";
