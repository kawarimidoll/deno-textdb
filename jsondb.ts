export class JsonDB<T> {
  public readonly endpoint: string;

  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  async getAll(): Promise<Record<string, T>> {
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

  async find(id: string): Promise<T | undefined> {
    return (await this.findMany(id))[0];
  }

  async findMany(...ids: string[]): Promise<T[]> {
    const all = await this.getAll();
    return ids.map((id) => all[id]).filter((item) => item != null);
  }

  async insert(data: T): Promise<string | undefined> {
    return (await this.insertMany(data))[0];
  }

  async insertMany(...data: T[]): Promise<string[]> {
    const all = await this.getAll();
    const ids: string[] = data.map((item) => {
      const id = crypto.randomUUID();
      all[id] = item;
      return id;
    });
    if (await this.putAll(all)) {
      return ids;
    } else {
      return [];
    }
  }

  async putAll(data: Record<string, T>): Promise<boolean> {
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
    return await this.putAll({});
  }
}
