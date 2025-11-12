/**
 * setup-monorepo.js
 * 실행: node setup-monorepo.js
 */
const fs = require("fs");
const path = require("path");

const mkdir = (dir) => fs.mkdirSync(dir, { recursive: true });
const write = (file, content) => fs.writeFileSync(file, content.trimStart() + "\n");

console.log("🚧 Setting up fullstack monorepo structure...");

//
// ─── 1️⃣ 폴더 생성 ───────────────────────────────────────────────
//
const folders = [
  "server/src/core",
  "server/src/modules",
  "browser/src/components",
  "browser/src/hooks",
  "browser/src/pages",
  "browser/src/services",
  "packages/tsconfig",
  "dist",
];

folders.forEach(mkdir);

//
// ─── 2️⃣ 루트 package.json ───────────────────────────────────────────────
//
write(
  "package.json",
  `
{
  "name": "fullstack-app",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev:server": "pnpm --filter @app/server dev",
    "dev:browser": "pnpm --filter @app/browser dev",
    "build": "pnpm --filter @app/server build && pnpm --filter @app/browser build",
    "clean": "rimraf dist"
  },
  "workspaces": [
    "server",
    "browser"
  ],
  "devDependencies": {
    "typescript": "^5.6.0",
    "rimraf": "^6.0.1"
  }
}
`
);

//
// ─── 3️⃣ 루트 tsconfig.json ───────────────────────────────────────────────
//
write(
  "tsconfig.json",
  `
{
  "files": [],
  "references": [
    { "path": "./server" },
    { "path": "./browser" }
  ],
  "compilerOptions": {
    "target": "ESNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["server/src/core/*"],
      "@modules/*": ["server/src/modules/*"]
    },
    "outDir": "./dist"
  }
}
`
);

//
// ─── 4️⃣ 공통 TSConfigs ───────────────────────────────────────────────
//
write(
  "packages/tsconfig/base.json",
  `
{
  "compilerOptions": {
    "target": "ESNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
`
);

write(
  "packages/tsconfig/server.json",
  `
{
  "extends": "./base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "rootDir": "../../server/src",
    "outDir": "../../dist/server",
    "types": ["node"],
    "resolveJsonModule": true
  },
  "include": ["../../server/src/**/*"]
}
`
);

write(
  "packages/tsconfig/browser.json",
  `
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "rootDir": "../../browser/src",
    "outDir": "../../dist/browser",
    "types": ["vite/client"]
  },
  "include": ["../../browser/src/**/*"]
}
`
);

//
// ─── 5️⃣ 서버 package.json + tsconfig ───────────────────────────────────────────────
//
write(
  "server/package.json",
  `
{
  "name": "@app/server",
  "version": "1.0.0",
  "main": "dist/server/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc -p ../packages/tsconfig/server.json"
  },
  "dependencies": {
    "express": "^4.19.0",
    "socket.io": "^4.8.1",
    "bullmq": "^5.7.0",
    "ioredis": "^5.4.1",
    "reflect-metadata": "^0.1.14"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "@types/node": "^22.4.0",
    "@types/express": "^4.17.21"
  }
}
`
);

write(
  "server/tsconfig.json",
  `
{
  "extends": "../packages/tsconfig/server.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@modules/*": ["src/modules/*"]
    }
  }
}
`
);

//
// ─── 6️⃣ 브라우저 package.json + tsconfig ───────────────────────────────────────────────
//
write(
  "browser/package.json",
  `
{
  "name": "@app/browser",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -p ../packages/tsconfig/browser.json && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.7.3",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "vite": "^5.3.3",
    "@vitejs/plugin-react": "^4.2.1",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
`
);

write(
  "browser/tsconfig.json",
  `
{
  "extends": "../packages/tsconfig/browser.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"]
    }
  }
}
`
);

//
// ─── 7️⃣ .gitignore 및 PROJECT_STRUCTURE ───────────────────────────────────────────────
//
write(
  ".gitignore",
  `
node_modules
dist
.env
*.log
.DS_Store
pnpm-lock.yaml
`
);

write(
  "PROJECT_STRUCTURE.md",
  `
# 📁 Project Structure

\`\`\`
root/
├── package.json            # workspace 관리
├── pnpm-lock.yaml
├── dist/                   # 통합 빌드 출력
│   ├── server/
│   └── browser/
├── server/                 # Express + BullMQ 서버
│   ├── src/
│   └── package.json
├── browser/                # React + Vite 프론트엔드
│   ├── src/
│   └── package.json
└── packages/
    └── tsconfig/           # 공통 TypeScript 설정
\`\`\`
`
);

console.log("✅ Monorepo fullstack structure created successfully!");