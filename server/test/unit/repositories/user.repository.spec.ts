import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../src/modules/users/repositories/user.repository';
import { User } from '../../../src/modules/users/entities/user.entity';
import { Workspace } from '../../../src/modules/workspaces/entities/workspace.entity';
import { TestDatabaseHelper } from '../../helpers/test-database.helper';
import { DataSource } from 'typeorm';

/**
 * UserRepository 단위 테스트
 * - BaseRepository의 불변 메서드 + 비즈니스 특화 쿼리 메서드 테스트
 * - 실제 DB를 사용한 통합 테스트
 */
describe('UserRepository (Unit)', () => {
  let dataSource: DataSource;
  let userRepository: UserRepository;
  let configService: ConfigService;
  let testWorkspace: Workspace;

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
      providers: [UserRepository],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<UserRepository>(UserRepository);

    // 테스트 DB 초기화
    await TestDatabaseHelper.connect(configService);
    await TestDatabaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await TestDatabaseHelper.disconnect();
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await TestDatabaseHelper.cleanDatabase();
    await TestDatabaseHelper.resetSequences();

    // 각 테스트마다 테스트용 워크스페이스 생성
    const workspaceRepo = dataSource.getRepository(Workspace);
    testWorkspace = await workspaceRepo.save({
      name: '테스트 워크스페이스',
      ownerId: 0,
      inviteCode: 'WORK-TEST',
    });
  });

  describe('findByEmail() - 이메일로 사용자 조회', () => {
    it('이메일로 사용자 조회 성공', async () => {
      // Given
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: '홍길동',
        role: 'owner' as const,
        workspaceId: testWorkspace.id,
      };

      await userRepository.save(userData);

      // When
      const found = await userRepository.findByEmail('test@example.com');

      // Then
      expect(found).toBeDefined();
      expect(found.email).toBe('test@example.com');
      expect(found.name).toBe('홍길동');
      expect(found.password).toBe('hashedpassword');
    });

    it('존재하지 않는 이메일 조회 시 null 반환', async () => {
      // When
      const found = await userRepository.findByEmail('notfound@example.com');

      // Then
      expect(found).toBeNull();
    });

    it('대소문자 구분하여 조회', async () => {
      // Given
      await userRepository.save({
        email: 'Test@Example.com',
        password: 'password',
        name: '사용자',
        role: 'owner' as const,
        workspaceId: testWorkspace.id,
      });

      // When: 소문자로 조회
      const found = await userRepository.findByEmail('test@example.com');

      // Then: 대소문자가 다르면 찾지 못함
      expect(found).toBeNull();
    });

    it('여러 사용자 중 특정 이메일 조회', async () => {
      // Given: 여러 사용자 생성
      await userRepository.saveMany([
        {
          email: 'user1@example.com',
          password: 'password',
          name: '사용자1',
          role: 'owner' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'user2@example.com',
          password: 'password',
          name: '사용자2',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'user3@example.com',
          password: 'password',
          name: '사용자3',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
      ]);

      // When
      const found = await userRepository.findByEmail('user2@example.com');

      // Then
      expect(found).toBeDefined();
      expect(found.email).toBe('user2@example.com');
      expect(found.name).toBe('사용자2');
    });
  });

  describe('existsByEmail() - 이메일 존재 여부 확인', () => {
    it('존재하는 이메일 확인 - true 반환', async () => {
      // Given
      await userRepository.save({
        email: 'exists@example.com',
        password: 'password',
        name: '존재하는 사용자',
        role: 'owner' as const,
        workspaceId: testWorkspace.id,
      });

      // When
      const exists = await userRepository.existsByEmail('exists@example.com');

      // Then
      expect(exists).toBe(true);
    });

    it('존재하지 않는 이메일 확인 - false 반환', async () => {
      // When
      const exists = await userRepository.existsByEmail('notexists@example.com');

      // Then
      expect(exists).toBe(false);
    });

    it('여러 사용자가 있을 때 특정 이메일 존재 확인', async () => {
      // Given
      await userRepository.saveMany([
        {
          email: 'user1@example.com',
          password: 'password',
          name: '사용자1',
          role: 'owner' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'user2@example.com',
          password: 'password',
          name: '사용자2',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
      ]);

      // When
      const exists1 = await userRepository.existsByEmail('user1@example.com');
      const exists2 = await userRepository.existsByEmail('user2@example.com');
      const exists3 = await userRepository.existsByEmail('user3@example.com');

      // Then
      expect(exists1).toBe(true);
      expect(exists2).toBe(true);
      expect(exists3).toBe(false);
    });

    it('삭제된 사용자 이메일 확인 - false 반환', async () => {
      // Given
      const user = await userRepository.save({
        email: 'deleted@example.com',
        password: 'password',
        name: '삭제될 사용자',
        role: 'owner' as const,
        workspaceId: testWorkspace.id,
      });

      // When: 삭제 전
      const existsBefore = await userRepository.existsByEmail('deleted@example.com');

      // Then
      expect(existsBefore).toBe(true);

      // When: 삭제 후
      await userRepository.delete(user.id);
      const existsAfter = await userRepository.existsByEmail('deleted@example.com');

      // Then
      expect(existsAfter).toBe(false);
    });
  });

  describe('findByWorkspace() - 워크스페이스로 사용자 목록 조회', () => {
    it('워크스페이스의 모든 사용자 조회', async () => {
      // Given
      await userRepository.saveMany([
        {
          email: 'owner@example.com',
          password: 'password',
          name: 'Owner',
          role: 'owner' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'member1@example.com',
          password: 'password',
          name: 'Member1',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'member2@example.com',
          password: 'password',
          name: 'Member2',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
      ]);

      // When
      const users = await userRepository.findByWorkspace(testWorkspace.id);

      // Then
      expect(users).toHaveLength(3);
      expect(users.map((u) => u.email)).toContain('owner@example.com');
      expect(users.map((u) => u.email)).toContain('member1@example.com');
      expect(users.map((u) => u.email)).toContain('member2@example.com');
    });

    it('다른 워크스페이스 사용자는 조회되지 않음', async () => {
      // Given: 다른 워크스페이스 생성
      const workspaceRepo = dataSource.getRepository(Workspace);
      const otherWorkspace = await workspaceRepo.save({
        name: '다른 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-OTHER',
      });

      // 첫 번째 워크스페이스에 사용자 추가
      await userRepository.saveMany([
        {
          email: 'user1@example.com',
          password: 'password',
          name: 'User1',
          role: 'owner' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'user2@example.com',
          password: 'password',
          name: 'User2',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
      ]);

      // 두 번째 워크스페이스에 사용자 추가
      await userRepository.save({
        email: 'other@example.com',
        password: 'password',
        name: 'Other',
        role: 'owner' as const,
        workspaceId: otherWorkspace.id,
      });

      // When
      const users = await userRepository.findByWorkspace(testWorkspace.id);

      // Then: 첫 번째 워크스페이스의 사용자만 조회
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.email)).not.toContain('other@example.com');
    });

    it('워크스페이스에 사용자가 없으면 빈 배열 반환', async () => {
      // Given: 새로운 빈 워크스페이스 생성
      const workspaceRepo = dataSource.getRepository(Workspace);
      const emptyWorkspace = await workspaceRepo.save({
        name: '빈 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-EMPTY',
      });

      // When
      const users = await userRepository.findByWorkspace(emptyWorkspace.id);

      // Then
      expect(users).toEqual([]);
    });

    it('존재하지 않는 워크스페이스 ID로 조회 시 빈 배열 반환', async () => {
      // When
      const users = await userRepository.findByWorkspace(99999);

      // Then
      expect(users).toEqual([]);
    });

    it('Owner와 Member 역할 구분하여 조회', async () => {
      // Given
      await userRepository.saveMany([
        {
          email: 'owner@example.com',
          password: 'password',
          name: 'Owner',
          role: 'owner' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'member1@example.com',
          password: 'password',
          name: 'Member1',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'member2@example.com',
          password: 'password',
          name: 'Member2',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
      ]);

      // When
      const allUsers = await userRepository.findByWorkspace(testWorkspace.id);
      const owners = allUsers.filter((u) => u.role === 'owner');
      const members = allUsers.filter((u) => u.role === 'member');

      // Then
      expect(owners).toHaveLength(1);
      expect(members).toHaveLength(2);
      expect(owners[0].email).toBe('owner@example.com');
    });
  });

  describe('BaseRepository 메서드 통합 테스트', () => {
    it('save → findById → update → delete 플로우', async () => {
      // 1. save
      const user = await userRepository.save({
        email: 'flow@example.com',
        password: 'password',
        name: '플로우 테스트',
        role: 'owner' as const,
        workspaceId: testWorkspace.id,
      });

      expect(user.id).toBeDefined();

      // 2. findById
      const found = await userRepository.findById(user.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('플로우 테스트');

      // 3. update
      await userRepository.update(user.id, { name: '수정된 이름' });
      const updated = await userRepository.findById(user.id);
      expect(updated.name).toBe('수정된 이름');

      // 4. delete
      await userRepository.delete(user.id);
      const deleted = await userRepository.findById(user.id);
      expect(deleted).toBeNull();
    });

    it('saveMany → findByWorkspace → deleteMany 플로우', async () => {
      // 1. saveMany
      const users = await userRepository.saveMany([
        {
          email: 'bulk1@example.com',
          password: 'password',
          name: 'Bulk1',
          role: 'owner' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'bulk2@example.com',
          password: 'password',
          name: 'Bulk2',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
        {
          email: 'bulk3@example.com',
          password: 'password',
          name: 'Bulk3',
          role: 'member' as const,
          workspaceId: testWorkspace.id,
        },
      ]);

      expect(users).toHaveLength(3);

      // 2. findByWorkspace
      const found = await userRepository.findByWorkspace(testWorkspace.id);
      expect(found).toHaveLength(3);

      // 3. deleteMany
      const ids = users.map((u) => u.id);
      await userRepository.deleteMany(ids);

      const afterDelete = await userRepository.findByWorkspace(testWorkspace.id);
      expect(afterDelete).toHaveLength(0);
    });
  });
});

