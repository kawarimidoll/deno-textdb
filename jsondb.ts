import { assertObjectMatch, validateUUID } from "./deps.ts";

/**
 * JsonDB Schema
 * add _id property to the record user passed
 */
export type JsonDBSchema<T> = T & {
  _id: string;
};

/**
 * JsonDB class
 */
export class JsonDB<T extends Record<PropertyKey, unknown>> {
  /**
   * DB api endpoint
   */
  public readonly endpoint: string;

  /**
   * JsonDB constructor
   * @param {string} pageID
   */
  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  /**
   * get raw data from TextDB
   * @private
   * @returns got data
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
   * @returns succeeded or not
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

  /**
   * get all data
   * @returns got data
   */
  async all(): Promise<JsonDBSchema<T>[]> {
    return Object.values(await this._getRawDB());
  }

  /**
   * get single data by id
   * @param id to find
   * @returns got data
   */
  async find(id: string): Promise<JsonDBSchema<T> | undefined> {
    return (await this.findMany(id))[0];
  }

  /**
   * get multiple data by ids
   * @param array of id to find
   * @returns got data
   */
  async findMany(...ids: string[]): Promise<JsonDBSchema<T>[]> {
    const rawDB = await this._getRawDB();
    return ids.map((id) => rawDB[id]).filter((item) => item != null);
  }

  /**
   * assert objects are matched, but returns boolean, not throw exception
   * @private
   * @returns matched or not
   */
  private _objectMatch(outer: JsonDBSchema<T>, inner: Partial<T>): boolean {
    try {
      assertObjectMatch(outer, inner);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * get multiple data by given key and values
   * @returns got data
   */
  async where(selector: Partial<T>): Promise<JsonDBSchema<T>[]> {
    const rawDB = await this._getRawDB();
    return Object.values(rawDB).filter((item) => {
      return this._objectMatch(item, selector);
    });
  }

  /**
   * save single data
   * @param data to save
   * @returns succeeded or not
   */
  async save(data: T | JsonDBSchema<T>): Promise<string | undefined> {
    return (await this.saveMany(data))[0];
  }

  /**
   * save multiline data
   * @param array of data to save
   * @returns succeeded or not
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
   * save multiline data
   * @param data to delete
   * @returns deleted count
   */
  async delete(id: string): Promise<number> {
    return await this.deleteMany(id);
  }

  /**
   * delete multiline data by id
   * @param array of data to delete
   * @returns deleted count
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

  /**
   * clear DB data
   * @returns succeeded or not
   */
  async clear(): Promise<boolean> {
    return await this._putRawDB({});
  }
}
