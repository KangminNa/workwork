import { container } from "./Container";

export class Resolver {
  static async handle(type: "http" | "topic" | "worker", path: string, context: any) {
    const controller = container.resolveController(type, path);
    if (!controller) throw new Error(`No controller for ${type}:${path}`);

    // 규칙: 'boardCreate' -> Service: 'boardCreate', Repo: 'board'
    const service = container.resolveService(path);
    const repoKey = path.replace(/(create|update|delete|get|list).*$/, "");
    const repository = container.resolveRepository(repoKey);

    if (!service) throw new Error(`Missing Service for ${path}`);
    // Repository는 선택적일 수 있으므로 없어도 에러를 던지지 않을 수 있습니다.
    // if (!repository) throw new Error(`Missing Repository for ${repoKey}`);

    await controller.execute({ ...context, service, repository });
  }
}
