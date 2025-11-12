import { Request, Response } from 'express';
import { Socket } from 'socket.io';
// 'bullmq'와 같은 큐 라이브러리를 사용한다고 가정합니다.
// 실제 라이브러리에 따라 Job 타입을 가져와야 합니다.
import { Job } from 'bullmq';

// --- Controller-related types ---

/**
 * Controller가 처리할 클라이언트의 유형
 */
export type ControllerType = 'http' | 'topic' | 'worker';

/**
 * HTTP 요청 컨텍스트
 */
export interface HttpContext {
  req: Request;
  res: Response;
}

/**
 * WebSocket/Socket.io 토픽 컨텍스트
 */
export interface TopicContext {
  socket: Socket;
  event: string;
  data: unknown;
}

/**
 * 백그라운드 Worker 컨텍스트
 */
export interface WorkerContext {
  job: Job;
}

/**
 * Controller의 execute 메서드에 전달될 컨텍스트 객체의 유니온 타입
 */
export type ControllerContext = HttpContext | TopicContext | WorkerContext;

/**
 * Controller에서 추출된 공통 메타데이터
 */
export interface ControllerMeta {
  path: string;
  user: any; // TODO: 실제 사용자 인증 타입을 정의해야 합니다.
}


// --- Generic Layer Interfaces (Optional but recommended) ---

/**
 * 모든 Service 클래스가 구현할 수 있는 기본 인터페이스
 */
export interface IService<I, O> {
  execute(data: I): Promise<O>;
}

/**
 * 모든 Repository 클래스가 구현할 수 있는 기본 인터페이스
 */
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string | number): Promise<T | null>;
  save(data: T): Promise<T>;
  update(id: string | number, data: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}
