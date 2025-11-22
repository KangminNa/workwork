
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
