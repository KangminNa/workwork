# WorkWork 프로젝트 관리 명령어

.PHONY: help

help: ## 사용 가능한 명령어 보기
	@echo "WorkWork 프로젝트 명령어"
	@echo "========================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Docker 명령어
docker-up: ## Docker 컨테이너 시작
	docker-compose up -d

docker-down: ## Docker 컨테이너 중지
	docker-compose down

docker-restart: ## Docker 컨테이너 재시작
	docker-compose restart

docker-logs: ## Docker 로그 확인
	docker-compose logs -f

docker-clean: ## Docker 볼륨 포함 완전 삭제
	docker-compose down -v

# 데이터베이스 명령어
db-connect: ## PostgreSQL 접속
	docker exec -it workwork-postgres psql -U postgres -d workwork

db-test-connect: ## 테스트 DB 접속
	docker exec -it workwork-postgres-test psql -U postgres -d workwork_test

db-reset: ## 데이터베이스 초기화 (개발용)
	docker-compose down -v
	docker-compose up -d

# 서버 명령어
install: ## 의존성 설치
	npm install

dev: ## 개발 서버 시작 (전체)
	npm run dev

dev-server: ## 서버만 개발 모드 실행
	npm run dev:server

dev-browser: ## 브라우저만 개발 모드 실행
	npm run dev:browser

# 테스트 명령어
test: ## 전체 테스트 실행
	cd server && npm run test

test-watch: ## 테스트 Watch 모드
	cd server && npm run test:watch

test-cov: ## 테스트 커버리지
	cd server && npm run test:cov

test-e2e: ## E2E 테스트
	cd server && npm run test:e2e

# 빌드 명령어
build: ## 전체 빌드
	npm run build

build-server: ## 서버 빌드
	npm run build:server

build-browser: ## 브라우저 빌드
	npm run build:browser

# 초기 설정
setup: docker-up install ## 프로젝트 초기 설정
	@echo "✅ 설정 완료! 'make dev' 명령으로 서버를 시작하세요."

