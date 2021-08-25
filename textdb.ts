/**
 * TextDB class
 */
export class TextDB {
  /**
   * DB api endpoint
   */
  public readonly endpoint: string;

  /**
   * TextDB constructor
   * @param {string} pageID
   */
  constructor(pageID: string) {
    this.endpoint = `https://textdb.dev/api/data/${pageID}`;
  }

  /**
   * get data from TextDB
   * it returns undefined when the connection failed
   * @returns got data
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
   * put data into TextDB
   * the saved data is replaced, not appended
   * @returns succeeded or not
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

  /**
   * clear saved data
   * @returns succeeded or not
   */
  async clear(): Promise<boolean> {
    return await this.put("");
  }
}
