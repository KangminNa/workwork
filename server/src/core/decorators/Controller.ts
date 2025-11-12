import { container } from "../Container";

export function Controller(type: "http" | "topic" | "worker", path: string) {
  return function (target: any) {
    Reflect.defineMetadata("controller:type", type, target);
    Reflect.defineMetadata("controller:path", path.toLowerCase(), target);
    container.registerController(target);
  };
}
