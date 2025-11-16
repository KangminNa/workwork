/**
 * Auto Resolver
 * Identifier를 기반으로 자동으로 컨트롤러를 매핑하고 라우팅
 */

import { Request, Response, Router } from 'express';
import { BaseController } from '../controllers/BaseController';

/**
 * 컨트롤러 맵핑 정보
 */
export interface ControllerMapping {
  identifier: string;
  controller: BaseController;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  permissions?: string[];
}

/**
 * AutoResolver 클래스
 */
export class AutoResolver {
  private mappings: Map<string, ControllerMapping> = new Map();
  private router: Router;

  constructor() {
    this.router = Router();
  }

  /**
   * 컨트롤러 등록
   */
  public register(mapping: ControllerMapping): void {
    this.mappings.set(mapping.identifier, mapping);
    this.createRoute(mapping);
  }

  /**
   * 여러 컨트롤러 일괄 등록
   */
  public registerMany(mappings: ControllerMapping[]): void {
    mappings.forEach(mapping => this.register(mapping));
  }

  /**
   * Identifier로 컨트롤러 찾기
   */
  public resolve(identifier: string): ControllerMapping | undefined {
    return this.mappings.get(identifier);
  }

  /**
   * 라우트 생성
   */
  private createRoute(mapping: ControllerMapping): void {
    const { method, path, controller } = mapping;

    switch (method) {
      case 'GET':
        this.router.get(path, (req, res) => controller.execute(req, res));
        break;
      case 'POST':
        this.router.post(path, (req, res) => controller.execute(req, res));
        break;
      case 'PUT':
        this.router.put(path, (req, res) => controller.execute(req, res));
        break;
      case 'DELETE':
        this.router.delete(path, (req, res) => controller.execute(req, res));
        break;
      case 'PATCH':
        this.router.patch(path, (req, res) => controller.execute(req, res));
        break;
    }

    console.log(`[AutoResolver] Registered: ${method} ${path} -> ${mapping.identifier}`);
  }

  /**
   * Identifier 기반 액션 실행
   */
  public async executeAction(identifier: string, req: Request, res: Response): Promise<void> {
    const mapping = this.resolve(identifier);

    if (!mapping) {
      res.status(404).json({
        success: false,
        error: {
          code: 'IDENTIFIER_NOT_FOUND',
          message: `No controller found for identifier: ${identifier}`,
        },
      });
      return;
    }

    // 권한 검사
    if (mapping.permissions && mapping.permissions.length > 0) {
      // TODO: 권한 검사 로직
    }

    // 컨트롤러 실행
    await mapping.controller.execute(req, res);
  }

  /**
   * 라우터 가져오기
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * 등록된 모든 매핑 정보 가져오기
   */
  public getAllMappings(): ControllerMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * 매핑 정보 출력 (디버깅용)
   */
  public printMappings(): void {
    console.log('\n=== AutoResolver Mappings ===');
    this.mappings.forEach((mapping, identifier) => {
      console.log(`${identifier}: ${mapping.method} ${mapping.path}`);
    });
    console.log('=============================\n');
  }
}

/**
 * 싱글톤 인스턴스
 */
export const autoResolver = new AutoResolver();
