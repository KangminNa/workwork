# VS Code 설정

## 🚀 디버그 실행 방법

### F5 또는 Run and Debug 패널에서:

1. **🚀 Auth Server (Debug)** - Auth 서버 디버그 모드 실행
2. **🔧 Auth Server (ts-node)** - ts-node로 직접 실행
3. **🏗️ Build All** - 전체 빌드
4. **🗄️ Prisma Studio** - Prisma 스튜디오 실행
5. **🔄 Prisma Migrate** - 마이그레이션 실행
6. **🌐 Auth Browser (Chrome)** - Chrome에서 브라우저 실행 및 디버그
7. **🚀 Full Stack (Server + Browser)** - 서버와 브라우저 동시 실행

## 🔧 Task 실행 방법

`Cmd+Shift+P` → `Tasks: Run Task` 선택:

- **Start Auth Browser** - 브라우저 개발 서버 시작
- **Build Core** - Core 모듈 빌드
- **Build Auth** - Auth 모듈 빌드
- **Build All** - 전체 빌드 (기본)
- **Database Up** - Docker로 DB 시작
- **Database Down** - Docker DB 중지
- **Database Setup (Full)** - DB 전체 셋업
- **Prisma Generate** - Prisma Client 생성

## 📝 추천 확장 프로그램

자동으로 설치 권장됩니다:

- ESLint
- Prettier
- Prisma
- TypeScript
- Docker
- Thunder Client (API 테스트)
- Error Lens (에러 강조)
- Path Intellisense

## 💡 단축키

- **F5**: 디버그 시작
- **Shift+F5**: 디버그 중지
- **Cmd+Shift+B**: 빌드 실행
- **Cmd+Shift+P**: 명령 팔레트
- **Ctrl+`**: 터미널 열기

## 🎯 중단점 (Breakpoint) 설정

1. 코드 라인 번호 왼쪽 클릭
2. F5로 디버그 실행
3. 변수 값, 콜 스택 등 확인

## 📊 디버그 콘솔 사용

- `console.log()` 대신 중단점 사용 권장
- Watch 패널에서 변수 모니터링
- Debug Console에서 표현식 평가
