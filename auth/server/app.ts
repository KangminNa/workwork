/**
 * Auth Module Server Entry Point
 */

import "reflect-metadata";
import express from "express";
import { glob } from "glob";

const app = express();
app.use(express.json());

// 개발 모드에서는 .ts, 프로덕션에서는 .js 동적 로딩
const ext = process.env.NODE_ENV === "production" ? ".js" : "";
let container: any;
let Resolver: any;

/**
 * 0. Core 모듈 로딩
 */
async function loadCore() {
  const containerModule = await import(`../../core/server/Container${ext}`);
  const resolverModule = await import(`../../core/server/Resolver${ext}`);
  container = containerModule.container;
  Resolver = resolverModule.Resolver;
}

/**
 * 1. 모듈 로딩 (Controller, Service, Repository)
 */
async function loadModules() {
  console.log("📦 Loading Auth module...");

  const files = await glob("./**/*.{ts,js}", {
    cwd: __dirname,
    absolute: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/entities/**",
      "**/dto/**",
      "**/shared/**",
      "**/app.ts",
    ],
  });

  for (const file of files) {
    await import(file);
  }

  console.log("✅ Modules loaded");
  container.printRegistry();
}

/**
 * 2. HTTP 라우팅
 */
app.use("/api", async (req, res, next) => {
  try {
    // /api가 제거된 경로를 복원
    const fullPath = "/api" + req.path;
    await Resolver.handle("http", fullPath, { req, res });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 3. 서버 시작
 */
async function start() {
  await loadCore();
  await loadModules();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
