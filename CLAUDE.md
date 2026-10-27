# CLAUDE.md

## 프로젝트 개요
혼자 쓰는 간단한 할 일 목록 웹 앱 (자세한 아이디어: docs/IDEA.md)

### MVP
- 할 일 추가 (제목 필수, 1~100자)
- 할 일 목록 보기 (최신순)
- 완료/미완료 전환 (체크박스)
- 할 일 삭제
- 새로고침해도 데이터 유지

### 지금은 만들지 않는 것
- 로그인, 공유, 알림, 마감일, 카테고리

### 버전 로드맵
- v0.1 화면만 (브라우저 메모리)
- v0.2 API 연결 (서버 메모리)
- v0.3 DB 저장
- v0.4 필터와 수정
- v1.0 배포

## 기술 스택
- 프론트엔드: Next.js (App Router) + TypeScript + Tailwind CSS (v4)
- 백엔드: FastAPI (Python 3.12)
- 테스트: 프론트엔드 Jest + Testing Library / 백엔드 pytest
- DB: PostgreSQL (v0.3부터 사용)
- 화면 → 백엔드 연결: Next.js rewrites로 /api/* 를 FastAPI로 넘김

## 폴더 구조
- app/ : 페이지 (API 라우트는 두지 않음)
- src/components/ : 화면 컴포넌트
- src/lib/ : 화면 공통 함수 (제목 검사, API 호출)
- src/types/ : 화면 타입
- tests/ : 화면 테스트 (components/, lib/)
- backend/app/ : FastAPI 앱 (routers, validation, repository)
- backend/tests/ : 백엔드 테스트
- docs/ : 명세 문서

## 반드시 참고할 문서
- docs/PRD.md, docs/TRD.md, docs/DATA_MODEL.md
- docs/API_SPEC.md, docs/COMPONENT_SPEC.md, docs/TEST_CASES.md

## 규칙
- 명세에 없는 기능을 임의로 추가하지 말 것
- any 타입 금지 (Python은 모든 함수에 타입 힌트, Any 금지)
- 한 번에 한 기능만 작업하고, 끝나면 무엇을 바꿨는지 요약할 것
- 테스트를 삭제하거나 skip하지 말 것
- 테스트가 실패하면 테스트가 아닌 구현을 고칠 것
- console.log, print는 디버깅 후 제거할 것
- 초보자가 이해할 수 있게 주석은 한국어로 짧게

## 자주 쓰는 명령
- 화면 개발 서버: npm run dev
- 화면 테스트: npm test
- 화면 코드 검사: npm run lint
- 백엔드 개발 서버 (backend/에서): uvicorn app.main:app --reload --port 8000
- 백엔드 테스트 (backend/에서): pytest
- 백엔드 코드 검사 (backend/에서): ruff check . / mypy app
