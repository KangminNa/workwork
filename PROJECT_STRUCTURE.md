# 📁 Project Structure

```
root/
├── package.json            # 모노레포 루트 설정 및 workspace 관리
├── package-lock.json
├── dist/                   # 통합 빌드 출력
│   ├── server/
│   └── browser/
├── Env/                    # 🆕 전역 환경 및 의존성 관리
│   ├── package.json        # 모든 공통 의존성 정의
│   └── README.md           # 사용 가이드
├── server/                 # Express + BullMQ 서버
│   ├── src/
│   ├── tsconfig.json
│   └── package.json        # @workwork/env 상속
├── browser/                # React + Vite 프론트엔드
│   ├── src/
│   ├── tsconfig.json
│   └── package.json        # @workwork/env 상속
└── packages/
   └── tsconfig/            # 공통 TypeScript 설정
       ├── base.json
       ├── server.json
       └── browser.json
```

## 🌟 주요 특징

### Env 폴더를 통한 중앙 집중식 의존성 관리
- 모든 패키지가 동일한 버전의 라이브러리 사용
- 중복 설치 방지로 디스크 공간 절약
- 의존성 업데이트가 한 곳에서 관리됨

### 사용 방법
각 서브 패키지는 `@workwork/env`를 참조:
```json
{
  "dependencies": {
    "@workwork/env": "file:../Env"
  }
}
```

