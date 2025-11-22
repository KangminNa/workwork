
import { registerWidget } from "@core/browser/widget-registry";
import { TestWidget } from "./widgets/TestWidget";
export function registerTestWidgets(){
  registerWidget("TestWidget", TestWidget);
}
