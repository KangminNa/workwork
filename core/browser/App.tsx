
import React from "react";
import { getPageController } from "./page-registry";

export const App = () => {
  const url = new URL(window.location.href);
  const page = url.searchParams.get("page") || "calendar-month";

  const Controller = getPageController(page);
  const controller = new Controller();

  const [component, setComponent] = React.useState(null);

  React.useEffect(() => {
    controller.fetch().then((d) => setComponent(controller.render(d)));
  }, [page]);

  return component;
};
