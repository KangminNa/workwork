
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
