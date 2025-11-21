#!/usr/bin/env node

/**
 * setup.js
 * ----------------------------------------
 * ✔ 모든 dependency는 config/packages/root.package.json에서만 관리
 * ✔ 각 모듈(core/common/auth/calendar)은 dependency X ("name"만 가진 package.json)
 * ✔ 모듈 간 참조 불가 (common만 공유 가능)
 * ✔ pnpm workspace / tsconfig.base / .gitignore 자동 생성
 * ✔ 모든 기본 파일/폴더 생성
 */

const fs = require("fs");
const path = require("path");

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function write(file, content = "") {
  fs.writeFileSync(file, content);
}
function json(file, data) {
  write(file, JSON.stringify(data, null, 2));
}

const root = process.cwd();

/* ------------------------------------------------------
 * 1) CREATE DIRECTORY STRUCTURE
 * ------------------------------------------------------ */

const DIRECTORIES = [
  "dist/web",
  "dist/server",

  "config/packages",
  "config/env",
  "config/prisma",
  "config/bullmq",
  "config/express",
  "config/eslint",
  "config/prettier",
  "config/scripts",

  "core/server/di",
  "core/server/router",
  "core/server/sockets",
  "core/server/queues",
  "core/browser",
  "core/shared",

  "common/utils",
  "common/constants",
  "common/types",
  "common/dto",

  "auth/server",
  "auth/browser",
  "auth/shared",

  "calendar/server",
  "calendar/browser",
  "calendar/shared"
];

DIRECTORIES.forEach((d) => mkdir(path.join(root, d)));

/* ------------------------------------------------------
 * 2) .gitignore
 * ------------------------------------------------------ */

write(
  ".gitignore",
  `
node_modules
dist
.env
.env.*
npm-debug.log
pnpm-debug.log
.DS_Store
.idea
*.log
*.tsbuildinfo
`
);

/* ------------------------------------------------------
 * 3) WORKSPACE / ROOT CONFIG
 * ------------------------------------------------------ */

write(
  "config/packages/pnpm-workspace.yaml",
  `
packages:
  - "../../core"
  - "../../common"
  - "../../auth"
  - "../../calendar"
  - "../../config"
`
);

json("config/packages/tsconfig.base.json", {
  compilerOptions: {
    target: "ES2020",
    module: "ESNext",
    moduleResolution: "Node",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    baseUrl: ".",
    paths: {
      "@core/*": ["core/*"],
      "@common/*": ["common/*"],
      "@auth/*": ["auth/*"],
      "@calendar/*": ["calendar/*"],
      "@config/*": ["config/*"]
    }
  }
});

/* ------------------------------------------------------
 * 4) ROOT PACKAGE.JSON (CENTRAL DEPENDENCY MANAGER)
 * ------------------------------------------------------ */

json("config/packages/root.package.json", {
  name: "workwork-root",
  private: true,
  scripts: {
    dev: "pnpm -F core dev",
    build: "pnpm -F core build",
    clean: "rimraf ../../dist"
  },
  dependencies: {
    /* EXPRESS STACK */
    express: "^4.18.0",
    cors: "^2.8.5",
    helmet: "^7.0.0",
    compression: "^1.7.4",
    "cookie-parser": "^1.4.6",

    /* ORM */
    "@prisma/client": "latest",
    prisma: "^5.0.0",
    pg: "^8.11.0",

    /* QUEUE */
    bullmq: "^4.0.0",
    ioredis: "^5.3.0",

    /* REACT */
    react: "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",

    /* CALENDAR UTILS */
    dayjs: "^1.11.0",
    "react-virtual": "^3.0.0",

    /* AUTH */
    bcrypt: "^5.1.0",
    jsonwebtoken: "^9.0.0",

    /* UTILITIES */
    uuid: "^9.0.0",
    zod: "^3.22.0",
    dotenv: "^16.0.0"
  },
  devDependencies: {
    /* TYPESCRIPT */
    typescript: "^5.6.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",

    /* BUILD */
    vite: "^5.0.0",

    /* TEST */
    jest: "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.0",

    /* LINT */
    eslint: "^8.56.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",

    /* FORMATTING */
    prettier: "^3.2.0",

    /* TYPES */
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",

    rimraf: "^5.0.0",
    concurrently: "^8.0.0"
  }
});

/* ------------------------------------------------------
 * 5) MODULE PACKAGE.JSON (MINIMAL)
 * ------------------------------------------------------ */

const MODULES = ["core", "common", "auth", "calendar"];

MODULES.forEach((mod) => {
  json(`${mod}/package.json`, {
    name: mod,
    private: true
  });

  json(`${mod}/tsconfig.json`, {
    extends: "../config/packages/tsconfig.base.json",
    compilerOptions: { baseUrl: "." },
    include: ["server", "browser", "shared"]
  });
});

/* ------------------------------------------------------
 * 6) CONFIG & CORE TEMPLATE FILES
 * ------------------------------------------------------ */

write("config/env/.env.local", "");
write("config/env/.env.dev", "");
write("config/env/.env.prod", "");

write(
  "config/prisma/schema.prisma",
  `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`
);

write(
  "config/bullmq/connection.ts",
  `
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
});
`
);

write(
  "config/express/express.base.ts",
  `
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";

export const createBaseExpress = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  return app;
};
`
);

/* ------------------------------------------------------
 * 7) CORE FRAMEWORK TEMPLATE
 * ------------------------------------------------------ */

write(
  "core/server/base-controller.ts",
  `
export class BaseController {
  wrap(handler) {
    return async (req, res, next) => {
      try {
        const result = await handler.call(this, req, res);
        if (!res.headersSent) res.json(result);
      } catch (err) {
        next(err);
      }
    };
  }
}
`
);

write("core/server/base-service.ts", `export class BaseService {}\n`);
write("core/server/base-repository.ts", `export class BaseRepository {}\n`);

write(
  "core/server/core-server.ts",
  `
import { createBaseExpress } from "@config/express/express.base";

export class CoreServer {
  constructor(modules = []) {
    this.modules = modules;
    this.app = createBaseExpress();
  }

  setup() {
    for (const m of this.modules) {
      if (!m.routes) continue;
      for (const r of m.routes) {
        const controller = new r.controller();
        this.app[r.method](r.path, controller.wrap(controller[r.handler]));
      }
    }
    return this;
  }

  listen(port) {
    this.app.listen(port, () => console.log("Server listening:", port));
  }
}
`
);

write(
  "core/browser/App.tsx",
  `
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
`
);

write("core/browser/page-registry.ts", `const reg={}; export const registerPage=(id,c)=>reg[id]=c; export const getPageController=(id)=>reg[id];`);
write("core/browser/base-page-controller.ts", `export class BasePageController{fetch(){return{}} render(){return null}}`);
write("core/browser/http-client.ts", `export class HttpClient{async get(u){return fetch(u).then(r=>r.json())}}`);
write("core/browser/error-boundary.tsx", `export const ErrorBoundary=({children})=>children;`);
write("core/browser/index.tsx", `export * from "./App";`);

write("core/shared/types.ts", "");
write("core/shared/error.ts", "");
write("core/shared/page.ts", "");

/* ------------------------------------------------------
 * DONE
 * ------------------------------------------------------ */

console.log("🎉 setup.js 실행 완료: dependency 중앙관리 + 전체 구조 생성됨!");