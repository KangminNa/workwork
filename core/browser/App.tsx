
import React from "react";
import { ScreenHost } from "./ScreenHost";
import { ScreenResponse } from "../shared/page";
import { getPage } from "./page-registry";

export const App: React.FC = () => {
  const [screen, setScreen] = React.useState<ScreenResponse | null>(null);
  const [PageView, setPageView] =
    React.useState<React.ComponentType<{ screen: ScreenResponse }> | null>(
      null
    );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const page = url.searchParams.get("page") ?? "test";
    const entry = getPage(page);
    if (!entry) {
      setError(`Page not registered: ${page}`);
      return;
    }
    const Controller = entry.controller;
    const controller = new Controller();
    setPageView(() => entry.view);
    controller
      .load()
      .then(setScreen)
      .catch((err) => setError(err?.message ?? String(err)));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!screen || !PageView) return <div>Loading...</div>;

  return (
    <>
      <ScreenHost screen={screen} />
      <PageView screen={screen} />
    </>
  );
};
