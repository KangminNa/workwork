import { BaseEntity } from '../../../../core/base/base.entity';
import { Email } from '../values/email.vo';
import { Password } from '../values/password.vo';
import { UserRole } from '../user-role.enum';
import { UserStatus } from '../user-status.enum';
import { randomUUID } from 'crypto';

/**
 * User Entity (Aggregate Root)
 * - 사용자 상태 중심 모델
 * - 규칙/검증은 Service/Policy에서 처리
 */
export class User extends BaseEntity {
  private _email?: Email;
  private _username!: string;
  private _password!: Password;
  private _role!: UserRole;
  private _status!: UserStatus;
  private _groupId?: string;

  private constructor() {
    super();
  }

  // ============================================
  // Getters
  // ============================================

  get email(): Email | undefined {
    return this._email;
  }

  get username(): string {
    return this._username;
  }

  get password(): Password {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get groupId(): string | undefined {
    return this._groupId;
  }

  // ============================================
  // Factory Methods
  // ============================================

  /**
   * 새 사용자 생성 (비즈니스 규칙은 Service에서 처리)
   */
  static create(props: {
    email?: Email;
    username: string;
    password: Password;
    role: UserRole;
    status: UserStatus;
    groupId?: string;
  }): User {
    const user = new User();
    user._id = randomUUID();
    user._email = props.email;
    user._username = props.username;
    user._password = props.password;
    user._role = props.role;
    user._status = props.status;
    user._groupId = props.groupId;

    return user;
  }

  /**
   * DB에서 로드 (재구성)
   */
  static reconstitute(props: {
    id: string;
    email: string | null;
    username: string;
    hashedPassword: string;
    role: string;
    status: string;
    groupId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    const user = new User();
    user._id = props.id;
    user._email = props.email ? Email.create(props.email) : undefined;
    user._username = props.username;
    user._password = Password.fromHashed(props.hashedPassword);
    user._role = props.role as UserRole;
    user._status = props.status as UserStatus;
    user._groupId = props.groupId || undefined;
    user._createdAt = props.createdAt;
    user._updatedAt = props.updatedAt;

    return user;
  }

  // ============================================
  // Mutation Methods (상태 변경은 Service에서 검증)
  // ============================================

  setEmail(email?: Email): void {
    this._email = email;
    this.touch();
  }

  setUsername(username: string): void {
    this._username = username;
    this.touch();
  }

  setPassword(password: Password): void {
    this._password = password;
    this.touch();
  }

  setRole(role: UserRole): void {
    this._role = role;
    this.touch();
  }

  setStatus(status: UserStatus): void {
    this._status = status;
    this.touch();
  }

  setGroupId(groupId?: string): void {
    this._groupId = groupId;
    this.touch();
  }

  // ============================================
  // Conversion Methods
  // ============================================

  /**
   * DB 저장을 위한 Plain Object로 변환
   */
  toPersistence(): {
    id: string;
    email: string | null;
    username: string;
    password: string;
    role: string;
    status: string;
    groupId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      email: this._email?.getValue() || null,
      username: this._username,
      password: this._password.getHashedValue(),
      role: this._role,
      status: this._status,
      groupId: this._groupId || null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * 비밀번호 제외 응답 DTO로 변환
   */
  toResponse(): {
    id: string;
    email: string | null;
    username: string;
    role: string;
    status: string;
    groupId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      email: this._email?.getValue() || null,
      username: this._username,
      role: this._role,
      status: this._status,
      groupId: this._groupId || null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
