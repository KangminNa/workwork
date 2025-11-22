import "reflect-metadata";

export const CONTROLLER_TYPE = Symbol("controller_type");
export const CONTROLLER_ROUTE = Symbol("controller_route");
export const CONTROLLER_METHOD = Symbol("controller_method");
export const WORKER_QUEUE = Symbol("worker_queue");

// 1) GET Controller (server-driven screen)
export function GetController(route: string) {
  return function (target: any) {
    Reflect.defineMetadata(CONTROLLER_TYPE, "GET", target);
    Reflect.defineMetadata(CONTROLLER_ROUTE, route, target);
  };
}

// 2) 일반 API Controller
export function ApiController(method: string, route: string) {
  return function (target: any) {
    Reflect.defineMetadata(CONTROLLER_TYPE, "API", target);
    Reflect.defineMetadata(CONTROLLER_METHOD, method.toLowerCase(), target);
    Reflect.defineMetadata(CONTROLLER_ROUTE, route, target);
  };
}

// 3) Worker Controller
export function WorkerController(queueName: string) {
  return function (target: any) {
    Reflect.defineMetadata(CONTROLLER_TYPE, "WORKER", target);
    Reflect.defineMetadata(WORKER_QUEUE, queueName, target);
  };
}
