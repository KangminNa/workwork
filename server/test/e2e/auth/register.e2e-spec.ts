import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

describe('회원가입 (E2E)', () => {
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

  describe('POST /api/auth/register - 초대 코드 없이 회원가입', () => {
    describe('성공 케이스', () => {
      it('Owner로 회원가입 성공', async () => {
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '홍길동',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(201);

        // 응답 구조 검증
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('workspace');
        expect(response.body).toHaveProperty('accessToken');

        // 사용자 정보 검증
        expect(response.body.user.email).toBe(registerDto.email);
        expect(response.body.user.name).toBe(registerDto.name);
        expect(response.body.user.role).toBe('owner');
        expect(response.body.user).not.toHaveProperty('password'); // 비밀번호는 응답에 포함되지 않아야 함

        // 워크스페이스 정보 검증
        expect(response.body.workspace.name).toBe('홍길동의 워크스페이스');
        expect(response.body.workspace.inviteCode).toMatch(/^WORK-[A-Z0-9]{6}$/);

        // JWT 토큰 검증
        expect(response.body.accessToken).toBeDefined();
        expect(typeof response.body.accessToken).toBe('string');
        expect(response.body.accessToken.length).toBeGreaterThan(0);
      });

      it('다른 사용자가 새로운 워크스페이스로 회원가입 성공', async () => {
        // 첫 번째 사용자
        const firstUser = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '사용자1',
        };

        const firstResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(firstUser)
          .expect(201);

        // 두 번째 사용자 (새로운 워크스페이스)
        const secondUser = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '사용자2',
        };

        const secondResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(secondUser)
          .expect(201);

        // 두 워크스페이스가 다른지 검증
        expect(firstResponse.body.workspace.id).not.toBe(
          secondResponse.body.workspace.id,
        );
        expect(firstResponse.body.workspace.inviteCode).not.toBe(
          secondResponse.body.workspace.inviteCode,
        );
      });
    });

    describe('실패 케이스 - 유효성 검사', () => {
      it('이메일 형식 오류', async () => {
        const registerDto = {
          email: 'invalid-email',
          password: 'password123',
          name: '홍길동',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(400);

        expect(response.body.message).toContain('유효한 이메일을 입력해주세요');
      });

      it('비밀번호 너무 짧음 (6자 미만)', async () => {
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: '12345',
          name: '홍길동',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(400);

        expect(response.body.message).toContain(
          '비밀번호는 최소 6자 이상이어야 합니다',
        );
      });

      it('이름 누락', async () => {
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(400);

        expect(response.body.message).toContain('이름은 필수입니다');
      });

      it('이메일 누락', async () => {
        const registerDto = {
          password: 'password123',
          name: '홍길동',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(400);

        expect(response.body.message).toContain('이메일은 필수입니다');
      });
    });

    describe('실패 케이스 - 비즈니스 로직', () => {
      it('이메일 중복', async () => {
        const registerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '홍길동',
        };

        // 첫 번째 회원가입 (성공)
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(201);

        // 같은 이메일로 두 번째 회원가입 시도 (실패)
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(registerDto)
          .expect(409);

        expect(response.body.message).toBe('이미 사용중인 이메일입니다');
      });
    });
  });

  describe('POST /api/auth/register - 초대 코드로 회원가입', () => {
    describe('성공 케이스', () => {
      it('Member로 회원가입 성공', async () => {
        // 1. Owner 회원가입
        const ownerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '홍길동',
        };

        const ownerResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(ownerDto)
          .expect(201);

        const inviteCode = ownerResponse.body.workspace.inviteCode;

        // 2. 초대 코드로 Member 회원가입
        const memberDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '김철수',
          inviteCode,
        };

        const memberResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(memberDto)
          .expect(201);

        // Member 정보 검증
        expect(memberResponse.body.user.email).toBe(memberDto.email);
        expect(memberResponse.body.user.name).toBe(memberDto.name);
        expect(memberResponse.body.user.role).toBe('member');

        // 같은 워크스페이스에 속하는지 검증
        expect(memberResponse.body.workspace.id).toBe(
          ownerResponse.body.workspace.id,
        );
        expect(memberResponse.body.workspace.inviteCode).toBe(inviteCode);
        expect(memberResponse.body.user.workspaceId).toBe(
          ownerResponse.body.workspace.id,
        );
      });

      it('여러 명의 Member가 같은 워크스페이스에 가입 성공', async () => {
        // Owner 생성
        const ownerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: 'Owner',
        };

        const ownerResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(ownerDto)
          .expect(201);

        const inviteCode = ownerResponse.body.workspace.inviteCode;
        const workspaceId = ownerResponse.body.workspace.id;

        // Member 1 가입
        const member1Response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: TestDataHelper.randomEmail(),
            password: 'password123',
            name: 'Member1',
            inviteCode,
          })
          .expect(201);

        // Member 2 가입
        const member2Response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: TestDataHelper.randomEmail(),
            password: 'password123',
            name: 'Member2',
            inviteCode,
          })
          .expect(201);

        // 모두 같은 워크스페이스에 속하는지 검증
        expect(member1Response.body.workspace.id).toBe(workspaceId);
        expect(member2Response.body.workspace.id).toBe(workspaceId);
        expect(member1Response.body.user.role).toBe('member');
        expect(member2Response.body.user.role).toBe('member');
      });
    });

    describe('실패 케이스', () => {
      it('유효하지 않은 초대 코드 형식', async () => {
        const memberDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '김철수',
          inviteCode: 'INVALID',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(memberDto)
          .expect(400);

        expect(response.body.message).toBe('유효하지 않은 초대 코드입니다');
      });

      it('존재하지 않는 초대 코드', async () => {
        const memberDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: '김철수',
          inviteCode: 'WORK-NOTFND',
        };

        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(memberDto)
          .expect(404);

        expect(response.body.message).toBe('초대 코드에 해당하는 워크스페이스를 찾을 수 없습니다');
      });

      it('초대 코드로 가입 시 이메일 중복', async () => {
        // Owner 생성
        const ownerDto = {
          email: TestDataHelper.randomEmail(),
          password: 'password123',
          name: 'Owner',
        };

        const ownerResponse = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(ownerDto)
          .expect(201);

        const inviteCode = ownerResponse.body.workspace.inviteCode;
        const duplicateEmail = TestDataHelper.randomEmail();

        // 첫 번째 Member 가입
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: duplicateEmail,
            password: 'password123',
            name: 'Member1',
            inviteCode,
          })
          .expect(201);

        // 같은 이메일로 두 번째 가입 시도
        const response = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: duplicateEmail,
            password: 'password123',
            name: 'Member2',
            inviteCode,
          })
          .expect(409);

        expect(response.body.message).toBe('이미 사용중인 이메일입니다');
      });
    });
  });
});

