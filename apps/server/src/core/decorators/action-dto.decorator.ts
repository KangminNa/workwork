import { SetMetadata } from '@nestjs/common';

/**
 * Action DTO Decorator
 * - BaseController의 동적 액션 파라미터를 DTO로 검증하기 위한 메타데이터
 * - @ActionDto(LoginDto)
 */
export const ACTION_DTO_KEY = 'actionDto';
export const ActionDto = (dto: new () => any) =>
  SetMetadata(ACTION_DTO_KEY, dto);
