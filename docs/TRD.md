# TRD: 간단한 할 일 목록 웹 앱

- 문서 상태: 초안
- 기준 문서: docs/PRD.md, CLAUDE.md
- 작성일: 2026-10-23
- 수정일: 2026-10-27 (백엔드를 FastAPI로, DB를 PostgreSQL로 변경)

## 1. 목적

PRD의 기능(F-01~F-05)을 어떤 기술로, 어떤 구조로 만들지 정한다.
세부 내용은 아래 문서에서 따로 정의한다.

- 데이터 모양: docs/DATA_MODEL.md
- API 주소와 요청/응답: docs/API_SPEC.md
- 화면 컴포넌트: docs/COMPONENT_SPEC.md
- 테스트 목록: docs/TEST_CASES.md

## 2. 기술 스택과 선택 이유

### 프론트엔드 (화면)

| 기술 | 역할 | 고른 이유 (한 줄) |
|------|------|-------------------|
| Next.js (App Router) | 화면 | 페이지를 만들고 띄우는 일을 대신 해 주고, API 요청을 백엔드로 넘겨 주는 기능(rewrites)도 있다. |
| TypeScript | 화면 개발 언어 | 변수에 "이건 문자열, 이건 true/false" 같은 타입을 적어 두면 실수를 실행 전에 잡아 준다. |
| React (Next.js에 포함) | 화면 구성 | 체크박스를 누르면 화면이 바로 바뀌는 것처럼, 데이터가 바뀌면 화면을 자동으로 다시 그려 준다. |
| Jest | 화면 테스트 실행 | "이 함수에 이걸 넣으면 이게 나와야 한다"를 코드로 적어 두고 자동으로 확인할 수 있다. |
| Testing Library | 화면 테스트 | 사용자가 실제로 하는 것처럼 "입력하고 버튼 누르기"를 흉내 내서 화면을 검사할 수 있다. |
| Tailwind CSS (v4) | 화면 스타일 | `flex`, `gap-2`처럼 짧은 클래스 이름으로 스타일을 바로 붙일 수 있어 CSS 파일을 따로 만들 일이 적다. |
| ESLint | 화면 코드 검사 | any 타입 사용 같은 규칙 위반을 실행하기 전에 자동으로 찾아 준다. (`npm run lint`) |

### 백엔드 (API 서버)

| 기술 | 역할 | 고른 이유 (한 줄) |
|------|------|-------------------|
| Python 3.12 | 백엔드 개발 언어 | 문법이 읽기 쉬워 초보자가 배우기 좋고, 백엔드 자료가 많다. |
| FastAPI | API 서버 | 짧은 코드로 API를 만들 수 있고, 타입 힌트로 요청·응답 모양을 정할 수 있다. |
| Pydantic (FastAPI에 포함) | 데이터 모양 정의 | `Todo` 같은 데이터 모양을 클래스로 적어 두면 응답을 그 모양대로 만들어 준다. |
| Uvicorn | 서버 실행 | FastAPI 앱을 실제로 띄워서 요청을 받게 해 준다. |
| pytest | 백엔드 테스트 실행 | 파이썬에서 가장 널리 쓰는 테스트 도구라 쓰는 법이 간단하다. |
| httpx (FastAPI TestClient) | API 테스트 | 서버를 띄우지 않고도 테스트 안에서 API에 요청을 보내 볼 수 있다. |
| Ruff | 백엔드 코드 검사 | 파이썬 코드의 실수와 규칙 위반을 빠르게 찾아 준다. (ESLint의 파이썬판) |
| mypy | 백엔드 타입 검사 | 타입 힌트가 맞는지 실행 전에 검사한다. (`tsc --noEmit`의 파이썬판) |

### 데이터베이스

| 기술 | 역할 | 고른 이유 (한 줄) |
|------|------|-------------------|
| PostgreSQL | 데이터 영구 저장 (v0.3부터) | 무료이고 UUID·true/false·시간대 있는 시각을 그대로 저장하는 타입이 있어 변환할 일이 적다. |

## 3. 폴더 구조와 역할

프론트엔드는 저장소 루트에, 백엔드는 `backend/` 폴더에 둔다.

| 폴더 | 들어가는 것 | 예시 |
|------|-------------|------|
| app/ | 페이지 (API 라우트는 두지 않는다) | 메인 페이지 |
| src/components/ | 화면 컴포넌트 | 입력 폼, 할 일 목록, 할 일 한 줄 |
| src/lib/ | 화면에서 쓰는 공통 함수 | 제목 검사, API 호출 함수 |
| src/types/ | 화면에서 쓰는 타입 | `Todo`, `ApiErrorResponse` |
| tests/components/ | 화면 테스트 (`*.test.tsx`) | CMP-xx |
| tests/lib/ | 화면 공통 함수 테스트 (`*.test.ts`) | LIB-xx |
| backend/app/ | FastAPI 앱 | 아래 표 |
| backend/tests/ | 백엔드 테스트 (`test_*.py`) | API-xx, SRV-xx |
| docs/ | 명세 문서 | PRD, TRD 등 |

### backend/ 안쪽

| 파일 | 하는 일 |
|------|---------|
| backend/app/main.py | FastAPI 앱을 만들고 라우터와 에러 처리기를 연결한다 |
| backend/app/routers/todos.py | `/api/todos` 요청을 받는다 (요청 받기) |
| backend/app/schemas.py | Pydantic 모델 (`Todo` 응답 모양) |
| backend/app/validation.py | 제목 검사, 본문 검사 |
| backend/app/errors.py | 에러 응답 `{ "error": { "code", "message" } }` 만들기 |
| backend/app/repository/ | 저장소. 메모리 구현(v0.2)과 PostgreSQL 구현(v0.3) |
| backend/requirements.txt | 파이썬 패키지 목록 |
| backend/.env | DB 접속 정보 (git에 올리지 않는다) |

역할을 나누는 이유: 요청 받기(routers), 검사(validation), 저장(repository)을 나눠 두면, DB를 바꿀 때 repository만 고치면 된다.

## 4. 시스템 구성

```
[브라우저]
 화면 컴포넌트 (src/components)
        │  fetch("/api/todos")
        ▼
[Next.js 개발 서버 :3000]  ── rewrites: /api/* 를 그대로 넘김 ──▶  [FastAPI 서버 :8000]
                                                                    routers → validation
                                                                         │
                                                                         ▼
                                                                    repository
                                                                         │
                                                                         ▼
                                                                 저장소 (버전별로 다름)
```

### 화면과 백엔드 연결 방식

- 화면은 언제나 같은 주소 `/api/todos`로 요청한다. 백엔드 주소를 모른다.
- Next.js의 rewrites 설정이 `/api/:path*` 요청을 FastAPI(`http://localhost:8000/api/:path*`)로 넘긴다.
- 브라우저 입장에서는 같은 주소로 보내는 요청이라 CORS 설정이 필요 없다.
- 백엔드 주소는 환경 변수(`API_BASE_URL`)로 정한다. 개발할 때는 `http://localhost:8000`, 배포할 때는 배포된 백엔드 주소를 쓴다.

### 버전별 저장소

| 버전 | 저장 위치 | 화면 → 저장소 연결 방식 |
|------|-----------|--------------------------|
| v0.1 | 브라우저 메모리 (React 상태) | 백엔드 없이 화면 안에서만 처리 |
| v0.2 | 서버 메모리 (FastAPI 안의 리스트) | 화면 → Next.js rewrites → FastAPI → 메모리 |
| v0.3 | PostgreSQL | 화면 → Next.js rewrites → FastAPI → PostgreSQL |
| v1.0 | PostgreSQL (배포 환경) | v0.3과 같음 |

v0.2 → v0.3으로 갈 때는 `backend/app/repository/`만 바꾸고, 화면과 routers는 그대로 두는 것을 목표로 한다.

### PostgreSQL 연결

- PostgreSQL에 접속하는 코드는 `backend/app/repository/`에만 둔다. 화면은 DB를 전혀 모른다.
- 접속 정보는 코드에 적지 않고 환경 변수 `DATABASE_URL`(`backend/.env`)에 둔다. 이 파일은 git에 올리지 않는다.
- 테이블 구조는 docs/DATA_MODEL.md를 따른다.

## 5. 흐름: "추가" 버튼을 누른 뒤 DB에 저장되기까지 (v0.3 기준)

요청·응답의 자세한 형식은 docs/API_SPEC.md에서 정의한다. 아래는 6장의 API 규칙을 따른다.

1. **사용자 입력**: 사용자가 입력창에 제목을 적고 "추가" 버튼을 누른다.
2. **화면에서 1차 검사**: 화면 컴포넌트가 앞뒤 공백을 지운 제목이 1~100자인지 확인한다. 조건에 맞지 않으면 서버로 보내지 않고 화면에 안내를 보여준다. (빠른 피드백용)
3. **요청 보내기**: 화면이 `POST /api/todos`, 본문 `{ "title": "우유 사기" }`를 보낸다.
4. **요청 넘기기**: Next.js가 rewrites 설정에 따라 이 요청을 FastAPI 서버로 그대로 넘긴다.
5. **API가 요청 받기**: FastAPI의 `routers/todos.py`가 요청을 받아 본문을 꺼낸다.
6. **서버에서 2차 검사**: `validation.py`가 본문 형식을 보고, 제목의 앞뒤 공백을 지운 뒤 1~100자인지 확인한다. 화면 검사는 우회될 수 있으므로 서버 검사가 최종 기준이다. 틀리면 `400` 에러 응답을 보내고 끝낸다.
7. **할 일 만들기**: 고유 id(UUID), 공백을 지운 제목, 완료 여부(false), 만든 시각(UTC)을 채운다. (필드는 DATA_MODEL.md)
8. **PostgreSQL에 저장**: `repository`가 `todos` 테이블에 새 할 일을 넣는다(INSERT).
9. **응답 보내기**: 저장이 끝나면 FastAPI가 `201`과 함께 만들어진 할 일 JSON을 돌려준다. Next.js가 이 응답을 브라우저로 그대로 전달한다.
10. **화면 갱신**: 화면이 응답받은 할 일을 목록 맨 위에 넣는다(최신순). 입력창을 비운다.
11. **실패 시**: 서버가 에러를 돌려주면 목록은 그대로 두고, 에러 응답의 `message`를 화면에 보여준다.

새로고침하면 화면이 `GET /api/todos`를 보내고, FastAPI가 PostgreSQL에서 최신순으로 읽어 돌려준다. 그래서 데이터가 유지된다(F-05).

완료 전환(F-03)과 삭제(F-04)도 같은 길을 지난다. 체크박스나 삭제 버튼에서 시작하고, 7~8단계가 "완료 여부 바꾸기(UPDATE)"나 "삭제(DELETE)"로 바뀐다.

## 6. API 규칙

| 항목 | 규칙 |
|------|------|
| 주소 | 목록·추가는 `/api/todos`, 전환·삭제는 `/api/todos/{id}` |
| 제목 공백 | 서버가 앞뒤 공백을 지운 뒤 1~100자인지 검사한다. 공백만 있으면 빈 제목으로 보고 `400` |
| 성공 응답 | 감싸지 않고 그대로 보낸다. 목록은 배열 `[...]`, 할 일 하나는 객체 `{...}` |
| 에러 응답 | `{ "error": { "code": "...", "message": "..." } }` 형식. `code`는 테스트에서 확인하고, `message`는 화면에 보여준다 |
| 완료 전환 | `PATCH /api/todos/{id}`에 `{ "completed": true }`처럼 바꿀 값을 보낸다. `completed` 외의 값은 받지 않는다(수정 기능은 범위 밖) |
| 삭제 | `DELETE /api/todos/{id}`. 성공하면 `204`(응답 본문 없음) |
| 없는 id | 없는 id나 형식이 틀린 id로 전환·삭제하면 `404` |
| 정렬 | `created_at` 내림차순. 같으면 `id` 순서로 정렬해 항상 같은 순서가 나오게 한다 |
| JSON 필드 이름 | camelCase (`createdAt`). 파이썬 안에서는 snake_case(`created_at`)를 쓰고, 응답으로 보낼 때 바꾼다 |

### FastAPI에서 지킬 것

FastAPI의 기본 동작이 위 규칙과 다른 곳이 있어서, 아래처럼 맞춘다.

| FastAPI 기본 동작 | 우리 규칙에 맞추는 방법 |
|-------------------|--------------------------|
| 입력 검사에 실패하면 자동으로 `422`와 `{ "detail": [...] }`를 돌려준다 | 요청 본문은 직접 꺼내서 `validation.py`로 검사한다. 그래서 API_SPEC의 검사 순서와 에러 `code`(400)를 그대로 지킨다. 혹시 생기는 `RequestValidationError`도 에러 처리기에서 `400 INVALID_REQUEST`로 바꾼다 |
| 경로의 id를 `UUID` 타입으로 받으면 형식이 틀린 id에 `422`가 나간다 | id는 `str`로 받는다. UUID 형식이 아니면 DB에 묻지 않고 바로 `404 NOT_FOUND` |
| 처리하지 못한 예외는 `500`과 일반 텍스트를 돌려준다 | 모든 예외를 잡는 에러 처리기에서 `500 INTERNAL_ERROR` 형식으로 바꾼다 |
| 404·405 같은 기본 에러는 `{ "detail": "..." }` 형식이다 | 에러 처리기에서 `{ "error": {...} }` 형식으로 바꾼다 (10장 열린 질문 참고) |

## 7. 기능별 기술 처리

| 기능 | 처리 방식 |
|------|-----------|
| F-01 할 일 추가 | 앞뒤 공백을 지운 뒤 화면(TS)과 서버(Python) 양쪽에서 1~100자 검사. 서버 검사가 최종 기준 |
| F-02 목록 보기 | `created_at` 최신순, 같으면 `id` 순. 정렬은 서버(repository)에서 한다 |
| F-03 완료/미완료 전환 | id로 할 일을 찾아 요청받은 `completed` 값으로 바꾼다 |
| F-04 삭제 | id로 할 일을 찾아 지운다 |
| F-05 데이터 유지 | v0.2는 서버 메모리, v0.3부터 PostgreSQL에 저장 |

### 화면과 서버의 제목 검사 맞추기

- 같은 규칙을 TypeScript(`src/lib/`)와 Python(`backend/app/validation.py`)에 한 번씩 구현한다.
- 글자 수는 "유니코드 코드 포인트" 기준으로 센다. 파이썬 `len()`과 PostgreSQL `char_length()`가 이 기준이다. 자바스크립트에서는 `.length` 대신 `[...title].length`를 쓴다.
- 두 구현이 같은 결과를 내는지는 같은 경계값 테스트(LIB-xx와 API-09 ~ API-18)로 확인한다.

## 8. 개발 규칙 (CLAUDE.md 요약)

- 화면(TypeScript): any 타입 금지. console.log는 디버깅 후 지운다.
- 백엔드(Python): 모든 함수에 타입 힌트를 단다. `Any` 금지. print는 디버깅 후 지운다.
- 한 번에 한 기능만 작업한다.
- 테스트를 삭제하거나 skip하지 않는다. 실패하면 구현을 고친다.
- 주석은 한국어로 짧게 쓴다.

## 9. 테스트 전략

| 대상 | 도구 | 무엇을 확인하나 | 실행 |
|------|------|-----------------|------|
| 화면 공통 함수 (src/lib) | Jest | 제목 검사 경계값 | `npm test` |
| 화면 컴포넌트 | Jest + Testing Library | 입력 → 버튼 → 목록 반영, 체크박스, 삭제 | `npm test` |
| 백엔드 검사·저장소 | pytest | 제목 검사, 추가/조회/전환/삭제 결과, 최신순 정렬 | `pytest` (backend/에서) |
| 백엔드 API | pytest + TestClient | 올바른 요청과 잘못된 요청에 맞는 상태 코드와 에러 `code` | `pytest` (backend/에서) |

- 화면 테스트에서 API는 `fetch`를 가짜(mock)로 바꿔서 흉내 낸다. 화면 테스트를 돌릴 때 백엔드를 띄울 필요가 없다.
- 백엔드 테스트에서 "DB 오류"는 FastAPI의 `dependency_overrides`로 저장소를 에러를 던지는 가짜로 바꿔서 만든다.

## 10. 정해야 할 것

- PostgreSQL 접속 방법: 드라이버를 직접 쓸지(예: psycopg 3), ORM을 쓸지(예: SQLAlchemy) (v0.3에서 결정)
- 사용할 PostgreSQL 버전
- 개발용 PostgreSQL 실행 방법 (PC에 직접 설치 또는 Docker)
- 테스트에서 PostgreSQL을 어떻게 다룰지 (테스트용 DB를 따로 둘지)
- 파이썬 가상환경과 패키지 관리 도구 (venv + pip 또는 uv)
- 우리가 만들지 않은 주소·메서드(예: `PUT /api/todos`)에 대한 404·405 응답의 에러 `code`
- 배포 환경: 프론트엔드, 백엔드, PostgreSQL을 각각 어디에 둘지 (v1.0에서 결정)
