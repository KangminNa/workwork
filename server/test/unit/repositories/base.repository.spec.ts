import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BaseRepository } from '../../../src/database/base/base.repository';
import { User } from '../../../src/modules/users/entities/user.entity';
import { Workspace } from '../../../src/modules/workspaces/entities/workspace.entity';
import { TestDatabaseHelper } from '../../helpers/test-database.helper';
import { DataSource, Repository } from 'typeorm';

/**
 * BaseRepository 단위 테스트
 * - 불변 CRUD 메서드들의 동작 검증
 * - 실제 DB를 사용한 통합 테스트
 */
describe('BaseRepository (Unit)', () => {
  let dataSource: DataSource;
  let userRepository: BaseRepository<User>;
  let workspaceRepository: BaseRepository<Workspace>;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: './test/.env.test',
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get('DB_HOST'),
            port: config.get('DB_PORT'),
            username: config.get('DB_USERNAME'),
            password: config.get('DB_PASSWORD'),
            database: config.get('DB_DATABASE'),
            entities: [User, Workspace],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([User, Workspace]),
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);

    // BaseRepository 인스턴스 생성
    const userRepo = dataSource.getRepository(User);
    const workspaceRepo = dataSource.getRepository(Workspace);

    userRepository = new BaseRepository<User>(userRepo);
    workspaceRepository = new BaseRepository<Workspace>(workspaceRepo);

    // 테스트 DB 초기화
    await TestDatabaseHelper.connect(configService);
    await TestDatabaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await TestDatabaseHelper.disconnect();
    await dataSource.destroy();
  });

  afterEach(async () => {
    //await TestDatabaseHelper.cleanDatabase();
    //await TestDatabaseHelper.resetSequences();
  });

  describe('save() - 단일 엔티티 저장', () => {
    it('워크스페이스 저장 성공', async () => {
      // Given
      const workspaceData = {
        name: '테스트 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-TEST1',
      };

      // When
      const savedWorkspace = await workspaceRepository.save(workspaceData);

      // Then
      expect(savedWorkspace).toBeDefined();
      expect(savedWorkspace.id).toBeDefined();
      expect(savedWorkspace.name).toBe(workspaceData.name);
      expect(savedWorkspace.inviteCode).toBe(workspaceData.inviteCode);
      expect(savedWorkspace.createdAt).toBeDefined();
      expect(savedWorkspace.updatedAt).toBeDefined();

      // DB에 실제로 저장되었는지 확인
      const found = await workspaceRepository.findById(savedWorkspace.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(workspaceData.name);
    });

    it('사용자 저장 성공', async () => {
      // Given: 먼저 워크스페이스 생성
      const workspace = await workspaceRepository.save({
        name: '테스트 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-TEST2',
      });

      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: '홍길동',
        role: 'owner' as const,
        workspaceId: workspace.id,
      };

      // When
      const savedUser = await userRepository.save(userData);

      // Then
      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.workspaceId).toBe(workspace.id);

      // DB에 실제로 저장되었는지 확인
      const found = await userRepository.findById(savedUser.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe(userData.email);
    });

    it('부분 데이터로 저장 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-TEST3',
      });

      // When: 필수 필드만 제공
      const user = await userRepository.save({
        email: 'minimal@example.com',
        password: 'password',
        name: '최소',
        role: 'member' as const,
        workspaceId: workspace.id,
      });

      // Then
      expect(user.id).toBeDefined();
      expect(user.invitedBy).toBeNull();
    });
  });

  describe('saveMany() - 여러 엔티티 저장', () => {
    it('여러 워크스페이스 저장 성공', async () => {
      // Given
      const workspaces = [
        { name: '워크스페이스1', ownerId: 0, inviteCode: 'WORK-MANY1' },
        { name: '워크스페이스2', ownerId: 0, inviteCode: 'WORK-MANY2' },
        { name: '워크스페이스3', ownerId: 0, inviteCode: 'WORK-MANY3' },
      ];

      // When
      const savedWorkspaces = await workspaceRepository.saveMany(workspaces);

      // Then
      expect(savedWorkspaces).toHaveLength(3);
      savedWorkspaces.forEach((workspace, index) => {
        expect(workspace.id).toBeDefined();
        expect(workspace.name).toBe(workspaces[index].name);
        expect(workspace.inviteCode).toBe(workspaces[index].inviteCode);
      });

      // DB에 실제로 저장되었는지 확인
      for (const workspace of savedWorkspaces) {
        const found = await workspaceRepository.findById(workspace.id);
        expect(found).toBeDefined();
      }
    });

    it('여러 사용자 저장 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '테스트 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-USERS',
      });

      const users = [
        {
          email: 'user1@example.com',
          password: 'password',
          name: '사용자1',
          role: 'owner' as const,
          workspaceId: workspace.id,
        },
        {
          email: 'user2@example.com',
          password: 'password',
          name: '사용자2',
          role: 'member' as const,
          workspaceId: workspace.id,
        },
        {
          email: 'user3@example.com',
          password: 'password',
          name: '사용자3',
          role: 'member' as const,
          workspaceId: workspace.id,
        },
      ];

      // When
      const savedUsers = await userRepository.saveMany(users);

      // Then
      expect(savedUsers).toHaveLength(3);
      savedUsers.forEach((user, index) => {
        expect(user.id).toBeDefined();
        expect(user.email).toBe(users[index].email);
        expect(user.name).toBe(users[index].name);
      });
    });

    it('빈 배열 저장 시 빈 배열 반환', async () => {
      // When
      const result = await workspaceRepository.saveMany([]);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('update() - 엔티티 업데이트', () => {
    it('워크스페이스 업데이트 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '원본 이름',
        ownerId: 0,
        inviteCode: 'WORK-UPD1',
      });

      // When
      const updated = await workspaceRepository.update(workspace.id, {
        name: '수정된 이름',
        ownerId: 999,
      });

      // Then
      expect(updated).toBeDefined();
      expect(updated.name).toBe('수정된 이름');
      expect(updated.ownerId).toBe(999);
      expect(updated.inviteCode).toBe('WORK-UPD1'); // 변경하지 않은 필드는 유지
    });

    it('사용자 업데이트 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-UPD2',
      });

      const user = await userRepository.save({
        email: 'original@example.com',
        password: 'password',
        name: '원본 이름',
        role: 'member' as const,
        workspaceId: workspace.id,
      });

      // When
      await userRepository.update(user.id, {
        name: '수정된 이름',
        role: 'owner' as const,
      });

      // Then
      const updated = await userRepository.findById(user.id);
      expect(updated?.name).toBe('수정된 이름');
      expect(updated?.role).toBe('owner');
      expect(updated?.email).toBe('original@example.com'); // 변경하지 않은 필드는 유지
    });

    it('존재하지 않는 엔티티 업데이트 시 NotFoundException', async () => {
      // When & Then
      await expect(
        workspaceRepository.update(99999, {
          name: '없는 워크스페이스',
        }),
      ).rejects.toThrow('Entity with id 99999 not found');
    });
  });

  describe('delete() - 단일 엔티티 삭제', () => {
    it('워크스페이스 삭제 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '삭제될 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-DEL1',
      });

      // When
      const deleteResult = await workspaceRepository.delete(workspace.id);

      // Then
      expect(deleteResult).toBe(true);

      // DB에서 확인
      const found = await workspaceRepository.findById(workspace.id);
      expect(found).toBeNull();
    });

    it('사용자 삭제 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-DEL2',
      });

      const user = await userRepository.save({
        email: 'delete@example.com',
        password: 'password',
        name: '삭제될 사용자',
        role: 'member' as const,
        workspaceId: workspace.id,
      });

      // When
      const deleteResult = await userRepository.delete(user.id);

      // Then
      expect(deleteResult).toBe(true);

      // DB에서 확인
      const found = await userRepository.findById(user.id);
      expect(found).toBeNull();
    });

    it('존재하지 않는 엔티티 삭제 시 false 반환', async () => {
      // When
      const result = await workspaceRepository.delete(99999);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('deleteMany() - 여러 엔티티 삭제', () => {
    it('여러 워크스페이스 삭제 성공', async () => {
      // Given
      const workspaces = await workspaceRepository.saveMany([
        { name: '워크스페이스1', ownerId: 0, inviteCode: 'WORK-DELM1' },
        { name: '워크스페이스2', ownerId: 0, inviteCode: 'WORK-DELM2' },
        { name: '워크스페이스3', ownerId: 0, inviteCode: 'WORK-DELM3' },
      ]);

      const ids = workspaces.map((w) => w.id);

      // When
      const deleteResult = await workspaceRepository.deleteMany(ids);

      // Then
      expect(deleteResult).toBe(3);

      // DB에서 확인
      for (const id of ids) {
        const found = await workspaceRepository.findById(id);
        expect(found).toBeNull();
      }
    });

    it('일부만 존재하는 ID로 삭제 시 존재하는 것만 삭제', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-DELM4',
      });

      // When: 존재하는 ID 1개 + 존재하지 않는 ID 2개
      const deleteResult = await workspaceRepository.deleteMany([
        workspace.id,
        99998,
        99999,
      ]);

      // Then
      expect(deleteResult).toBe(1);
    });

    it('빈 배열로 삭제 시 0 반환', async () => {
      // When
      const result = await workspaceRepository.deleteMany([]);

      // Then
      expect(result).toBe(0);
    });
  });

  describe('findById() - ID로 엔티티 조회', () => {
    it('워크스페이스 조회 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '테스트 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-FIND1',
      });

      // When
      const found = await workspaceRepository.findById(workspace.id);

      // Then
      expect(found).toBeDefined();
      expect(found?.id).toBe(workspace.id);
      expect(found?.name).toBe('테스트 워크스페이스');
      expect(found?.inviteCode).toBe('WORK-FIND1');
    });

    it('사용자 조회 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-FIND2',
      });

      const user = await userRepository.save({
        email: 'find@example.com',
        password: 'password',
        name: '찾을 사용자',
        role: 'member' as const,
        workspaceId: workspace.id,
      });

      // When
      const found = await userRepository.findById(user.id);

      // Then
      expect(found).toBeDefined();
      expect(found?.id).toBe(user.id);
      expect(found?.email).toBe('find@example.com');
      expect(found?.name).toBe('찾을 사용자');
    });

    it('존재하지 않는 ID 조회 시 null 반환', async () => {
      // When
      const found = await workspaceRepository.findById(99999);

      // Then
      expect(found).toBeNull();
    });
  });

  // createQueryBuilder와 getRawRepository는 protected이므로
  // 구체적인 Repository 클래스(UserRepository, WorkspaceRepository)에서 테스트
});

