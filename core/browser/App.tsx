
import React from "react";
import { HttpClient } from "./http-client";
import { ScreenHost } from "./ScreenHost";
import { ScreenResponse } from "../shared/page";

const http = new HttpClient();

export const App: React.FC = () => {
  const [screen, setScreen] = React.useState<ScreenResponse | null>(null);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const page = url.searchParams.get("page") ?? "test";
    http.get<ScreenResponse>("/screen/" + page).then(setScreen);
  }, []);

  return screen ? <ScreenHost screen={screen} /> : <div>Loading...</div>;
};
