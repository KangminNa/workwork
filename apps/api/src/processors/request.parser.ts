import { Request, Response, NextFunction } from 'express';

export interface ParsedRequest extends Request {
  parsedData?: any;
  useCaseName?: string;
}

export function requestParser(req: ParsedRequest, res: Response, next: NextFunction) {
  // TODO: 요청 파싱 로직 구현 (예: 바디, 쿼리, 파라미터에서 필요한 데이터 추출)
  req.parsedData = { ...req.body, ...req.query, ...req.params };

  // TODO: 유스케이스 이름을 요청 경로에서 추출하는 로직 구현
  // 예: /api/login -> login
  // 예: /api/users/:id -> users
  const pathSegments = req.path.split('/').filter(segment => segment !== '');
  if (pathSegments.length > 0) {
    req.useCaseName = pathSegments[pathSegments.length - 1];
    if (req.useCaseName.startsWith(':')) {
      req.useCaseName = pathSegments[pathSegments.length - 2]; // id와 같은 파라미터인 경우 이전 세그먼트 사용
    }
  }

  next();
}
