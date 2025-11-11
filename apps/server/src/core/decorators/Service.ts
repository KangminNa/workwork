import { container } from "../Container";

export function Service(name: string) {
  return function (target: any) {
    Reflect.defineMetadata("service:name", name.toLowerCase(), target);
    container.registerService(target);
  };
}
