import { BaseEntity } from '../../../../core/types/base.entity';
import { Email } from '../values/email.vo';
import { Password } from '../values/password.vo';
import { UserRole } from '../user-role.enum';
import { UserStatus } from '../user-status.enum';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { CryptoUtil } from '../../../../common/utils/crypto.util';
import { randomUUID } from 'crypto';

/**
 * User Entity (Aggregate Root)
 * - 사용자의 비즈니스 로직을 포함
 * - 자신의 규칙을 스스로 검증
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
   * ROOT 사용자 생성
   */
  static createRoot(
    email: string,
    username: string,
    password: string,
    cryptoUtil: CryptoUtil,
  ): User {
    const user = new User();
    user._id = randomUUID();
    user._email = Email.create(email);
    user._username = username;
    user._password = Password.create(password, cryptoUtil);
    user._role = UserRole.ROOT;
    user._status = UserStatus.PENDING;

    // Domain Event 발행 (추후 구현)
    // user.addDomainEvent(new UserCreatedEvent(user._id));

    return user;
  }

  /**
   * ADMIN 사용자 생성
   */
  static createAdmin(
    email: string,
    username: string,
    password: string,
    cryptoUtil: CryptoUtil,
  ): User {
    const user = new User();
    user._id = randomUUID();
    user._email = Email.create(email);
    user._username = username;
    user._password = Password.create(password, cryptoUtil);
    user._role = UserRole.ADMIN;
    user._status = UserStatus.APPROVED; // ADMIN은 항상 승인됨

    return user;
  }

  /**
   * 그룹 멤버 생성 (USER)
   */
  static createGroupMember(
    username: string,
    password: string,
    groupId: string,
    cryptoUtil: CryptoUtil,
  ): User {
    const user = new User();
    user._id = randomUUID();
    // USER는 email 없음
    user._username = username;
    user._password = Password.create(password, cryptoUtil);
    user._role = UserRole.USER;
    user._status = UserStatus.APPROVED; // USER는 즉시 승인
    user._groupId = groupId;

    // Domain Event 발행
    // user.addDomainEvent(new UserCreatedEvent(user._id));

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
  // Business Logic Methods
  // ============================================

  /**
   * ROOT 사용자 승인
   */
  approve(groupId: string): void {
    this.validateCanBeApproved();

    this._status = UserStatus.APPROVED;
    this._groupId = groupId;
    this.touch();

    // Domain Event 발행
    // this.addDomainEvent(new UserApprovedEvent(this._id, groupId));
  }

  /**
   * ROOT 사용자 거절
   */
  reject(): void {
    if (this._role !== UserRole.ROOT) {
      throw new DomainException('Only ROOT users can be rejected');
    }

    if (this._status !== UserStatus.PENDING) {
      throw new DomainException('User is not pending approval');
    }

    this._status = UserStatus.REJECTED;
    this.touch();

    // Domain Event 발행
    // this.addDomainEvent(new UserRejectedEvent(this._id));
  }

  /**
   * 비밀번호 변경
   */
  changePassword(newPassword: string, cryptoUtil: CryptoUtil): void {
    this._password = Password.create(newPassword, cryptoUtil);
    this.touch();

    // Domain Event 발행
    // this.addDomainEvent(new PasswordChangedEvent(this._id));
  }

  /**
   * 사용자명 변경
   */
  changeUsername(newUsername: string): void {
    if (!newUsername || newUsername.trim().length === 0) {
      throw new DomainException('Username cannot be empty');
    }

    this._username = newUsername.trim();
    this.touch();
  }

  /**
   * 비밀번호 검증
   */
  async verifyPassword(plainPassword: string, cryptoUtil: CryptoUtil): Promise<boolean> {
    return this._password.compare(plainPassword, cryptoUtil);
  }

  // ============================================
  // Query Methods (상태 확인)
  // ============================================

  /**
   * ADMIN 여부
   */
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * ROOT 여부
   */
  isRoot(): boolean {
    return this._role === UserRole.ROOT;
  }

  /**
   * USER 여부
   */
  isUser(): boolean {
    return this._role === UserRole.USER;
  }

  /**
   * 승인됨 여부
   */
  isApproved(): boolean {
    return this._status === UserStatus.APPROVED;
  }

  /**
   * 대기 중 여부
   */
  isPending(): boolean {
    return this._status === UserStatus.PENDING;
  }

  /**
   * 사용자 생성 가능 여부
   */
  canCreateUsers(): boolean {
    return this.isRoot() && this.isApproved() && this._groupId !== undefined;
  }

  /**
   * 그룹 생성 가능 여부
   */
  canCreateGroup(): boolean {
    return this.isRoot() && this.isApproved();
  }

  /**
   * 특정 그룹에 속해있는지 확인
   */
  isInGroup(groupId: string): boolean {
    return this._groupId === groupId;
  }

  /**
   * ROOT 승인 가능 여부
   */
  canApproveRoot(): boolean {
    return this.isAdmin();
  }

  // ============================================
  // Validation Methods (비즈니스 규칙 검증)
  // ============================================

  /**
   * 승인 가능 여부 검증
   */
  private validateCanBeApproved(): void {
    if (this._role !== UserRole.ROOT) {
      throw new DomainException('Only ROOT users can be approved');
    }

    if (this._status !== UserStatus.PENDING) {
      throw new DomainException('User is not pending approval');
    }

    if (this._groupId) {
      throw new DomainException('User already has a group');
    }
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

