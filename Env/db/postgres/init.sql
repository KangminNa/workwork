-- PostgreSQL 초기화 스크립트
-- Prisma가 자동으로 테이블을 생성하므로 여기서는 데이터베이스만 준비

-- 확장 설치 (UUID 지원)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 타임존 설정
SET timezone = 'Asia/Seoul';

-- 초기 데이터베이스 준비 완료
SELECT 'PostgreSQL initialized successfully!' as message;

