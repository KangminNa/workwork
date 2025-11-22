#!/usr/bin/env node

/**
 * setup.js (with dist structure support)
 * ----------------------------------------
 * ✔ 모든 dependency는 config/packages/package.json에서만 관리
 * ✔ 각 모듈은 dependency X (package.json 최소 내용만)
 * ✔ pnpm workspace / tsconfig.base / .gitignore 자동 생성
 * ✔ dist/<module> 구조 자동 생성
 */

const fs = require("fs");
const path = require("path");

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function write(file, content = "") {
  mkdir(path.dirname(file));
  fs.writeFileSync(file, content);
}
function json(file, data) {
  write(file, JSON.stringify(data, null, 2));
}

const root = process.cwd();

/* ======================================================
 * 1) CREATE DIRECTORY STRUCTURE
 * ====================================================== */

const MODULES = ["core", "common", "auth", "calendar", "signup", "notification"];

const DIRECTORIES = [
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

  "auth/server", "auth/browser", "auth/shared",
  "calendar/server", "calendar/browser", "calendar/shared",
  "signup/server", "signup/browser", "signup/shared",
  "notification/server", "notification/browser", "notification/shared",

  // dist structure
  "dist"
];

DIRECTORIES.forEach((d) => mkdir(path.join(root, d)));
MODULES.forEach((m) => mkdir(path.join(root, "dist", m)));

/* ======================================================
 * 2) .gitignore
 * ====================================================== */

write(
  ".gitignore",
  `
node_modules
dist
.env
.env.*
*.log
*.tsbuildinfo
.DS_Store
.idea
`
);

/* ======================================================
 * 3) WORKSPACE / BASE TS CONFIG
 * ====================================================== */

write(
  "pnpm-workspace.yaml",
  `
packages:
  - "config/packages"
  - "core"
  - "common"
  - "auth"
  - "calendar"
  - "signup"
  - "notification"
`
);

json("config/packages/tsconfig.base.json", {
  compilerOptions: {
    target: "ES2020",
    module: "CommonJS",
    moduleResolution: "Node",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,

    /* dist output root */
    rootDir: "../..",
    outDir: "../../dist",

    baseUrl: "../..",
    paths: {
      "@core/*": ["core/*"],
      "@common/*": ["common/*"],
      "@auth/*": ["auth/*"],
      "@calendar/*": ["calendar/*"],
      "@signup/*": ["signup/*"],
      "@notification/*": ["notification/*"],
      "@config/*": ["config/*"]
    }
  }
});

/* ======================================================
 * 4) ROOT PACKAGE.JSON (dependency center)
 * ====================================================== */

json("config/packages/package.json", {
  name: "@workwork/config",
  private: true,
  scripts: {
    dev: "pnpm -F core dev",
    build: "tsc --build",
    clean: "rimraf ../../dist"
  },
  dependencies: {
    express: "^4.18.0",
    cors: "^2.8.5",
    helmet: "^7.0.0",
    compression: "^1.7.4",
    "cookie-parser": "^1.4.6",

    "@prisma/client": "latest",
    prisma: "^5.0.0",
    pg: "^8.11.0",

    bullmq: "^4.0.0",
    ioredis: "^5.3.0",

    react: "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",

    dayjs: "^1.11.0",
    "react-virtual": "^3.0.0",

    bcrypt: "^5.1.0",
    jsonwebtoken: "^9.0.0",

    uuid: "^9.0.0",
    zod: "^3.22.0",
    dotenv: "^16.0.0"
  },
  devDependencies: {
    typescript: "^5.6.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    vite: "^5.0.0",

    jest: "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.0",

    eslint: "^8.56.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",

    prettier: "^3.2.0",

    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",

    rimraf: "^5.0.0",
    concurrently: "^8.0.0"
  }
});

/* ======================================================
 * 5) MODULE PACKAGE.JSON / TSCONFIG
 * ====================================================== */

MODULES.forEach((mod) => {
  json(`${mod}/package.json`, {
    name: `@workwork/${mod}`,
    private: true
  });

  json(`${mod}/tsconfig.json`, {
    extends: "../config/packages/tsconfig.base.json",
    compilerOptions: {},
    include: ["server", "browser", "shared"]
  });
});

/* ======================================================
 * 6) CONFIG & PRISMA & EXPRESS
 * ====================================================== */

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
  app.use(cors());
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());
  return app;
};
`
);

/* ======================================================
 * 7) CORE FRAMEWORK BOOTSTRAP
 * ====================================================== */

write(
  "core/server/main.ts",
  `
import path from "path";
import { CoreServer } from "./core-server";
import { scanModules } from "./module-scanner";

async function bootstrap() {
  const rootDir = path.resolve(__dirname, "../../..");
  const modules = await scanModules(rootDir);

  const server = new CoreServer(modules);
  server.setup().listen(3000);
}

bootstrap();
`
);

write(
  "core/server/module-scanner.ts",
  `
import fs from "fs";
import path from "path";

export async function scanModules(rootDir: string) {
  const folders = fs.readdirSync(rootDir, { withFileTypes: true });
  const modules = [];

  for (const entry of folders) {
    if (!entry.isDirectory()) continue;

    const modulePath = path.join(rootDir, entry.name, "server", "module.ts");

    if (fs.existsSync(modulePath)) {
      const imported = await import(modulePath);
      if (imported.default) modules.push(imported.default);
      else {
        for (const v of Object.values(imported)) {
          if (v?.controllers || v?.routes) modules.push(v);
        }
      }
    }
  }
  return modules;
}
`
);

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

/* ======================================================
 * DONE
 * ====================================================== */

console.log("🎉 setup.js 실행 완료: dist/<module> 빌드 구조까지 완성!");