# TEST_CASES: 간단한 할 일 목록 웹 앱

- 문서 상태: 초안
- 기준 문서: docs/PRD.md, docs/TRD.md, docs/DATA_MODEL.md, docs/API_SPEC.md, docs/COMPONENT_SPEC.md
- 작성일: 2026-10-26
- 수정일: 2026-10-27 (API 테스트를 pytest로, DB를 PostgreSQL로 변경)

## 1. 개요

| 구분 | ID 접두어 | 도구 | 대상 | 파일 위치 | 실행 |
|------|-----------|------|------|-----------|------|
| API 테스트 | API- | pytest + FastAPI TestClient | FastAPI `/api/todos` (+ 그 아래 validation, repository) | `backend/tests/` | `pytest` (backend/에서) |
| 컴포넌트 테스트 | CMP- | Jest + Testing Library | `src/components/` 컴포넌트 | `tests/components/` | `npm test` |

### 공통 전제

- 모든 테스트는 빈 저장소(할 일 0개)에서 시작한다. 필요한 할 일은 테스트 안에서 미리 넣는다.
- 에러 응답은 항상 `{ "error": { "code": "...", "message": "..." } }` 형식이다. 테스트는 상태 코드와 `code`를 확인한다. `message`는 바뀔 수 있으므로 확인하지 않는다. (화면 테스트에서 문구를 보여주는지 확인할 때만 쓴다)
- FastAPI 기본 에러 형식(`422`, `{ "detail": ... }`)이 나오면 실패로 본다.
- "DB 오류"는 FastAPI의 `dependency_overrides`로 저장소를 에러를 던지는 가짜로 바꿔서 만든다.
- 컴포넌트 테스트에서 API는 `fetch`를 가짜(mock)로 바꿔서 흉내 낸다. 백엔드를 띄우지 않는다.
- 화면 요소는 COMPONENT_SPEC 6장의 라벨과 role로 찾는다.
- 글에서 "100자 제목"은 공백 없이 `"가"`를 100번 이어 붙인 문자열이다. "이모지"는 😀(코드 포인트 1개)를 뜻한다.

### 버전별 적용

| 구분 | v0.1 | v0.2 | v0.3~ |
|------|------|------|-------|
| API 테스트 | 해당 없음 | 서버 메모리로 실행 | PostgreSQL 테스트 DB로 실행 |
| 컴포넌트 테스트 (TodoForm/TodoList/TodoItem) | 실행 | 실행 | 실행 |
| 컴포넌트 테스트 (TodoApp) | 3.5절 | 3.4절 | 3.4절 |

---

## 2. API 테스트

### 2.1 목록 보기 — `GET /api/todos` (F-02)

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-01 | GET /api/todos | 할 일이 하나도 없음 | 200, 본문 `[]` |
| API-02 | GET /api/todos | 서로 다른 시각에 만든 할 일 3개가 있음 | 200, 배열 길이 3, `createdAt`이 늦은 것부터(최신순) 정렬됨 |
| API-03 | GET /api/todos | `createdAt`이 같은 할 일 2개가 있음 | 200, 두 할 일이 `id` 오름차순으로 정렬됨. 여러 번 요청해도 순서가 같음 |
| API-04 | GET /api/todos | 할 일 1개가 있음 | 200, 각 항목에 `id`(UUID 문자열), `title`(문자열), `completed`(불리언), `createdAt`(ISO 8601 문자열)만 있음 |
| API-05 | GET /api/todos | 감싸지 않은 응답인지 확인 | 본문이 배열 그 자체임 (`{ "todos": [...] }` 아님) |
| API-06 | GET /api/todos | DB 조회 중 오류 발생 | 500, `code` = `INTERNAL_ERROR` |

### 2.2 할 일 추가 — `POST /api/todos` (F-01)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-07 | POST /api/todos | `{ "title": "우유 사기" }` | 201, `title`은 `"우유 사기"`, `completed`는 `false`, `id`는 UUID, `createdAt`은 ISO 8601 문자열 |
| API-08 | POST /api/todos | `{ "title": "  우유 사기  " }` (앞뒤 공백) | 201, 응답의 `title`은 `"우유 사기"` (공백 제거됨) |
| API-09 | POST /api/todos | 1자 제목 `{ "title": "a" }` (최소 경계) | 201 |
| API-10 | POST /api/todos | 100자 제목 (최대 경계) | 201, `title` 길이 100 |
| API-11 | POST /api/todos | 100자 제목 앞뒤에 공백이 붙음 | 201 (공백을 지우면 100자이므로 통과) |
| API-12 | POST /api/todos | 이모지 100개로 된 제목 | 201 (이모지 하나를 1자로 셈) |
| API-13 | POST /api/todos | 두 번 연속 추가 | 두 응답의 `id`가 서로 다름 |
| API-14 | POST → GET | 추가한 뒤 목록 조회 | 방금 추가한 할 일이 배열 맨 앞에 있음 |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-15 | POST /api/todos | `{ "title": "" }` | 400, `code` = `INVALID_TITLE` |
| API-16 | POST /api/todos | `{ "title": "   " }` (공백만) | 400, `INVALID_TITLE` |
| API-17 | POST /api/todos | 101자 제목 | 400, `INVALID_TITLE` |
| API-18 | POST /api/todos | 이모지 101개로 된 제목 | 400, `INVALID_TITLE` |
| API-19 | POST /api/todos | `{}` (title 없음) | 400, `INVALID_TITLE` |
| API-20 | POST /api/todos | `{ "title": 123 }` (문자열 아님) | 400, `INVALID_TITLE` |
| API-21 | POST /api/todos | `{ "title": null }` | 400, `INVALID_TITLE` |
| API-22 | POST /api/todos | 본문이 JSON이 아님 (`우유 사기`) | 400, `INVALID_REQUEST` |
| API-23 | POST /api/todos | 본문이 배열 (`["우유 사기"]`) | 400, `INVALID_REQUEST` |
| API-24 | POST /api/todos | 받지 않는 필드 포함 (`{ "title": "우유", "completed": true }`) | 400, `INVALID_REQUEST` |
| API-25 | POST /api/todos | 받지 않는 필드 + 빈 제목 (`{ "title": "", "id": "x" }`) | 400, `INVALID_REQUEST` (본문 형식 검사가 먼저) |
| API-26 | POST → GET | 400으로 실패한 뒤 목록 조회 | 목록에 아무것도 추가되지 않음 |
| API-27 | POST /api/todos | DB 저장 중 오류 발생 | 500, `INTERNAL_ERROR` |

### 2.3 완료/미완료 전환 — `PATCH /api/todos/{id}` (F-03)

전제: 미완료 할 일 "우유 사기" 1개가 있다. (필요한 경우 2개 이상)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-28 | PATCH /api/todos/{id} | `{ "completed": true }` | 200, 응답의 `completed`는 `true`. `id`, `title`, `createdAt`은 바뀌지 않음 |
| API-29 | PATCH /api/todos/{id} | 완료된 할 일에 `{ "completed": false }` | 200, `completed`는 `false` |
| API-30 | PATCH /api/todos/{id} | 같은 요청 `{ "completed": true }`를 두 번 보냄 | 두 번 모두 200, `completed`는 `true` (결과가 같음) |
| API-31 | PATCH → GET | 전환한 뒤 목록 조회 | 목록에서도 `completed`가 바뀌어 있음 |
| API-32 | PATCH → GET | 할 일 3개 중 가운데 것을 전환한 뒤 목록 조회 | 목록 순서가 바뀌지 않음 |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-33 | PATCH /api/todos/{id} | `{}` (completed 없음) | 400, `INVALID_COMPLETED` |
| API-34 | PATCH /api/todos/{id} | `{ "completed": "yes" }` | 400, `INVALID_COMPLETED` |
| API-35 | PATCH /api/todos/{id} | `{ "completed": 1 }` | 400, `INVALID_COMPLETED` |
| API-36 | PATCH /api/todos/{id} | `{ "completed": null }` | 400, `INVALID_COMPLETED` |
| API-37 | PATCH /api/todos/{id} | 본문이 깨진 JSON (`{ "completed": tru`) | 400, `INVALID_REQUEST` |
| API-38 | PATCH /api/todos/{id} | 받지 않는 필드 포함 (`{ "completed": true, "title": "새 제목" }`) | 400, `INVALID_REQUEST` |
| API-39 | PATCH → GET | API-38 뒤에 목록 조회 | 제목과 완료 여부 모두 바뀌지 않음 |
| API-40 | PATCH /api/todos/{id} | 없는 id (올바른 UUID 형식) | 404, `NOT_FOUND` |
| API-41 | PATCH /api/todos/abc | 형식이 틀린 id | 404, `NOT_FOUND` |
| API-42 | PATCH /api/todos/{id} | 없는 id + 잘못된 본문 (`{ "completed": "yes" }`) | 400, `INVALID_COMPLETED` (본문 검사가 id 확인보다 먼저) |
| API-43 | PATCH /api/todos/{id} | DB 수정 중 오류 발생 | 500, `INTERNAL_ERROR` |

### 2.4 할 일 삭제 — `DELETE /api/todos/{id}` (F-04)

전제: 할 일 "우유 사기", "보고서 제출" 2개가 있다.

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-44 | DELETE /api/todos/{id} | 있는 id 삭제 | 204, 응답 본문 없음 |
| API-45 | DELETE → GET | 삭제한 뒤 목록 조회 | 지운 할 일은 없고, 다른 할 일은 그대로 있음 |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-46 | DELETE /api/todos/{id} | 같은 id를 두 번 삭제 | 첫 번째 204, 두 번째 404 `NOT_FOUND` |
| API-47 | DELETE /api/todos/{id} | 없는 id (올바른 UUID 형식) | 404, `NOT_FOUND` |
| API-48 | DELETE /api/todos/abc | 형식이 틀린 id | 404, `NOT_FOUND` |
| API-49 | DELETE → GET | 404로 실패한 뒤 목록 조회 | 목록이 그대로임 |
| API-50 | DELETE /api/todos/{id} | DB 삭제 중 오류 발생 | 500, `INTERNAL_ERROR` |

### 2.5 공통 (에러 형식, 데이터 유지)

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| API-51 | 모든 에러 응답 | 2.1~2.4의 에러 테스트마다 응답 본문 확인 | `error` 객체 하나만 있고, 그 안에 `code`(문자열)와 `message`(비어 있지 않은 문자열)가 있음 |
| API-52 | 모든 응답 | 본문이 있는 응답의 헤더 확인 | `Content-Type`이 `application/json` |
| API-53 | PostgreSQL 저장 (v0.3~, F-05) | 할 일을 추가·전환한 뒤 앱과 DB 연결을 새로 만들고 목록 조회 (서버 재시작 흉내) | 추가·전환 결과가 그대로 있음 |
| API-54 | PostgreSQL 저장 (v0.3~) | 저장된 행을 DB에서 직접 확인 | `title`에 앞뒤 공백이 없고, `id`는 UUID 타입, `created_at`은 시간대 정보와 함께 저장됨. API 응답의 `createdAt`은 UTC(`Z`로 끝남) |

---

## 3. 컴포넌트 테스트

### 3.1 TodoForm

`onAdd`, `onTitleChange`는 가짜 함수(mock)를 넘긴다.

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-01 | TodoForm | 화면에 그림 | 라벨 "할 일" 입력창과 "추가" 버튼이 보임 |
| CMP-02 | TodoForm | "우유 사기" 입력 후 "추가" 클릭 | `onAdd`가 `"우유 사기"`로 한 번 호출됨 |
| CMP-03 | TodoForm | "우유 사기" 입력 후 Enter | `onAdd`가 `"우유 사기"`로 한 번 호출됨 |
| CMP-04 | TodoForm | "  우유 사기  " 입력 후 "추가" 클릭 | `onAdd`가 `"우유 사기"`(공백 제거)로 호출됨 |
| CMP-05 | TodoForm | 100자 제목 입력 후 "추가" 클릭 | `onAdd`가 호출됨 |
| CMP-06 | TodoForm | `onAdd`가 `true`를 돌려줌 | 입력창이 비워지고, 입력창에 커서(포커스)가 있음 |
| CMP-07 | TodoForm | 입력창에 글자를 입력 | `onTitleChange`가 호출됨 |

**에러 / 막힘**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-08 | TodoForm | 아무것도 입력하지 않고 "추가" 클릭 | `onAdd`가 호출되지 않음. `alert`에 "제목은 1~100자로 입력해 주세요." |
| CMP-09 | TodoForm | 공백만 입력하고 "추가" 클릭 | `onAdd`가 호출되지 않음. 검사 문구가 보임 |
| CMP-10 | TodoForm | 101자 입력하고 "추가" 클릭 | `onAdd`가 호출되지 않음. 검사 문구가 보임. 입력한 내용은 그대로 남음 |
| CMP-11 | TodoForm | CMP-08 뒤에 입력창에 글자를 입력 | 검사 문구가 사라짐 |
| CMP-12 | TodoForm | `onAdd`가 `false`를 돌려줌 | 입력한 내용이 그대로 남음 |
| CMP-13 | TodoForm | `errorMessage`에 문구를 넘김 | `alert`에 그 문구가 보임 |
| CMP-14 | TodoForm | 검사 실패 상태에서 `errorMessage`도 넘김 | 검사 문구만 보임 (검사 문구가 우선) |
| CMP-15 | TodoForm | `isSubmitting`이 `true` | 입력창과 버튼이 비활성. 버튼 글자가 "추가 중..." |
| CMP-16 | TodoForm | `isSubmitting`이 `true`일 때 Enter | `onAdd`가 호출되지 않음 |

### 3.2 TodoItem

`onToggle`, `onDelete`는 가짜 함수(mock)를 넘긴다.

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-17 | TodoItem | 미완료 할 일 "우유 사기"를 그림 | 제목이 보임. 라벨이 "우유 사기"인 체크박스는 체크 해제. 제목에 취소선 없음 |
| CMP-18 | TodoItem | 완료된 할 일을 그림 | 체크박스가 체크됨. 제목에 취소선이 있음 |
| CMP-19 | TodoItem | 삭제 버튼 확인 | 이름이 "우유 사기 삭제"인 버튼이 있음 |
| CMP-20 | TodoItem | 미완료 할 일의 체크박스 클릭 | `onToggle`이 `(id, true)`로 호출됨 |
| CMP-21 | TodoItem | 완료된 할 일의 체크박스 클릭 | `onToggle`이 `(id, false)`로 호출됨 |
| CMP-22 | TodoItem | 삭제 버튼 클릭 | `onDelete`가 `(id)`로 호출됨 |
| CMP-23 | TodoItem | `isPending`이 `true` | 체크박스와 삭제 버튼이 비활성. 눌러도 `onToggle`, `onDelete`가 호출되지 않음 |
| CMP-24 | TodoItem | 만든 시각 확인 | `createdAt` 값이 화면에 보이지 않음 |

### 3.3 TodoList

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-25 | TodoList | `todos`가 빈 배열 | "아직 할 일이 없습니다. 위에서 할 일을 추가해 보세요."가 보임. `listitem`이 0개 |
| CMP-26 | TodoList | `todos`에 3개 | `listitem`이 3개. 받은 순서 그대로 보임 (TodoList가 다시 정렬하지 않음) |
| CMP-27 | TodoList | `todos`가 있음 | 빈 목록 문구가 보이지 않음 |
| CMP-28 | TodoList | `pendingIds`에 1개의 id만 있음 | 그 할 일의 체크박스·삭제 버튼만 비활성. 나머지는 활성 |
| CMP-29 | TodoList | 두 번째 할 일의 체크박스·삭제 버튼 클릭 | `onToggle`, `onDelete`가 두 번째 할 일의 id로 호출됨 |

### 3.4 TodoApp (v0.2~, API 연결)

`fetch`를 가짜로 바꿔서 응답을 정한다.

**페이지 열기 (F-02, F-05)**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-30 | TodoApp | 처음 그림, GET 응답 전 | `GET /api/todos`가 호출됨. `status`에 "할 일을 불러오는 중..." |
| CMP-31 | TodoApp | GET이 200 + 할 일 2개 | 로딩 문구가 사라지고, 받은 순서대로 2개가 보임 |
| CMP-32 | TodoApp | GET이 200 + `[]` | 빈 목록 문구가 보임 |
| CMP-33 | TodoApp | GET이 500 | "할 일을 불러오지 못했습니다. 페이지를 새로고침해 주세요."가 보임. 입력창이 비활성 |
| CMP-34 | TodoApp | GET 연결 실패 (`fetch`가 에러를 던짐) | CMP-33과 같은 목록 에러 문구. 입력창이 비활성 |
| CMP-35 | TodoApp | 화면을 지웠다가 다시 그림 (새로고침 흉내) | `GET /api/todos`가 다시 호출되고, 서버가 준 목록이 보임 |

**할 일 추가 (F-01)**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-36 | TodoApp | "우유 사기" 추가, POST가 201 | `POST /api/todos`에 본문 `{ "title": "우유 사기" }`. 응답받은 할 일이 목록 맨 위에 보임. 입력창이 비워짐 |
| CMP-37 | TodoApp | POST 응답 전 | 버튼 글자가 "추가 중...", 입력창과 버튼이 비활성 |
| CMP-38 | TodoApp | 빈 제목으로 "추가" 클릭 | `fetch`(POST)가 호출되지 않음. 검사 문구가 보임 |
| CMP-39 | TodoApp | POST가 400 `INVALID_TITLE` | 응답의 `message`가 입력창 아래에 보임. 목록은 그대로. 입력 내용 유지 |
| CMP-40 | TodoApp | POST가 500 `INTERNAL_ERROR` | "잠시 후 다시 시도해 주세요."가 보임. 목록은 그대로 |
| CMP-41 | TodoApp | POST 연결 실패 | "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."가 입력창 아래에 보임 |
| CMP-42 | TodoApp | POST 응답이 JSON이 아님 | CMP-41과 같은 연결 실패 문구 |
| CMP-43 | TodoApp | CMP-39 뒤에 입력창에 글자를 입력 | 추가 에러 문구가 사라짐 |
| CMP-44 | TodoApp | 추가 실패 뒤 버튼 상태 | 입력창과 버튼이 다시 활성, 버튼 글자가 "추가" |

**완료/미완료 전환 (F-03)**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-45 | TodoApp | 미완료 할 일 체크, PATCH가 200 | `PATCH /api/todos/{id}`에 본문 `{ "completed": true }`. 체크박스가 체크되고 취소선이 생김. 목록 순서 그대로 |
| CMP-46 | TodoApp | 완료된 할 일 체크 해제, PATCH가 200 | 본문 `{ "completed": false }`. 체크 해제되고 취소선이 사라짐 |
| CMP-47 | TodoApp | PATCH 응답 전 | 그 할 일의 체크박스와 삭제 버튼이 비활성. 체크 상태는 아직 바뀌지 않음 (낙관적 업데이트 안 함) |
| CMP-48 | TodoApp | PATCH가 404 `NOT_FOUND` | 체크 상태 그대로. 목록 위 `alert`에 "할 일을 찾을 수 없습니다." |
| CMP-49 | TodoApp | PATCH가 500 | 체크 상태 그대로. 목록 위에 "잠시 후 다시 시도해 주세요." |
| CMP-50 | TodoApp | PATCH 연결 실패 | 체크 상태 그대로. 목록 위에 연결 실패 문구 |
| CMP-51 | TodoApp | 전환 실패 뒤 | 그 할 일의 체크박스와 삭제 버튼이 다시 활성 |

**할 일 삭제 (F-04)**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-52 | TodoApp | 삭제 버튼 클릭, DELETE가 204 | 확인 창 없이 `DELETE /api/todos/{id}`가 호출됨. 그 할 일이 목록에서 사라짐 |
| CMP-53 | TodoApp | 마지막 하나를 삭제, DELETE가 204 | 빈 목록 문구가 보임 |
| CMP-54 | TodoApp | DELETE 응답 전 | 그 할 일이 아직 보이고, 체크박스와 삭제 버튼이 비활성 |
| CMP-55 | TodoApp | DELETE가 404 | 목록 그대로. 목록 위에 "할 일을 찾을 수 없습니다." |
| CMP-56 | TodoApp | DELETE가 500 | 목록 그대로. 목록 위에 "잠시 후 다시 시도해 주세요." |
| CMP-57 | TodoApp | DELETE 연결 실패 | 목록 그대로. 목록 위에 연결 실패 문구 |

**동작 에러 문구 지우기**

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-58 | TodoApp | 전환 실패 문구가 보이는 상태에서 다른 할 일을 전환 | 요청을 시작할 때 이전 문구가 사라짐 |
| CMP-59 | TodoApp | 삭제 실패 문구가 보이는 상태에서 할 일 추가 | 요청을 시작할 때 이전 문구가 사라짐 |

### 3.5 TodoApp (v0.1, 브라우저 메모리)

`fetch`를 쓰지 않는다.

| ID | 대상 | 상황 | 기대 결과 |
|----|------|------|-----------|
| CMP-60 | TodoApp (v0.1) | 처음 그림 | 로딩 문구 없이 바로 빈 목록 문구가 보임. `fetch`가 호출되지 않음 |
| CMP-61 | TodoApp (v0.1) | "우유 사기", "보고서 제출" 순서로 추가 | "보고서 제출"이 맨 위, "우유 사기"가 그 아래 (최신순) |
| CMP-62 | TodoApp (v0.1) | "  우유 사기  " 추가 | 목록에 "우유 사기"(공백 제거)로 보임 |
| CMP-63 | TodoApp (v0.1) | 빈 제목, 101자 제목 추가 시도 | 목록에 추가되지 않음. 검사 문구가 보임 |
| CMP-64 | TodoApp (v0.1) | 체크박스를 두 번 클릭 | 완료 → 미완료로 바뀜 |
| CMP-65 | TodoApp (v0.1) | 2개 중 1개 삭제 | 지운 할 일만 사라짐 |

---

## 4. 기능별 테스트 범위

PRD 6장 성공 기준과 연결한다.

| 기능 | API 테스트 | 컴포넌트 테스트 |
|------|-----------|-----------------|
| F-01 할 일 추가 | API-07 ~ API-27 | CMP-01 ~ CMP-16, CMP-36 ~ CMP-44, CMP-61 ~ CMP-63 |
| F-02 목록 보기 | API-01 ~ API-06 | CMP-25 ~ CMP-27, CMP-30 ~ CMP-34, CMP-60 |
| F-03 완료/미완료 전환 | API-28 ~ API-43 | CMP-17, CMP-18, CMP-20, CMP-21, CMP-23, CMP-45 ~ CMP-51, CMP-64 |
| F-04 할 일 삭제 | API-44 ~ API-50 | CMP-19, CMP-22, CMP-52 ~ CMP-57, CMP-65 |
| F-05 데이터 유지 | API-53, API-54 | CMP-35 |
| 공통 (에러 형식, 문구) | API-51, API-52 | CMP-58, CMP-59 |

## 5. 정해야 할 것

- PostgreSQL 테스트 DB 준비 방법 (TRD 열린 질문: 테스트용 DB를 따로 둘지, Docker로 띄울지). API-53, API-54는 이것이 정해져야 실행할 수 있다.
- 화면 공통 함수(LIB-xx)와 백엔드 검사·저장소(SRV-xx) 테스트 케이스는 docs/PROMPTS.md 1-2, 2-2 단계에서 추가한다.
