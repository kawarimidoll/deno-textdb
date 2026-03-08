import { validate as validateUUID } from "@std/uuid/v4";

/**
 * A record stored in JsonDB, extending user-defined type `T` with an
 * auto-generated `_id` field (UUID v4).
 */
export type JsonDBSchema<T> = T & {
  _id: string;
};

/**
 * A JSON-based key-value store built on top of textdb.dev.
 * Supports CRUD operations with auto-generated UUID keys.
 *
 * @example
 * ```ts
 * import { JsonDB } from "@kawarimidoll/textdb";
 *
 * type User = { name: string; age: number };
 * const db = new JsonDB<User>("your-page-id");
 *
 * const id = await db.save({ name: "Alice", age: 20 });
 * const users = await db.where({ age: 20 });
 * console.log(users); // [{ _id: "...", name: "Alice", age: 20 }]
 * ```
 */
export class JsonDB<T extends Record<PropertyKey, unknown>> {
  /** The textdb.dev API endpoint URL. */
  public readonly endpoint: string;

  /** Creates a new JsonDB instance.
   * @param pageID The page ID for your textdb.dev storage.
   */
  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  /**
   * get raw data from TextDB
   * @private
   * @return got data
   */
  private async _getRawDB(): Promise<Record<string, JsonDBSchema<T>>> {
    try {
      const response = await fetch(this.endpoint);
      const json = await response.json();

      if (response.ok) {
        return json;
      }

      console.warn(response.statusText);
    } catch (error) {
      console.warn(error);
    }

    return {};
  }

  /**
   * put raw data to TextDB
   * @private
   * @return succeeded or not
   */
  private async _putRawDB(
    data: Record<string, JsonDBSchema<T>>,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        this.endpoint,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
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

  /** Returns all stored records. */
  async all(): Promise<JsonDBSchema<T>[]> {
    return Object.values(await this._getRawDB());
  }

  /**
   * Finds a single record by its ID.
   * @param id The UUID of the record to find.
   */
  async find(id: string): Promise<JsonDBSchema<T> | undefined> {
    return (await this.findMany(id))[0];
  }

  /**
   * Finds multiple records by their IDs.
   * @param ids The UUIDs of the records to find.
   */
  async findMany(...ids: string[]): Promise<JsonDBSchema<T>[]> {
    const rawDB = await this._getRawDB();
    return ids.map((id) => rawDB[id]).filter((item) => item != null);
  }

  /**
   * check if outer object contains all key-value pairs of inner object
   * @private
   * @return matched or not
   */
  private _objectMatch(outer: JsonDBSchema<T>, inner: Partial<T>): boolean {
    return Object.entries(inner).every(
      ([key, value]) => outer[key as keyof JsonDBSchema<T>] === value,
    );
  }

  /**
   * Finds records matching the given key-value pairs.
   * @param selector An object with fields to match against.
   */
  async where(selector: Partial<T>): Promise<JsonDBSchema<T>[]> {
    const rawDB = await this._getRawDB();
    return Object.values(rawDB).filter((item) => {
      return this._objectMatch(item, selector);
    });
  }

  /**
   * Saves a single record. Returns its UUID, or `undefined` on failure.
   * @param data The record to save.
   */
  async save(data: T | JsonDBSchema<T>): Promise<string | undefined> {
    return (await this.saveMany(data))[0];
  }

  /**
   * Saves multiple records. Returns their UUIDs, or an empty array on failure.
   * @param data The records to save.
   */
  async saveMany(...data: (T | JsonDBSchema<T>)[]): Promise<string[]> {
    const rawDB = await this._getRawDB();
    const ids: string[] = data.map((rawItem) => {
      const _id = typeof rawItem._id === "string" && !!rawItem._id
        ? rawItem._id
        : crypto.randomUUID();

      if (!validateUUID(_id)) {
        throw new Error(`${_id} is invalid UUID`);
      }

      const item = { ...rawItem, _id };
      rawDB[_id] = item;
      return _id;
    });
    if (await this._putRawDB(rawDB)) {
      return ids;
    } else {
      return [];
    }
  }

  /**
   * Deletes a single record by its ID.
   * @param id The UUID of the record to delete.
   * @returns The number of records deleted (0 or 1).
   */
  async delete(id: string): Promise<number> {
    return await this.deleteMany(id);
  }

  /**
   * Deletes multiple records by their IDs.
   * @param ids The UUIDs of the records to delete.
   * @returns The number of records actually deleted.
   */
  async deleteMany(...ids: string[]): Promise<number> {
    const rawDB = await this._getRawDB();
    const count = Object.keys(rawDB).length;
    ids.forEach((id) => {
      delete rawDB[id];
    });

    if (await this._putRawDB(rawDB)) {
      // return deleted count
      return count - Object.keys(rawDB).length;
    } else {
      return 0;
    }
  }

  /** Clears all stored records. */
  async clear(): Promise<boolean> {
    return await this._putRawDB({});
  }
}
