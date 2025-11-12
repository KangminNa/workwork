import "reflect-metadata";

export class Container {
  private controllers = new Map<string, any>();
  private services = new Map<string, any>();
  private repositories = new Map<string, any>();

  registerController(target: any) {
    const type = Reflect.getMetadata("controller:type", target);
    const path = Reflect.getMetadata("controller:path", target);
    this.controllers.set(`${type}:${path}`, target);
  }

  registerService(target: any) {
    const name = Reflect.getMetadata("service:name", target);
    this.services.set(name, target);
  }

  registerRepository(target: any) {
    const name = Reflect.getMetadata("repository:name", target);
    this.repositories.set(name, target);
  }

  resolveController(type: string, path: string) {
    const key = `${type}:${path}`;
    const Ctor = this.controllers.get(key);
    return Ctor ? new Ctor() : null;
  }

  resolveService(name: string) {
    const Ctor = this.services.get(name);
    return Ctor ? new Ctor() : null;
  }

  resolveRepository(name: string) {
    const Ctor = this.repositories.get(name);
    return Ctor ? new Ctor() : null;
  }
}

export const container = new Container();
