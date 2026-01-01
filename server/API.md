# 현재 구현된 API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api` | 서버 기본 정보 조회 |
| GET | `/api/health` | 헬스체크 (상태/타임스탬프/업타임) |
| POST | `/api/auth/register` | 회원가입 (초대 코드 없으면 Owner, 있으면 Member) |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |

> 모든 응답은 `BaseController`의 공통 포맷을 사용합니다: `{ success, data, meta }`
