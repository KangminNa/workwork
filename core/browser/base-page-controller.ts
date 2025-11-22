import { HttpClient } from "./http-client";
import { ScreenResponse } from "../shared/page";

export class BasePageController<TScreen extends ScreenResponse = ScreenResponse> {
  protected http = new HttpClient();
  pageId: string = "";

  protected fetchScreen(screenId: string): Promise<TScreen> {
    return this.http.get<TScreen>(`/screen/${screenId}`);
  }

  // 개별 페이지에서 override 가능
  async load(): Promise<TScreen> {
    if (!this.pageId) throw new Error("pageId must be set on the controller");
    return this.fetchScreen(this.pageId);
  }
}
