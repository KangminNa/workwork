-- 데이터베이스 초기화 스크립트
-- Docker Compose 최초 실행 시 자동으로 실행됨

-- 기본 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 타임존 설정
SET timezone = 'Asia/Seoul';

-- 개발용 초기 데이터 (선택사항)
-- 실제 서버에서는 TypeORM이 자동으로 테이블 생성

