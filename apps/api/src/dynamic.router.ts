import { Router } from 'express';
import { requestParser } from './processors/request.parser';
import { dispatcher } from './processors/dispatcher';
import { requestHandler } from './processors/request.handler';

const router = Router();

// 모든 API 요청에 대해 파싱, 디스패치, 핸들링 미들웨어를 적용
router.all('/api/*', requestParser, dispatcher, requestHandler);

export { router as dynamicRouter };
