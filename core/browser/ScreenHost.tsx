
import React from "react";
import { WidgetRenderer } from "./WidgetRenderer";
import { PopupHost } from "./PopupHost";
import { OverlaySpec, ScreenResponse } from "../shared/page";

interface ScreenHostProps {
  screen: ScreenResponse;
}

export const ScreenHost: React.FC<ScreenHostProps> = ({ screen }) => {
  const isPopupOnly = screen.mode === "POPUP";

  const overlays: OverlaySpec[] =
    !isPopupOnly && screen.overlays?.length
      ? screen.overlays
      : isPopupOnly
      ? [{ id: screen.screenId, widgetId: Object.keys(screen.widgets)[0] }]
      : [];

  return (
    <>
      {!isPopupOnly && (
        <WidgetRenderer layout={screen.layout} widgets={screen.widgets} />
      )}
      <PopupHost overlays={overlays} widgets={screen.widgets} />
    </>
  );
};
