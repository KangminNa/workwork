
import React from "react";
import { getWidget } from "./widget-registry";
import { LayoutNode, WidgetInstance } from "../shared/page";

interface WidgetRendererProps {
  layout: LayoutNode;
  widgets: Record<string, WidgetInstance>;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  layout,
  widgets
}) => {
  function renderNode(node: LayoutNode): React.ReactNode {
    if (node.type === "WIDGET_SLOT") {
      const inst = widgets[node.widgetId];
      const Comp = getWidget(inst.type);
      return <Comp props={inst.props} data={inst.data} />;
    }
    return (
      <div
        style={{
          display: "flex",
          flexDirection: node.type === "ROW" ? "row" : "column"
        }}
      >
        {node.children.map((c, i) => (
          <React.Fragment key={i}>{renderNode(c)}</React.Fragment>
        ))}
      </div>
    );
  }
  return <>{renderNode(layout)}</>;
};
