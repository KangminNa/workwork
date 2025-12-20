import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkspaceRepository } from '../../../src/modules/workspaces/repositories/workspace.repository';
import { Workspace } from '../../../src/modules/workspaces/entities/workspace.entity';
import { User } from '../../../src/modules/users/entities/user.entity';
import { TestDatabaseHelper } from '../../helpers/test-database.helper';
import { DataSource } from 'typeorm';

/**
 * WorkspaceRepository 단위 테스트
 * - BaseRepository의 불변 메서드 + 비즈니스 특화 쿼리 메서드 테스트
 * - 실제 DB를 사용한 통합 테스트
 */
describe('WorkspaceRepository (Unit)', () => {
  let dataSource: DataSource;
  let workspaceRepository: WorkspaceRepository;
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
      providers: [WorkspaceRepository],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);
    workspaceRepository = module.get<WorkspaceRepository>(WorkspaceRepository);

    // 테스트 DB 초기화
    await TestDatabaseHelper.connect(configService);
    //await TestDatabaseHelper.cleanDatabase();
  });

  afterAll(async () => {
    await TestDatabaseHelper.disconnect();
    await dataSource.destroy();
  });

  afterEach(async () => {
    await TestDatabaseHelper.cleanDatabase();
    await TestDatabaseHelper.resetSequences();
  });

  describe('findByInviteCode() - 초대 코드로 워크스페이스 조회', () => {
    it('초대 코드로 워크스페이스 조회 성공', async () => {
      // Given
      const workspaceData = {
        name: '테스트 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-ABC123',
      };

      await workspaceRepository.save(workspaceData);

      // When
      const found = await workspaceRepository.findByInviteCode('WORK-ABC123');

      // Then
      expect(found).toBeDefined();
      expect(found.inviteCode).toBe('WORK-ABC123');
      expect(found.name).toBe('테스트 워크스페이스');
    });

    it('존재하지 않는 초대 코드 조회 시 null 반환', async () => {
      // When
      const found = await workspaceRepository.findByInviteCode('WORK-NOTFOUND');

      // Then
      expect(found).toBeNull();
    });

    it('대소문자 구분하여 조회', async () => {
      // Given
      await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-UPPER1',
      });

      // When: 소문자로 조회
      const found = await workspaceRepository.findByInviteCode('work-upper1');

      // Then: 대소문자가 다르면 찾지 못함
      expect(found).toBeNull();
    });

    it('여러 워크스페이스 중 특정 초대 코드 조회', async () => {
      // Given: 여러 워크스페이스 생성
      await workspaceRepository.saveMany([
        { name: '워크스페이스1', ownerId: 0, inviteCode: 'WORK-CODE1' },
        { name: '워크스페이스2', ownerId: 0, inviteCode: 'WORK-CODE2' },
        { name: '워크스페이스3', ownerId: 0, inviteCode: 'WORK-CODE3' },
      ]);

      // When
      const found = await workspaceRepository.findByInviteCode('WORK-CODE2');

      // Then
      expect(found).toBeDefined();
      expect(found?.name).toBe('워크스페이스2');
      expect(found?.inviteCode).toBe('WORK-CODE2');
    });

    it('초대 코드는 고유해야 함 (중복 불가)', async () => {
      // Given: 첫 번째 워크스페이스 생성
      await workspaceRepository.save({
        name: '첫 번째',
        ownerId: 0,
        inviteCode: 'WORK-UNIQUE',
      });

      // When & Then: 같은 초대 코드로 두 번째 워크스페이스 생성 시도
      await expect(
        workspaceRepository.save({
          name: '두 번째',
          ownerId: 0,
          inviteCode: 'WORK-UNIQUE',
        }),
      ).rejects.toThrow(); // 중복 키 에러 발생
    });
  });

  describe('findByOwner() - Owner ID로 워크스페이스 조회', () => {
    it('Owner ID로 워크스페이스 조회 성공', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: 'Owner의 워크스페이스',
        ownerId: 100,
        inviteCode: 'WORK-OWN1',
      });

      // When
      const found = await workspaceRepository.findByOwner(100);

      // Then
      expect(found).toBeDefined();
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(workspace.id);
      expect(found[0].ownerId).toBe(100);
      expect(found[0].name).toBe('Owner의 워크스페이스');
    });

    it('존재하지 않는 Owner ID 조회 시 빈 배열 반환', async () => {
      // When
      const found = await workspaceRepository.findByOwner(99999);

      // Then
      expect(found).toEqual([]);
    });

    it('여러 워크스페이스가 있을 때 특정 Owner의 워크스페이스 조회', async () => {
      // Given
      await workspaceRepository.saveMany([
        { name: 'Owner1의 워크스페이스', ownerId: 1, inviteCode: 'WORK-OWN1' },
        { name: 'Owner2의 워크스페이스', ownerId: 2, inviteCode: 'WORK-OWN2' },
        { name: 'Owner3의 워크스페이스', ownerId: 3, inviteCode: 'WORK-OWN3' },
      ]);

      // When
      const found = await workspaceRepository.findByOwner(2);

      // Then
      expect(found).toBeDefined();
      expect(found).toHaveLength(1);
      expect(found[0].ownerId).toBe(2);
      expect(found[0].name).toBe('Owner2의 워크스페이스');
    });

    it('같은 Owner ID로 여러 워크스페이스 조회 (배열 반환)', async () => {
      // Given: 같은 ownerId로 여러 워크스페이스 생성 (실제로는 발생하지 않아야 하지만 테스트)
      const first = await workspaceRepository.save({
        name: '첫 번째 워크스페이스',
        ownerId: 999,
        inviteCode: 'WORK-FIRST',
      });

      const second = await workspaceRepository.save({
        name: '두 번째 워크스페이스',
        ownerId: 999,
        inviteCode: 'WORK-SECOND',
      });

      // When
      const found = await workspaceRepository.findByOwner(999);

      // Then: 최신순으로 2개 모두 반환 (createdAt DESC)
      expect(found).toBeDefined();
      expect(found).toHaveLength(2);
      expect(found[0].id).toBe(second.id); // 최신 것이 먼저
      expect(found[1].id).toBe(first.id);
    });
  });

  describe('existsByInviteCode() - 초대 코드 존재 여부 확인', () => {
    it('존재하는 초대 코드 확인 - true 반환', async () => {
      // Given
      await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-EXISTS',
      });

      // When
      const exists = await workspaceRepository.existsByInviteCode('WORK-EXISTS');

      // Then
      expect(exists).toBe(true);
    });

    it('존재하지 않는 초대 코드 확인 - false 반환', async () => {
      // When
      const exists = await workspaceRepository.existsByInviteCode('WORK-NOTEXIST');

      // Then
      expect(exists).toBe(false);
    });

    it('여러 워크스페이스가 있을 때 특정 초대 코드 존재 확인', async () => {
      // Given
      await workspaceRepository.saveMany([
        { name: '워크스페이스1', ownerId: 0, inviteCode: 'WORK-CODE1' },
        { name: '워크스페이스2', ownerId: 0, inviteCode: 'WORK-CODE2' },
        { name: '워크스페이스3', ownerId: 0, inviteCode: 'WORK-CODE3' },
      ]);

      // When
      const exists1 = await workspaceRepository.existsByInviteCode('WORK-CODE1');
      const exists2 = await workspaceRepository.existsByInviteCode('WORK-CODE2');
      const exists3 = await workspaceRepository.existsByInviteCode('WORK-CODE3');
      const exists4 = await workspaceRepository.existsByInviteCode('WORK-CODE4');

      // Then
      expect(exists1).toBe(true);
      expect(exists2).toBe(true);
      expect(exists3).toBe(true);
      expect(exists4).toBe(false);
    });

    it('삭제된 워크스페이스의 초대 코드 확인 - false 반환', async () => {
      // Given
      const workspace = await workspaceRepository.save({
        name: '삭제될 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-DELETE',
      });

      // When: 삭제 전
      const existsBefore = await workspaceRepository.existsByInviteCode('WORK-DELETE');

      // Then
      expect(existsBefore).toBe(true);

      // When: 삭제 후
      await workspaceRepository.delete(workspace.id);
      const existsAfter = await workspaceRepository.existsByInviteCode('WORK-DELETE');

      // Then
      expect(existsAfter).toBe(false);
    });

    it('초대 코드 중복 생성 방지를 위한 사용', async () => {
      // Given
      const inviteCode = 'WORK-NEWCODE';

      // When: 초대 코드가 존재하지 않으면 생성 가능
      const existsBefore = await workspaceRepository.existsByInviteCode(inviteCode);
      expect(existsBefore).toBe(false);

      // 워크스페이스 생성
      await workspaceRepository.save({
        name: '워크스페이스',
        ownerId: 0,
        inviteCode,
      });

      // When: 같은 초대 코드는 이제 존재함
      const existsAfter = await workspaceRepository.existsByInviteCode(inviteCode);

      // Then
      expect(existsAfter).toBe(true);
    });
  });

  describe('BaseRepository 메서드 통합 테스트', () => {
    it('save → findById → update → delete 플로우', async () => {
      // 1. save
      const workspace = await workspaceRepository.save({
        name: '플로우 테스트',
        ownerId: 0,
        inviteCode: 'WORK-FLOW1',
      });

      expect(workspace.id).toBeDefined();

      // 2. findById
      const found = await workspaceRepository.findById(workspace.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('플로우 테스트');

      // 3. update
      await workspaceRepository.update(workspace.id, {
        name: '수정된 워크스페이스',
        ownerId: 100,
      });

      const updated = await workspaceRepository.findById(workspace.id);
      expect(updated.name).toBe('수정된 워크스페이스');
      expect(updated.ownerId).toBe(100);

      // 4. delete
      await workspaceRepository.delete(workspace.id);
      const deleted = await workspaceRepository.findById(workspace.id);
      expect(deleted).toBeNull();
    });

    it('save → findByInviteCode → findByOwner → existsByInviteCode', async () => {
      // 1. save
      const workspace = await workspaceRepository.save({
        name: '통합 테스트',
        ownerId: 500,
        inviteCode: 'WORK-INT1',
      });

      // 2. findByInviteCode
      const foundByCode = await workspaceRepository.findByInviteCode('WORK-INT1');
      expect(foundByCode).toBeDefined();
      expect(foundByCode.id).toBe(workspace.id);

      // 3. findByOwner
      const foundByOwner = await workspaceRepository.findByOwner(500);
      expect(foundByOwner).toBeDefined();
      expect(foundByOwner).toHaveLength(1);
      expect(foundByOwner[0].id).toBe(workspace.id);

      // 4. existsByInviteCode
      const exists = await workspaceRepository.existsByInviteCode('WORK-INT1');
      expect(exists).toBe(true);
    });

    it('여러 워크스페이스 생성 및 조회', async () => {
      // Given
      const workspaces = await workspaceRepository.saveMany([
        { name: '워크스페이스A', ownerId: 1, inviteCode: 'WORK-A' },
        { name: '워크스페이스B', ownerId: 2, inviteCode: 'WORK-B' },
        { name: '워크스페이스C', ownerId: 3, inviteCode: 'WORK-C' },
      ]);

      expect(workspaces).toHaveLength(3);

      // When: 각각 다른 방법으로 조회
      const foundA = await workspaceRepository.findByInviteCode('WORK-A');
      const foundB = await workspaceRepository.findByOwner(2);
      const foundC = await workspaceRepository.findById(workspaces[2].id);

      // Then
      expect(foundA.name).toBe('워크스페이스A');
      expect(foundB).toHaveLength(1);
      expect(foundB[0].name).toBe('워크스페이스B');
      expect(foundC.name).toBe('워크스페이스C');
    });
  });

  describe('실제 비즈니스 시나리오 테스트', () => {
    it('회원가입 시 워크스페이스 생성 플로우', async () => {
      // 1. 초대 코드 고유성 확인
      const inviteCode = 'WORK-SIGNUP';
      const exists = await workspaceRepository.existsByInviteCode(inviteCode);
      expect(exists).toBe(false);

      // 2. 워크스페이스 생성
      const workspace = await workspaceRepository.save({
        name: '새 워크스페이스',
        ownerId: 0, // 임시값
        inviteCode,
      });

      // 3. Owner ID 업데이트 (사용자 생성 후)
      await workspaceRepository.update(workspace.id, { ownerId: 123 });

      // 4. 검증
      const updated = await workspaceRepository.findById(workspace.id);
      expect(updated.ownerId).toBe(123);

      const foundByOwner = await workspaceRepository.findByOwner(123);
      expect(foundByOwner).toHaveLength(1);
      expect(foundByOwner[0].id).toBe(workspace.id);
    });

    it('초대 코드로 워크스페이스 찾기 플로우', async () => {
      // 1. 워크스페이스 생성
      await workspaceRepository.save({
        name: '초대 워크스페이스',
        ownerId: 999,
        inviteCode: 'WORK-INVITE',
      });

      // 2. 사용자가 초대 코드 입력
      const userInputCode = 'WORK-INVITE';

      // 3. 초대 코드로 워크스페이스 조회
      const workspace = await workspaceRepository.findByInviteCode(userInputCode);

      // 4. 검증
      expect(workspace).toBeDefined();
      expect(workspace.inviteCode).toBe(userInputCode);
      expect(workspace.name).toBe('초대 워크스페이스');
    });

    it('중복되지 않는 초대 코드 생성 플로우', async () => {
      // Given: 기존 초대 코드들
      await workspaceRepository.saveMany([
        { name: 'WS1', ownerId: 0, inviteCode: 'WORK-AAA111' },
        { name: 'WS2', ownerId: 0, inviteCode: 'WORK-BBB222' },
        { name: 'WS3', ownerId: 0, inviteCode: 'WORK-CCC333' },
      ]);

      // When: 새로운 고유 초대 코드 찾기
      const candidateCodes = [
        'WORK-AAA111', // 이미 존재
        'WORK-DDD444', // 사용 가능
      ];

      const results = await Promise.all(
        candidateCodes.map((code) => workspaceRepository.existsByInviteCode(code)),
      );

      // Then
      expect(results[0]).toBe(true); // 이미 존재
      expect(results[1]).toBe(false); // 사용 가능

      // 사용 가능한 코드로 워크스페이스 생성
      const workspace = await workspaceRepository.save({
        name: '새 워크스페이스',
        ownerId: 0,
        inviteCode: 'WORK-DDD444',
      });

      expect(workspace.id).toBeDefined();
    });
  });
});

