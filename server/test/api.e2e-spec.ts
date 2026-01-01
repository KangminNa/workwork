import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigLoader } from '../src/config/config.loader';
import { UserRepository } from '../src/modules/users/repositories/user.repository';
import { WorkspaceRepository } from '../src/modules/workspaces/repositories/workspace.repository';

describe('API E2E', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let workspaceRepository: WorkspaceRepository;
  let apiPrefix: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    const config = ConfigLoader.get();
    apiPrefix = config.server.apiPrefix;

    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userRepository = app.get(UserRepository);
    workspaceRepository = app.get(WorkspaceRepository);
  });

  afterEach(() => {
    userRepository.reset();
    workspaceRepository.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('기본 API', () => {
    it('GET /api - 서버 정보 조회', async () => {
      const res = await request(app.getHttpServer()).get(`/${apiPrefix}`).expect(200);

      expect(res.body).toHaveProperty('name', 'WorkWork API');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('environment');
      expect(res.body).toHaveProperty('port');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('message');
    });

    it('GET /api/health - 헬스체크', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${apiPrefix}/health`)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
        }),
      );
    });
  });

  describe('Auth API', () => {
    it('POST /api/auth/register - 회원가입 성공', async () => {
      const payload = {
        email: `user_${Date.now()}@example.com`,
        password: 'password123',
        name: '홍길동',
      };

      const res = await request(app.getHttpServer())
        .post(`/${apiPrefix}/auth/register`)
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(payload.email);
      expect(res.body.data.user.role).toBe('owner');
      expect(res.body.data.workspace.inviteCode).toMatch(/^WORK-[A-Z0-9]{6}$/);
      expect(res.body.data.token.accessToken).toBeDefined();
      expect(res.body.meta.requestId).toBeDefined();
    });

    it('POST /api/auth/login - 로그인 성공', async () => {
      const email = `user_${Date.now()}@example.com`;
      const password = 'password123';
      const name = '테스트';

      // 선행 회원가입
      await request(app.getHttpServer())
        .post(`/${apiPrefix}/auth/register`)
        .send({ email, password, name })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/${apiPrefix}/auth/login`)
        .send({ email, password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.token.accessToken).toBeDefined();
      expect(res.body.meta.requestId).toBeDefined();
    });
  });
});
