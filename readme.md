# 시스템 개발환경 및 구조 문서

이 문서는 "모노레포 + 클린 아키텍처 + 도메인/코어/피처 + 동적 CRUD Feature" 개발 환경 및 구조를 명확하게 정리한 공식 문서입니다.

---

## 1. 개요


**프로젝트 목표:**

*   React + Node + Typescript 기반 웹 서비스 개발
*   모노레포 구조에서 프론트엔드와 백엔드 공용 타입·로직 공유
*   클린 아키텍처 기반의 안정적인 계층 분리
*   도메인 기준의 엔티티/유스케이스 구성
*   Feature Layer에서 동적 CRUD 기능과 프론트엔드 UI 기능 제공
*   도메인 변경 시 Feature Layer를 다시 작성할 필요 없는 확장성 확보

---

## 2. 개발 환경

### 2.1 기술 스택

| 구분 | 기술 |
| :---------- | :---------------------------------- |
| 프론트엔드 | React, Typescript, Vite |
| 백엔드 | Node.js, Typescript, Express(또는 NestJS) |
| 패키지 관리 | PNPM |
| 모노레포 | Turborepo |
| 공용 타입/로직 공유 | TS path alias, 모노레포 workspace |
| DB | PostgreSQL(or 선택) |
| 배포 | Docker 기반 |

---

## 3. 아키텍처 개요

이번 프로젝트의 핵심 구성은 다음 세 가지입니다:

1.  **Core Layer**: 전체 서비스에서 사용하는 공용 타입, 유틸리티, 에러, 상수, 인터페이스.
2.  **Domain Layer**: 로그인, 일정, 사용자 등 도메인 단위로 browser(프론트엔드용)와 server(백엔드용)를 분리한 구조. DTO, Validation, Entity, UseCase, Repository Interface를 포함합니다.
3.  **Feature Layer**:
    *   **Frontend Feature**: UI 컴포넌트, 훅, 페이지.
    *   **Backend Feature**: 동적 CRUD Feature (행위 중심).

---

## 4. 전체 디렉토리 구조

```
/apps
  /frontend
  /backend

/packages
  /core
    /types
    /utils
    /constants
    /errors

  /domain
    /login
      /browser
      /server
    /schedule
      /browser
      /server
    /user
      /browser
      /server
    /notification
      /browser
      /server

  /feature
    /frontend
      /components
      /hooks
      /pages
    
    /backend
      /crud
        create.feature.ts
        read.feature.ts
        update.feature.ts
        delete.feature.ts
        query-builder.ts
        validation.ts
      repository.registry.ts
```

---

## 5. Layer별 역할 정의

### 5.1 Core Layer (기반 레이어)

**목적:**
전체 서비스 시스템에서 공통적으로 사용하는 Type, Util, Error, Constant 등을 정의합니다.

**구성 요소:**
*   타입(type)
*   공통 인터페이스(interface)
*   에러(error)
*   상수(constant)
*   유틸리티(helper)

**특징:**
*   domain / feature / backend / frontend 모두 import 가능
*   비즈니스 로직을 가지지 않음

---

### 5.2 Domain Layer (비즈니스 규칙)

**목적:**
비즈니스 규칙을 정의하는 레이어로, 기능을 행위가 아닌 도메인 기준(login, schedule 등)으로 구분합니다.

각 도메인 폴더에는 다음 두 그룹이 존재합니다:

#### 1) browser 폴더 (프론트엔드 전용)
*   DTO 정의
*   Validation 스키마(Zod, Yup 등)
*   API 요청/응답 타입
*   프론트엔드 전용 클라이언트 인터페이스

#### 2) server 폴더 (백엔드 전용)
*   Entity
*   UseCase (비즈니스 규칙)
*   Repository Interface(DB 접근 추상화)
*   도메인 전용 타입

**특징:**
*   domain은 feature나 UI에 의존하지 않음
*   domain 변경 시 feature는 영향받지 않도록 설계됨

---

### 5.3 Feature Layer (행위 중심)

Feature는 두 가지로 나뉩니다:

#### 5.3.1 Frontend Feature (UI 조립 레이어)
*   페이지 단위 조립
*   공용 UI 컴포넌트
*   화면에서 domain의 DTO/validation을 활용

**예시:**
*   `/feature/frontend/components/DailyScheduleEditor.tsx`
*   `/feature/frontend/hooks/useLogin.ts`

#### 5.3.2 Backend Feature (동적 CRUD 기능)

**핵심 개념:**
*   C(Create), R(Read), U(Update), D(Delete) 기능을 도메인 종류(login/schedule/user 등)와 독립적으로 구현
*   domain에서 Repository-interface & validation을 받아 명령만 다르면 모든 create/update/delete가 같은 로직으로 동작

**예시 구성:**
```
/feature/backend/crud
  create.feature.ts
  update.feature.ts
  delete.feature.ts
  read.feature.ts
  query-builder.ts
  validation.ts
repository.registry.ts
```

여기서 `repository.registry.ts`는:
*   어떤 domain이 어떤 repository를 사용하는지
*   domain의 schema는 무엇인지
등록하는 역할을 합니다.

**결과:**
*   회원가입(CreateUser)
*   일정 등록(CreateSchedule)

둘 다 같은 `create.feature.ts`로 수행 가능합니다.

---

## 6. 동작 흐름

### 예시: 일정 등록(CreateSchedule)

1.  프론트엔드에서 `domain/schedule/browser`의 `scheduleCreateDto + validation`을 활용해 데이터 작성.
2.  백엔드 API 호출 시 `/api/create/schedule` 호출.
3.  `backend-feature`의 `create.feature`에서
    *   도메인 이름(schedule)
    *   DTO 데이터만 입력받고
    *   `domain/server`의 repository + validation 규칙 로딩.
4.  repository-interface 구현체(postgres, mysql 등)가 실제 DB 저장 수행.

→ Domain의 규칙 + Feature의 동적 기능이 조합되어 동작합니다.

---

## 7. 아키텍처 장점

*   도메인 변경에도 Feature는 안정적
*   프론트엔드·백엔드 타입 완전 공유
*   CRUD 기능 재사용률 100%
*   유지보수 난이도 대폭 감소
*   모노레포에서 개발 환경 일관성 확보

---

## 8. 결론

이 아키텍처는 다음 요구사항에 최적화되었습니다:

*   도메인 단위의 명확한 구조
*   공용 타입/로직 공유
*   기능을 행위 기반으로 분류
*   동적 CRUD 처리 가능
*   프론트엔드/백엔드 개발의 명확한 분리
*   변경에 매우 강함

이 문서를 기준으로 프로젝트를 바로 시작할 수 있습니다.

---

## 추가 작업 가능 항목

원하시면 다음을 더 만들어드릴 수 있습니다:

*   전체 프로젝트 디렉토리 실제 생성 코드
*   Turborepo + PNPM workspace 설정 파일
*   동적 CRUD feature 샘플 코드
*   repository registry 기본 골격
*   `domain/login`, `domain/schedule` 예시 코드
