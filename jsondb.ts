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

      if (response.ok) {
        return await response.json();
        // return JSON.parse(await response.text());
      }

      console.warn(response.statusText);
    } catch (error) {
      console.warn(error);
    }

    return {};
  }

  async find(id: string): Promise<T | null> {
    return (await this.getAll())[id];
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
