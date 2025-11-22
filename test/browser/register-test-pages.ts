import { registerPage } from "@core/browser/page-registry";
import { TestPageController } from "./test-page.controller";
import { TestPageView } from "./test-page.view";

export function registerTestPages(): void {
  registerPage("test", TestPageController, TestPageView);
}
