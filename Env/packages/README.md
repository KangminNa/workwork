# Package Configuration Management

이 폴더는 프로젝트의 모든 package.json 파일을 중앙 관리합니다.

## 구조

- `Env/package.json` - 메인 package.json (루트에 심볼릭 링크)
- `Env/packages/root.json` - 이전 루트 package.json 백업
- `Env/packages/core.json` - Core 모듈 메타데이터
- `Env/packages/auth.json` - Auth 모듈 메타데이터
- `Env/packages/common.json` - Common 모듈 메타데이터

## 사용 방법

모든 npm 명령어는 루트에서 실행:

```bash
npm run build
npm run dev:auth:server
npm run dev:auth:browser
```

## 새 모듈 추가 시

1. `Env/packages/{module}.json` 생성 (메타데이터만)
2. `Env/package.json`의 scripts에 빌드 명령 추가
3. 필요한 의존성은 `Env/package.json`에 추가
