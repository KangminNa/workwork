
export class HttpClient {
  async get<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url);
    return res.json() as Promise<T>;
  }
}
