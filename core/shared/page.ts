export type PresentationMode = "PAGE" | "POPUP";

export interface ScreenResponse {
  screenId: string;
  mode: PresentationMode;
  title?: string;
  layout: LayoutNode;
  widgets: Record<string, WidgetInstance>;
  overlays?: OverlaySpec[];
  meta?: Record<string, unknown>;
}

export type LayoutNode =
  | {
      type: "ROW" | "COLUMN" | "STACK";
      children: LayoutNode[];
      style?: Record<string, unknown>;
    }
  | {
      type: "WIDGET_SLOT";
      widgetId: string;
      style?: Record<string, unknown>;
    };

export interface WidgetInstance {
  type: string;
  props?: Record<string, unknown>;
  data?: unknown;
}

export interface OverlaySpec {
  id: string;
  widgetId: string;
}
