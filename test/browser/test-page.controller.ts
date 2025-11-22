import { BasePageController } from "@core/browser/base-page-controller";
import { TestScreenResponse } from "../shared/dto";

export class TestPageController extends BasePageController<TestScreenResponse> {
  pageId = "test";

  async load(): Promise<TestScreenResponse> {
    return this.fetchScreen(this.pageId);
  }
}
