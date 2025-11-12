import { container } from "../Container";

export function Repository(name: string) {
  return function (target: any) {
    Reflect.defineMetadata("repository:name", name.toLowerCase(), target);
    container.registerRepository(target);
  };
}
