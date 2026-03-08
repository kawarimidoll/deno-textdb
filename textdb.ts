/**
 * A client for storing and retrieving plain text data via textdb.dev.
 *
 * @example
 * ```ts
 * import { TextDB } from "@kawarimidoll/textdb";
 *
 * const db = new TextDB("your-page-id");
 * await db.put("hello world");
 * const data = await db.get();
 * console.log(data); // "hello world"
 * ```
 */
export class TextDB {
  /** The textdb.dev API endpoint URL. */
  public readonly endpoint: string;

  /** Creates a new TextDB instance.
   * @param pageID The page ID for your textdb.dev storage.
   */
  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  /**
   * Gets text data from textdb.dev.
   * Returns `undefined` when the connection fails.
   */
  async get(): Promise<string | undefined> {
    try {
      const response = await fetch(this.endpoint);
      const text = await response.text();

      if (response.ok) {
        return text;
      }

      console.warn(response.statusText);
    } catch (error) {
      console.warn(error);
    }

    return undefined;
  }

  /**
   * Stores text data to textdb.dev.
   * The saved data is replaced, not appended.
   * @param data The text to store.
   * @returns `true` if succeeded, `false` otherwise.
   */
  async put(data: string): Promise<boolean> {
    try {
      const response = await fetch(
        this.endpoint,
        {
          method: "POST",
          headers: { "content-type": "text/plain" },
          body: data,
        },
      );

      // ensure to close resource
      await response.text();

      return response.ok;
    } catch (error) {
      console.warn(error);
    }

    return false;
  }

  /** Clears all stored data. */
  async clear(): Promise<boolean> {
    return await this.put("");
  }
}
