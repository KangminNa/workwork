/**
 * Base Controller
 * 모든 컨트롤러의 기본 클래스
 */

import { Request, Response } from 'express';

export abstract class BaseController {
  /**
   * 요청 처리 메인 메서드
   */
  public async execute(req: Request, res: Response): Promise<void> {
    try {
      await this.executeImpl(req, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * 실제 로직 구현 (하위 클래스에서 구현)
   */
  protected abstract executeImpl(req: Request, res: Response): Promise<void>;

  /**
   * 성공 응답
   */
  protected ok<T>(res: Response, data?: T): Response {
    return res.status(200).json({
      success: true,
      data,
      meta: {
        timestamp: Date.now(),
      },
    });
  }

  /**
   * 생성 성공 응답
   */
  protected created<T>(res: Response, data?: T): Response {
    return res.status(201).json({
      success: true,
      data,
      meta: {
        timestamp: Date.now(),
      },
    });
  }

  /**
   * 에러 응답
   */
  protected fail(res: Response, error: string, statusCode: number = 400): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: `ERROR_${statusCode}`,
        message: error,
      },
      meta: {
        timestamp: Date.now(),
      },
    });
  }

  /**
   * 클라이언트 에러 (400)
   */
  protected clientError(res: Response, message: string = 'Bad Request'): Response {
    return this.fail(res, message, 400);
  }

  /**
   * 인증 실패 (401)
   */
  protected unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.fail(res, message, 401);
  }

  /**
   * 권한 없음 (403)
   */
  protected forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.fail(res, message, 403);
  }

  /**
   * 찾을 수 없음 (404)
   */
  protected notFound(res: Response, message: string = 'Not Found'): Response {
    return this.fail(res, message, 404);
  }

  /**
   * 에러 핸들링
   */
  protected handleError(error: any, res: Response): void {
    console.error('Controller Error:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    this.fail(res, message, statusCode);
  }

  /**
   * 요청 유효성 검사
   */
  protected validateRequest(req: Request, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw {
        statusCode: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      };
    }
  }
}
