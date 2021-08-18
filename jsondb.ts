import { assertObjectMatch, validateUUID } from "./deps.ts";

export type JsonDBSchema<T> = T & {
  _id: string;
};

export class JsonDB<T extends Record<PropertyKey, unknown>> {
  public readonly endpoint: string;

  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  async getAll(): Promise<Record<string, JsonDBSchema<T>>> {
    try {
      const response = await fetch(
        this.endpoint,
        { headers: { "content-type": "application/json" } },
      );

      const json = await response.json();

      if (response.ok) {
        return json;
        // return JSON.parse(await response.text());
      }

      console.warn(response.statusText);
    } catch (error) {
      console.warn(error);
    }

    return {};
  }

  async find(id: string): Promise<JsonDBSchema<T> | undefined> {
    return (await this.findMany(id))[0];
  }

  async findMany(...ids: string[]): Promise<JsonDBSchema<T>[]> {
    const all = await this.getAll();
    return ids.map((id) => all[id]).filter((item) => item != null);
  }

  private _objectMatch(outer: JsonDBSchema<T>, inner: Partial<T>): boolean {
    try {
      assertObjectMatch(outer, inner);
      return true;
    } catch {
      return false;
    }
  }

  async where(selector: Partial<T>): Promise<JsonDBSchema<T>[]> {
    const all = await this.getAll();
    return Object.values(all).filter((item) => {
      return this._objectMatch(item, selector);
    });
  }

  async insert(data: T | JsonDBSchema<T>): Promise<string | undefined> {
    return (await this.insertMany(data))[0];
  }

  async insertMany(...data: (T | JsonDBSchema<T>)[]): Promise<string[]> {
    const all = await this.getAll();
    const ids: string[] = data.map((rawItem) => {
      const _id = typeof rawItem._id === "string" && !!rawItem._id
        ? rawItem._id
        : crypto.randomUUID();

      if (!validateUUID(_id)) {
        throw new Error(`${_id} is invalid UUID`);
      }

      const item = { ...rawItem, _id };
      all[_id] = item;
      return _id;
    });
    if (await this._putAll(all)) {
      return ids;
    } else {
      return [];
    }
  }

  async delete(id: string): Promise<number> {
    return await this.deleteMany(id);
  }

  async deleteMany(...ids: string[]): Promise<number> {
    const all = await this.getAll();
    const count = Object.keys(all).length;
    ids.forEach((id) => {
      delete all[id];
    });

    if (await this._putAll(all)) {
      // return deleted count
      return count - Object.keys(all).length;
    } else {
      return 0;
    }
  }

  private async _putAll(
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

  async clear(): Promise<boolean> {
    return await this._putAll({});
  }
}
