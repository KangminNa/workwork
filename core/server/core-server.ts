
import express, { Express, Request, Response } from "express";
import path from "path";

type ControllerClass = new () => any;
type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "use" | string;
type RouteConfig = {
  method: HttpMethod;
  path: string;
  controller: ControllerClass;
  handler: string;
};

export class CoreServer {
  private readonly modules: { routes?: RouteConfig[] }[];
  private readonly app: Express;

  constructor(modules: { routes?: RouteConfig[] }[]) {
    this.modules = modules;
    this.app = express();
    this.setupStatic();
  }

  setupStatic(): void {
    const web = path.resolve(__dirname, "../../web");
    this.app.use("/", express.static(web));
    this.app.get("/", (req: Request, res: Response) =>
      res.sendFile(path.join(web, "index.html"))
    );
  }

  setup(): this {
    for (const m of this.modules) {
      if (!m.routes) continue;
      m.routes.forEach((r) => {
        const Ctrl = r.controller;
        const inst = new Ctrl();
        (this.app as any)[r.method](r.path, (req: Request, res: Response) =>
          (inst as any)[r.handler](req, res)
        );
      });
    }
    return this;
  }

  listen(port: number): void {
    this.app.listen(port, () => console.log("[SERVER] listening on", port));
  }
}
