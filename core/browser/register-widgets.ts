
import { registerWidget } from "./widget-registry";
import { Text } from "./widgets/Text";

export function registerCoreWidgets(): void {
  registerWidget("Text", Text);
}
