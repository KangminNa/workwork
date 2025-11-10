import { cp, rm, mkdir } from 'fs/promises';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Source directories
const serverBuildDir = path.resolve(rootDir, 'apps/server/dist');
const serverPkgJson = path.resolve(rootDir, 'apps/server/package.json');
const browserBuildDir = path.resolve(rootDir, 'apps/browser/dist');

// Destination directories
const serverDestDir = path.resolve(distDir, 'server');
const browserDestDir = path.resolve(distDir, 'browser');

async function collectArtifacts() {
  console.log('🧹 Cleaning up old root dist folder...');
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  console.log('✅ Root dist folder cleaned.');

  // --- Collect Server Artifacts ---
  console.log('🚚 Copying server artifacts to root dist...');
  await cp(serverBuildDir, serverDestDir, { recursive: true });
  await cp(serverPkgJson, path.resolve(serverDestDir, 'package.json'));
  console.log('✅ Server artifacts copied.');

  // --- Collect Browser Artifacts ---
  console.log('🚚 Copying browser artifacts to root dist...');
  await cp(browserBuildDir, browserDestDir, { recursive: true });
  console.log('✅ Browser artifacts copied.');

  // --- Install Server Production Dependencies ---
  console.log('📦 Installing server production dependencies in dist/server...');
  execSync('pnpm install --prod', { cwd: serverDestDir, stdio: 'inherit' });
  console.log('✅ Server dependencies installed.');

  console.log('\n✨ Build artifacts collected successfully in the root dist folder!');
  console.log('You can now deploy the contents of the /dist directory.');
}

collectArtifacts().catch((err) => {
  console.error('❌ Error collecting artifacts:', err);
  process.exit(1);
});
