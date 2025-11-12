import { container } from "./Container";

export class Resolver {
  /**
   * Controller를 찾아서 실행
   * 의존성 주입은 Container가 자동으로 처리
   */
  static async handle(type: "http" | "topic" | "worker", path: string, context: any) {
    // Controller 인스턴스 생성 (의존성 자동 주입)
    const controller = container.resolveController(type, path);
    
    if (!controller) {
      throw new Error(`No controller registered for ${type}:${path}`);
    }

    // Controller가 생성자에서 이미 의존성을 받았으므로
    // context만 전달하여 실행
    await controller.execute(context);
  }
}
