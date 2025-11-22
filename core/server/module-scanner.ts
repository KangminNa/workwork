
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
