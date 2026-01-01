# Configuration Files

이 폴더는 애플리케이션의 중앙화된 설정 파일들을 포함합니다.

## 파일 구조

- `default.json` - 모든 환경에서 사용되는 기본 설정
- `development.json` - 개발 환경 전용 설정 (기본값 오버라이드)
- `test.json` - 테스트 환경 전용 설정
- `production.json` - 프로덕션 환경 전용 설정
- `local.json` (선택사항) - 로컬 개발자별 설정 (git에 포함되지 않음)

## 우선순위

설정은 다음 순서로 병합됩니다 (뒤로 갈수록 우선순위가 높음):

1. `default.json` - 기본 설정
2. `{환경}.json` - 환경별 설정 (development, test, production)
3. `local.json` - 로컬 오버라이드 (선택사항)
4. 환경 변수 - 최종 오버라이드

## 사용 예시

```typescript
import { ConfigLoader } from '../server/src/config/config.loader';

const config = ConfigLoader.get();
console.log(config.server.port); // 4000
```

## 환경 변수 오버라이드

JSON 설정은 환경 변수로 오버라이드할 수 있습니다:

```bash
export DB_HOST=prod-database.example.com
export DB_PASSWORD=secret-password
npm run start
```

## 보안 주의사항

- `production.json`에 민감한 정보를 직접 저장하지 마세요
- 프로덕션 환경에서는 환경 변수를 사용하세요
- `local.json`은 git에 커밋되지 않습니다

