export class TextDB {
  public readonly endpoint: string;

  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  async get(): Promise<string | null> {
    try {
      const response = await fetch(
        this.endpoint,
        {
          headers: { "content-type": "text/plain" },
        },
      );

      if (response.ok) {
        return await response.text();
      }

      console.warn(response.statusText);
    } catch (error) {
      console.warn(error);
    }

    return null;
  }

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

      return response.ok;
    } catch (error) {
      console.warn(error);
    }

    return false;
  }

  async clear(): Promise<boolean> {
    return await this.put("");
  }
}
