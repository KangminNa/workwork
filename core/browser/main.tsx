
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css";
import { App } from "./App";

import { registerCoreWidgets } from "./register-widgets";
import { registerTestWidgets } from "../../test/browser/register-test-widgets";

registerCoreWidgets();
registerTestWidgets();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(<App />);
