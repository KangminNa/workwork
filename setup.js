#!/usr/bin/env node

/**
 * setup.js (ROOT-MANAGED VERSION)
 * ---------------------------------------------------------
 * ✔ package.json / tsconfig / workspace 전부 루트에서 관리
 * ✔ config/ 는 오직 환경설정만 위치
 * ✔ core/server + core/browser + test 모듈 생성
 * ✔ /screen/test → TestWidget 렌더되는 1싸이클 테스트
 */

const fs = require("fs");
const path = require("path");

/* --------------------------
 * UTIL FUNCTIONS
 * ------------------------*/
function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function write(file, content = "") {
  mkdir(path.dirname(file));
  fs.writeFileSync(file, content);
}
function json(file, obj) {
  write(file, JSON.stringify(obj, null, 2));
}

/* --------------------------
 * ROOT STRUCTURE
 * ------------------------*/
console.log("📁 Creating root files...");

write(
  ".gitignore",
  `
node_modules
dist
.env
*.log
*.tsbuildinfo
.DS_Store
.idea
`
);

/* --------------------------
 * ROOT package.json
 * ------------------------*/
json("package.json", {
  name: "workwork",
  private: true,
  version: "1.0.0",
  scripts: {
    "dev:browser": "vite --config config/browser/vite.config.ts",
    "dev:server": "ts-node core/server/main.ts",
    "build:browser": "vite build --config config/browser/vite.config.ts",
    "build:server": "tsc --project tsconfig.base.json",
    build: "npm run build:browser && npm run build:server"
  },
  dependencies: {
    express: "^4.18.2",
    cors: "^2.8.5",
    compression: "^1.7.4",
    helmet: "^7.0.0",
    "cookie-parser": "^1.4.6",
    dotenv: "^16.0.0",
    react: "^18.3.0",
    "react-dom": "^18.3.0"
  },
  devDependencies: {
    typescript: "^5.6.0",
    "ts-node": "^10.9.2",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.21",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    vite: "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
});

/* --------------------------
 * pnpm-workspace.yaml
 * ------------------------*/
write(
  "pnpm-workspace.yaml",
  `
packages:
  - "core"
  - "test"
`
);

/* --------------------------
 * tsconfig.base.json (root)
 * ------------------------*/
json("tsconfig.base.json", {
  compilerOptions: {
    target: "ES2020",
    module: "CommonJS",
    moduleResolution: "Node",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    baseUrl: ".",
    outDir: "dist",
    paths: {
      "@core/*": ["core/*"],
      "@test/*": ["test/*"]
    }
  },
  include: ["core", "test"]
});

/* --------------------------
 * CONFIG FILES
 * ------------------------*/
console.log("⚙️ Creating config folder...");

mkdir("config/browser");

write(
  "config/browser/vite.config.ts",
  `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "../../core/browser"),
  plugins: [react()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "../../core"),
      "@test": path.resolve(__dirname, "../../test")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist/web"),
    emptyOutDir: true,
  },
  server: { port: 5173 }
});
`
);

/* --------------------------
 * CORE/BROWSER
 * ------------------------*/
console.log("🧩 Creating browser core...");

write(
  "core/browser/index.html",
  `
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>WorkWork Test</title>
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
`
);

mkdir("core/browser/styles");

write(
  "core/browser/styles/main.css",
  `
body { margin:0; font-family:sans-serif; }
.popup-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.35); }
.popup-container { background:white; padding:20px; border-radius:8px; }
`
);

write(
  "core/browser/http-client.ts",
  `
export class HttpClient {
  async get(url: string) {
    const res = await fetch(url);
    return res.json();
  }
}
`
);

write(
  "core/browser/widget-registry.ts",
  `
const registry = new Map();
export function registerWidget(type, comp){ registry.set(type, comp); }
export function getWidget(type){ return registry.get(type); }
`
);

write(
  "core/browser/WidgetRenderer.tsx",
  `
import React from "react";
import { getWidget } from "./widget-registry";

export const WidgetRenderer = ({ layout, widgets }) => {
  function renderNode(node){
    if(node.type === "WIDGET_SLOT"){
      const inst = widgets[node.widgetId];
      const Comp = getWidget(inst.type);
      return <Comp props={inst.props} data={inst.data} />;
    }
    return (
      <div style={{ display:"flex", flexDirection: node.type === "ROW" ? "row" : "column" }}>
        {node.children.map((c,i)=><React.Fragment key={i}>{renderNode(c)}</React.Fragment>)}
      </div>
    );
  }
  return <>{renderNode(layout)}</>;
};
`
);

write(
  "core/browser/PopupHost.tsx",
  `
import React from "react";
import { getWidget } from "./widget-registry";

export const PopupHost = ({ overlays, widgets }) => {
  if(!overlays) return null;

  return overlays.map(ov=>{
    const inst = widgets[ov.widgetId];
    const Comp = getWidget(inst.type);
    return (
      <div class="popup-overlay">
        <div class="popup-container">
          <Comp props={inst.props} data={inst.data}/>
        </div>
      </div>
    );
  });
};
`
);

write(
  "core/browser/ScreenHost.tsx",
  `
import React from "react";
import { WidgetRenderer } from "./WidgetRenderer";
import { PopupHost } from "./PopupHost";

export const ScreenHost = ({ screen }) => {
  const isPopupOnly = screen.mode === "POPUP";

  const overlays =
    !isPopupOnly && screen.overlays?.length ? screen.overlays :
    isPopupOnly ? [{ id:screen.screenId, widgetId:Object.keys(screen.widgets)[0]}] :
    [];

  return (
    <>
      {!isPopupOnly && (
        <WidgetRenderer layout={screen.layout} widgets={screen.widgets} />
      )}
      <PopupHost overlays={overlays} widgets={screen.widgets} />
    </>
  );
};
`
);

write(
  "core/browser/register-widgets.ts",
  `
export function registerCoreWidgets(){}
`
);

write(
  "core/browser/App.tsx",
  `
import React from "react";
import { HttpClient } from "./http-client";
import { ScreenHost } from "./ScreenHost";

const http = new HttpClient();

export const App = ()=>{
  const [screen,setScreen] = React.useState(null);

  React.useEffect(()=>{
    const url = new URL(window.location.href);
    const page = url.searchParams.get("page") ?? "test";
    http.get("/screen/"+page).then(setScreen);
  },[]);

  return screen ? <ScreenHost screen={screen}/> : <div>Loading...</div>;
};
`
);

write(
  "core/browser/main.tsx",
  `
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css";
import { App } from "./App";

import { registerCoreWidgets } from "./register-widgets";
import { registerTestWidgets } from "../../test/browser/register-test-widgets";

registerCoreWidgets();
registerTestWidgets();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`
);

/* --------------------------
 * CORE SERVER
 * ------------------------*/
console.log("🧩 Creating server core...");

write(
  "core/server/core-server.ts",
  `
import express from "express";
import path from "path";

export class CoreServer {
  constructor(modules){
    this.modules = modules;
    this.app = express();
    this.setupStatic();
  }

  setupStatic(){
    const web = path.resolve(__dirname, "../../web");
    this.app.use("/", express.static(web));
    this.app.get("/", (req,res)=>res.sendFile(path.join(web,"index.html")));
  }

  setup(){
    for(const m of this.modules){
      if(!m.routes) continue;
      m.routes.forEach(r=>{
        const Ctrl = r.controller;
        const inst = new Ctrl();
        this.app[r.method](r.path, (req,res)=>inst[r.handler](req,res));
      });
    }
    return this;
  }

  listen(port){
    this.app.listen(port, ()=>console.log("[SERVER] listening on",port));
  }
}
`
);

write(
  "core/server/main.ts",
  `
import { CoreServer } from "./core-server";
import TestModule from "../../test/server/module";

const app = new CoreServer([TestModule]);
app.setup().listen(3000);
`
);

/* --------------------------
 * TEST MODULE
 * ------------------------*/
console.log("🧪 Creating test module...");

mkdir("test/browser/widgets");

write(
  "test/browser/widgets/TestWidget.tsx",
  `
import React from "react";

export const TestWidget = ({ props })=>{
  return <div style={{padding:20,fontSize:24,color:"#4A4"}}>{props.message}</div>;
};
`
);

write(
  "test/browser/register-test-widgets.ts",
  `
import { registerWidget } from "@core/browser/widget-registry";
import { TestWidget } from "./widgets/TestWidget";
export function registerTestWidgets(){
  registerWidget("TestWidget", TestWidget);
}
`
);

write(
  "test/server/module.ts",
  `
const TestModule = {
  routes: [
    {
      method:"get",
      path:"/screen/test",
      controller:class{
        async get(req,res){
          return res.json({
            screenId:"test",
            mode:"PAGE",
            layout:{ type:"WIDGET_SLOT", widgetId:"testWidget" },
            widgets:{
              testWidget:{ type:"TestWidget", props:{ message:"Hello Test Screen!" }}
            }
          });
        }
      },
      handler:"get"
    }
  ]
};

export default TestModule;
`
);

/* --------------------------
 * DONE
 * ------------------------*/
console.log("🎉 setup.js 완료!");
console.log("1) pnpm install");
console.log("2) pnpm dev:server");
console.log("3) pnpm dev:browser");
console.log("➡ http://localhost:5173/?page=test 에 접속");