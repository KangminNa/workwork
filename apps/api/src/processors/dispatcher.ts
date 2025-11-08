import { Response, NextFunction } from 'express';
import { ParsedRequest } from './request_parser';
import { UsecaseRegistry } from '@workwork/feature';

export async function dispatcher(req: ParsedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.useCaseName) {
      throw new Error('UseCase name not found in request.');
    }

    const usecase = UsecaseRegistry.getUsecase(req.useCaseName);
    if (!usecase) {
      throw new Error(`UseCase ${req.useCaseName} not found.`);
    }

    // 유스케이스 실행
    const result = await usecase.execute(req.parsedData);
    
    // 결과를 응답 객체에 저장하거나 다음 미들웨어로 전달
    res.locals.usecaseResult = result;
    next();

  } catch (error) {
    next(error);
  }
}
