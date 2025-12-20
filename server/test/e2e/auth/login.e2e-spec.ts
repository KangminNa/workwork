import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

describe('로그인 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    await TestAppHelper.resetDatabase();
  });

  describe('POST /api/auth/login', () => {
    describe('성공 케이스', () => {
      it('로그인 성공 (Owner)', async () => {
        // 1. 회원가입
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '홍길동',
        };

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(201);

        // 2. 로그인
        const loginDto = {
          email: registerDto.email,
          password: registerDto.password,
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(200);

        // 응답 구조 검증
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('workspace');
        expect(response.body).toHaveProperty('accessToken');

        // 사용자 정보 검증
        expect(response.body.user.email).toBe(registerDto.email);
        expect(response.body.user.name).toBe(registerDto.name);
        expect(response.body.user.role).toBe('owner');
        expect(response.body.user).not.toHaveProperty('password');

        // 워크스페이스 정보 검증
        expect(response.body.workspace).toBeDefined();
        expect(response.body.workspace.name).toBe('홍길동의 워크스페이스');

        // JWT 토큰 검증
        expect(response.body.accessToken).toBeDefined();
        expect(typeof response.body.accessToken).toBe('string');
      });

      it('로그인 성공 (Member)', async () => {
        // 1. Owner 회원가입
        const ownerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'ownerpass123',
          name: 'Owner',
        };

        const ownerResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(ownerDto)
          .expect(201);

        const inviteCode = ownerResponse.body.workspace.inviteCode;

        // 2. Member 회원가입
        const memberDto = {
          email: TestDataHelper.randomEmail(),
          password: 'memberpass123',
          name: 'Member',
          inviteCode,
        };

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(memberDto)
          .expect(201);

        // 3. Member 로그인
        const loginDto = {
          email: memberDto.email,
          password: memberDto.password,
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(200);

        // Member 정보 검증
        expect(response.body.user.email).toBe(memberDto.email);
        expect(response.body.user.name).toBe(memberDto.name);
        expect(response.body.user.role).toBe('member');

        // 같은 워크스페이스인지 검증
        expect(response.body.workspace.id).toBe(
          ownerResponse.body.workspace.id,
        );
      });

      it('같은 사용자가 여러 번 로그인 성공', async () => {
        // 회원가입
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '홍길동',
        };

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(201);

        const loginDto = {
          email: registerDto.email,
          password: registerDto.password,
        };

        // 첫 번째 로그인
        const response1 = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(200);

        // 두 번째 로그인
        const response2 = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(200);

        // 두 번 모두 성공하고, 토큰이 발급되어야 함
        expect(response1.body.accessToken).toBeDefined();
        expect(response2.body.accessToken).toBeDefined();
        // JWT는 같은 payload와 시간에 생성되면 같을 수 있으므로, 존재 여부만 확인
      });
    });

    describe('실패 케이스 - 유효성 검사', () => {
      it('이메일 형식 오류', async () => {
        const loginDto = {
          email: 'invalid-email',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(400);

        expect(response.body.message).toContain('유효한 이메일을 입력해주세요');
      });

      it('이메일 누락', async () => {
        const loginDto = {
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(400);

        expect(response.body.message).toContain('이메일은 필수입니다');
      });

      it('비밀번호 누락', async () => {
        const loginDto = {
          email: TestDataHelper.randomEmail(),
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(400);

        expect(response.body.message).toContain('비밀번호는 필수입니다');
      });
    });

    describe('실패 케이스 - 인증 오류', () => {
      it('존재하지 않는 이메일', async () => {
        const loginDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(401);

        expect(response.body.message).toBe('이메일 또는 비밀번호가 잘못되었습니다');
      });

      it('잘못된 비밀번호', async () => {
        // 1. 회원가입
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'correctpassword',
          name: '홍길동',
        };

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(201);

        // 2. 잘못된 비밀번호로 로그인
        const loginDto = {
          email: registerDto.email,
          password: 'wrongpassword',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(401);

        expect(response.body.message).toBe('이메일 또는 비밀번호가 잘못되었습니다');
      });

      it('비밀번호 대소문자 구분', async () => {
        // 회원가입
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'Password123',
          name: '홍길동',
        };

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(201);

        // 대소문자가 다른 비밀번호로 로그인 시도
        const loginDto = {
          email: registerDto.email,
          password: 'password123', // 소문자로 변경
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(401);

        expect(response.body.message).toBe('이메일 또는 비밀번호가 잘못되었습니다');
      });
    });
  });
});

