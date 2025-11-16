/**
 * Base Repository
 * 모든 Repository의 기반 클래스
 * Prisma를 추상화하여 비즈니스 모듈에서 Prisma를 직접 다루지 않도록 함
 */

import { prisma } from '../database/PrismaClient';

export abstract class BaseRepository<T = any> {
  protected prisma = prisma;
  protected abstract modelName: string;

  /**
   * ID로 단일 레코드 조회
   */
  async findById(id: string | number): Promise<T | null> {
    const model = this.getModel();
    return await model.findUnique({
      where: { id },
    });
  }

  /**
   * 모든 레코드 조회
   */
  async findAll(options?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }): Promise<T[]> {
    const model = this.getModel();
    return await model.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  /**
   * 조건으로 레코드 조회
   */
  async findMany(where: any, options?: {
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
  }): Promise<T[]> {
    const model = this.getModel();
    return await model.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
      include: options?.include,
    });
  }

  /**
   * 단일 레코드 조회
   */
  async findOne(where: any, include?: any): Promise<T | null> {
    const model = this.getModel();
    return await model.findFirst({
      where,
      include,
    });
  }

  /**
   * 레코드 생성
   */
  async create(data: any): Promise<T> {
    const model = this.getModel();
    return await model.create({
      data,
    });
  }

  /**
   * 레코드 수정
   */
  async update(id: string | number, data: any): Promise<T> {
    const model = this.getModel();
    return await model.update({
      where: { id },
      data,
    });
  }

  /**
   * 레코드 삭제
   */
  async delete(id: string | number): Promise<T> {
    const model = this.getModel();
    return await model.delete({
      where: { id },
    });
  }

  /**
   * 레코드 개수 조회
   */
  async count(where?: any): Promise<number> {
    const model = this.getModel();
    return await model.count({
      where,
    });
  }

  /**
   * 레코드 존재 여부 확인
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * 트랜잭션 실행
   */
  async transaction<TResult>(
    fn: (prisma: typeof this.prisma) => Promise<TResult>
  ): Promise<TResult> {
    return (await this.prisma.$transaction(fn as any)) as TResult;
  }

  /**
   * Prisma 모델 가져오기
   */
  protected getModel(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Raw Query 실행 (필요시)
   */
  protected async executeRaw(query: string, ...params: any[]): Promise<any> {
    return await this.prisma.$executeRawUnsafe(query, ...params);
  }

  /**
   * Raw Query 조회 (필요시)
   */
  protected async queryRaw(query: string, ...params: any[]): Promise<any> {
    return await this.prisma.$queryRawUnsafe(query, ...params);
  }
}

