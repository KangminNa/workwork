
import React from "react";

type WidgetComponent = React.ComponentType<any>;

const registry = new Map<string, WidgetComponent>();
export function registerWidget(type: string, comp: WidgetComponent): void {
  registry.set(type, comp);
}
export function getWidget(type: string): WidgetComponent {
  const comp = registry.get(type);
  if (!comp) throw new Error(`Widget not registered: ${type}`);
  return comp;
}
