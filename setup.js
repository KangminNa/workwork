const fs = require('fs');
const path = require('path');

const MODULES = ['auth', 'base'];
const LAYERS = ['browser', 'server', 'shared'];

const dirs = MODULES.flatMap(mod =>
  LAYERS.map(layer => `${mod}/${layer}`)
).concat('infra/db');

//
// ---------------------------
// Root Files (package.json, tsconfig.base, turbo.json)
// ---------------------------
//
const rootPackageJson = {
  name: 'turborepo-root',
  private: true,
  version: '1.0.0',
  scripts: {
    build: 'turbo run build',
    dev: 'turbo run dev',
    clean: 'rm -rf dist'
  },
  workspaces: ['auth/*', 'base/*'],
  dependencies: {
    // NestJS
    "@nestjs/common": "^10.2.0",
    "@nestjs/core": "^10.2.0",
    "@nestjs/platform-express": "^10.2.0",
    "@nestjs/typeorm": "^10.0.0",

    // ORM
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",

    // Queue
    "bullmq": "^4.10.1",
    "@nestjs/bullmq": "^0.0.9",

    // Validation / DTO
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.13",

    // Misc
    "rxjs": "^7.8.1",
    "dayjs": "^1.11.9",
    "axios": "^1.6.0",
    "zod": "^3.22.4",
    "uuid": "^9.0.0",
    "dotenv": "^16.3.1",

    // React / Next
    "next": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0"
  },
  devDependencies: {
    // TS & Tools
    "typescript": "^5.2.0",
    "ts-node": "^10.9.2",
    "@types/node": "^20.4.1",

    // React types
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.7",

    // Lint
    "@typescript-eslint/eslint-plugin": "^6.5.0",
    "@typescript-eslint/parser": "^6.5.0",
    "eslint": "^8.46.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "prettier": "^3.0.3",

    // Monorepo
    "turbo": "^1.11.0"
  }
};

const files = {
  'package.json': JSON.stringify(rootPackageJson, null, 2),

  'tsconfig.base.json': JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      baseUrl: ".",
      paths: {
        "@base/browser/*": ["base/browser/*"],
        "@base/server/*": ["base/server/*"],
        "@base/shared/*": ["base/shared/*"]
      }
    }
  }, null, 2),

  'turbo.json': JSON.stringify({
    "$schema": "https://turborepo.org/schema.json",
    pipeline: {
      build: {
        dependsOn: ["^build"],
        outputs: ["dist/**"]
      },
      dev: {
        cache: false
      }
    }
  }, null, 2),

  '.gitignore': `
node_modules
dist
`
};

//
// ---------------------------
// File/Folder 생성 로직
// ---------------------------
//
function createDirs() {
  dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));
}

function writeRootFiles() {
  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(filename, content);
  }
}

function createModuleFiles() {
  MODULES.forEach(mod => {
    // module root package
    fs.writeFileSync(
      path.join(mod, 'package.json'),
      JSON.stringify({ name: mod, private: true, version: "1.0.0" }, null, 2)
    );

    LAYERS.forEach(layer => {
      const full = `${mod}/${layer}`;

      // tsconfig.json (출력 경로 dist/*)
      const tsconfig = {
        extends: "../../tsconfig.base.json",
        compilerOptions: {
          rootDir: ".",
          outDir: `../../dist/${mod}/${layer}`
        },
        include: ["**/*"],
        exclude: ["dist", "node_modules"]
      };
      fs.writeFileSync(path.join(full, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

      // layer package.json
      const pkg = {
        name: `${mod}-${layer}`,
        private: true,
        version: "1.0.0",
        main: "dist/index.js",
        scripts: {
          build: "tsc --project tsconfig.json",
          dev: "tsc --watch --project tsconfig.json"
        }
      };
      fs.writeFileSync(path.join(full, 'package.json'), JSON.stringify(pkg, null, 2));
    });
  });
}

//
// ---------------------------
// 실행
// ---------------------------
//
createDirs();
writeRootFiles();
createModuleFiles();

console.log('✅ 루트 구조 기반 Turborepo + dependency 세팅 완료!');
