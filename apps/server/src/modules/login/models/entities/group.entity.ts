import { BaseEntity } from '../../../../core/types/base.entity';
import { GroupCode } from '../values/group-code.vo';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { CryptoUtil } from '../../../../common/utils/crypto.util';
import { randomUUID } from 'crypto';

/**
 * Group Entity (Aggregate Root)
 * - 그룹의 비즈니스 로직을 포함
 */
export class Group extends BaseEntity {
  private _code: GroupCode;
  private _name: string;
  private _description?: string;
  private _ownerId: string;

  private constructor() {
    super();
  }

  // ============================================
  // Getters
  // ============================================

  get code(): GroupCode {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  // ============================================
  // Factory Methods
  // ============================================

  /**
   * 새로운 그룹 생성
   */
  static create(
    name: string,
    ownerId: string,
    cryptoUtil: CryptoUtil,
    description?: string,
  ): Group {
    const group = new Group();
    group._id = randomUUID();
    group._code = GroupCode.generate(cryptoUtil);
    group._name = name;
    group._description = description;
    group._ownerId = ownerId;

    // Domain Event 발행
    // group.addDomainEvent(new GroupCreatedEvent(group._id, ownerId));

    return group;
  }

  /**
   * DB에서 로드 (재구성)
   */
  static reconstitute(props: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Group {
    const group = new Group();
    group._id = props.id;
    group._code = GroupCode.create(props.code);
    group._name = props.name;
    group._description = props.description || undefined;
    group._ownerId = props.ownerId;
    group._createdAt = props.createdAt;
    group._updatedAt = props.updatedAt;

    return group;
  }

  // ============================================
  // Business Logic Methods
  // ============================================

  /**
   * 그룹명 변경
   */
  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new DomainException('Group name cannot be empty');
    }

    this._name = newName.trim();
    this.touch();

    // Domain Event 발행
    // this.addDomainEvent(new GroupRenamedEvent(this._id, newName));
  }

  /**
   * 설명 업데이트
   */
  updateDescription(description: string): void {
    this._description = description.trim() || undefined;
    this.touch();
  }

  // ============================================
  // Query Methods
  // ============================================

  /**
   * 특정 사용자가 소유자인지 확인
   */
  isOwnedBy(userId: string): boolean {
    return this._ownerId === userId;
  }

  // ============================================
  // Conversion Methods
  // ============================================

  /**
   * DB 저장을 위한 Plain Object로 변환
   */
  toPersistence(): {
    id: string;
    code: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      code: this._code.getValue(),
      name: this._name,
      description: this._description || null,
      ownerId: this._ownerId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * 응답 DTO로 변환
   */
  toResponse(): {
    id: string;
    code: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return this.toPersistence();
  }
}

