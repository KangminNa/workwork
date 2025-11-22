
import React from "react";
import { getWidget } from "./widget-registry";
import { OverlaySpec, WidgetInstance } from "../shared/page";

interface PopupHostProps {
  overlays?: OverlaySpec[];
  widgets: Record<string, WidgetInstance>;
}

export const PopupHost: React.FC<PopupHostProps> = ({ overlays, widgets }) => {
  if (!overlays?.length) return null;

  return overlays.map((ov) => {
    const inst = widgets[ov.widgetId];
    const Comp = getWidget(inst.type);
    return (
      <div className="popup-overlay" key={ov.id}>
        <div className="popup-container">
          <Comp props={inst.props} data={inst.data} />
        </div>
      </div>
    );
  });
};
