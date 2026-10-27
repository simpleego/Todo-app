# PROMPTS: 단계별 지시 프롬프트 (TDD)

- 작성일: 2026-10-26
- 수정일: 2026-10-27 (백엔드 FastAPI, DB PostgreSQL 반영)
- 현재 위치: 초기 설정 완료 (커밋 `0465105`, 프론트엔드만 설정됨)
- 목표: v0.1 → v0.2 → v0.3 → (v0.4) → v1.0 배포

## 사용법

1. 아래 단계를 위에서부터 하나씩 진행한다. 한 번에 프롬프트 하나만 보낸다.
2. 각 단계의 코드 블록을 그대로 복사해서 Claude에게 보낸다.
3. Claude가 요약을 보여주면 결과를 확인한다. 문제가 없으면 커밋 프롬프트를 보낸다.
4. 다음 단계로 넘어간다.

모든 프롬프트는 아래 "공통 규칙"을 따른다는 문장으로 시작한다. 그래서 프롬프트마다 규칙을 다시 적지 않는다.

---

## 공통 규칙 (모든 단계에 적용)

Claude는 매 단계마다 이 규칙을 따른다.

### TDD 순서

1. **준비**: 관련 명세(docs/)와 TEST_CASES.md의 해당 ID를 읽는다. Next.js 코드(page, next.config 등)를 쓸 때는 AGENTS.md에 따라 `node_modules/next/dist/docs/`의 관련 문서를 먼저 읽는다.
2. **Red**: 테스트를 먼저 쓴다. 테스트 이름에는 TEST_CASES의 ID를 넣는다. (예: `"CMP-17 미완료 할 일을 그리면 체크 해제 상태다"`, `test_api_07_title_is_saved`) 테스트를 실행해서 **실패하는 것을 확인하고 실패 결과를 보여준다.**
3. **Green**: 테스트를 통과하는 최소한의 구현만 쓴다. 명세에 없는 기능은 넣지 않는다.
4. **Refactor**: 테스트가 통과하는 상태를 유지하며 코드를 정리한다.
5. **확인**: 아래 검사를 모두 실행하고 결과를 보여준다.
   - 화면을 바꿨으면: `npm test`, `npm run lint`, `npx tsc --noEmit`
   - 백엔드를 바꿨으면 (backend/에서): `pytest`, `ruff check .`, `mypy app`
6. **요약**: 바꾼 파일, 추가한 테스트 ID, 정한 것, 남은 문제를 요약하고 멈춘다.

### 지킬 것

- 한 번에 이 단계의 범위만 작업한다. 다음 단계 내용을 미리 만들지 않는다.
- 테스트를 삭제하거나 skip하지 않는다. 테스트가 실패하면 구현을 고친다.
- 테스트가 명세와 맞지 않거나 명세가 모자라면, 임의로 정하지 말고 멈춰서 물어본다.
- TypeScript: any 금지, console.log 남기지 않기. Python: 타입 힌트 필수, Any 금지, print 남기지 않기.
- 주석은 한국어로 짧게.
- 커밋과 push는 하지 않는다. 내가 따로 요청할 때만 한다.

---

## v0.1 화면만 (브라우저 메모리)

v0.1은 프론트엔드(Next.js)만 작업한다. 백엔드는 v0.2에서 시작한다.

### 1-1. 공유 타입

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-1. 공유 타입" 단계를 진행해줘.
DATA_MODEL.md와 API_SPEC.md의 TypeScript 타입 예시를 바탕으로 src/types/에
Todo, CreateTodoInput, UpdateTodoInput, ApiErrorCode, ApiErrorResponse 타입을 만들어줘.
타입만 있는 파일이라 테스트는 쓰지 말고, npx tsc --noEmit과 npm run lint로 확인해줘.
```

### 1-2. 제목 검사 함수 (화면용)

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-2. 제목 검사 함수" 단계를 진행해줘.
화면에서 쓸 제목 검사 함수를 src/lib/에 만들 거야. (서버용은 v0.2에서 Python으로 따로 만든다)
먼저 TEST_CASES.md에 이 함수용 테스트 케이스(LIB-xx)를 추가하는 안을 보여주고 내 확인을 받아줘.
기준: 앞뒤 공백 제거 후 1~100자, 공백만이면 실패, 글자 수는 코드 포인트 기준(이모지 😀 하나는 1자),
경계값은 API-09 ~ API-18과 같게. 테스트 파일은 tests/lib/에 둬줘.
확인을 받은 뒤 Red → Green → Refactor로 진행해줘.
```

### 1-3. TodoItem

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-3. TodoItem" 단계를 진행해줘.
COMPONENT_SPEC.md의 TodoItem Props와 6장 접근성 약속을 지켜서
TEST_CASES.md의 CMP-17 ~ CMP-24를 tests/components/에 먼저 쓰고,
실패를 확인한 뒤 src/components/TodoItem.tsx를 구현해줘.
```

### 1-4. TodoList

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-4. TodoList" 단계를 진행해줘.
TEST_CASES.md의 CMP-25 ~ CMP-29를 먼저 쓰고, 실패를 확인한 뒤
src/components/TodoList.tsx를 구현해줘. 앞 단계의 TodoItem을 사용해줘.
```

### 1-5. TodoForm

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-5. TodoForm" 단계를 진행해줘.
TEST_CASES.md의 CMP-01 ~ CMP-16을 먼저 쓰고, 실패를 확인한 뒤
src/components/TodoForm.tsx를 구현해줘. 제목 검사는 1-2에서 만든 함수를 써줘.
```

### 1-6. TodoApp (v0.1) + 페이지 연결

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-6. TodoApp (v0.1)" 단계를 진행해줘.
TEST_CASES.md의 CMP-60 ~ CMP-65를 먼저 쓰고, 실패를 확인한 뒤
src/components/TodoApp.tsx를 브라우저 메모리 방식으로 구현해줘. (COMPONENT_SPEC 7장 v0.1)
그다음 app/page.tsx가 TodoApp만 보여주도록 바꾸고,
create-next-app 기본 화면 파일(page.module.css, 쓰지 않는 public/*.svg)과
지금 구조에서 쓰지 않는 tests/api/ 폴더, 샘플 테스트(tests/sample.test.ts)를 정리해줘.
지울 파일 목록은 지우기 전에 먼저 보여줘.
```

### 1-7. v0.1 마무리

```
docs/PROMPTS.md의 공통 규칙을 따라 "1-7. v0.1 마무리" 단계를 진행해줘.
1) npm test, npm run lint, npx tsc --noEmit, npm run build를 실행해서 결과를 보여줘.
2) npm run dev로 띄우고 추가/완료 전환/삭제가 화면에서 동작하는지 확인해줘.
3) PRD 6장의 v0.1 완료 기준(F-01~F-04가 브라우저에서 동작)을 하나씩 체크한 표를 보여줘.
코드는 고치지 말고, 문제가 있으면 목록으로만 알려줘.
```

---

## v0.2 API 연결 (FastAPI, 서버 메모리)

### 2-0. 백엔드 초기 설정

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-0. 백엔드 초기 설정" 단계를 진행해줘.
TRD.md 2·3장을 바탕으로 backend/ 폴더에 FastAPI 프로젝트를 설정할 계획을 먼저 보여주고,
내 확인을 받은 뒤 실행해줘. 기능 코드(API)는 만들지 마.
- 파이썬 버전 확인, 가상환경(TRD 열린 질문: venv+pip 또는 uv 중 추천안으로)
- 패키지: fastapi, uvicorn, pytest, httpx, ruff, mypy (requirements 파일로 관리)
- 폴더: backend/app/, backend/app/routers/, backend/app/repository/, backend/tests/
- ruff, mypy, pytest 설정 (mypy는 Any 금지가 드러나게)
- .gitignore에 가상환경 폴더, backend/.env, __pycache__ 추가
- "1 + 1 = 2" 샘플 테스트 하나
끝나면 pytest, ruff check ., mypy app 결과를 보여줘.
```

### 2-1. 에러 응답 처리 (공통)

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-1. 에러 응답 처리" 단계를 진행해줘.
API_SPEC.md 2장 에러 형식과 TRD.md 6장 "FastAPI에서 지킬 것"을 바탕으로
backend/app/main.py와 errors.py에 에러 처리기를 만들 거야.
먼저 TEST_CASES.md에 에러 처리기용 테스트 케이스(SRV-xx)를 추가하는 안을 보여주고 확인을 받아줘.
확인할 것: 422 대신 400 INVALID_REQUEST, 처리 못한 예외는 500 INTERNAL_ERROR,
{ "detail": ... } 형식이 절대 나오지 않음.
TRD 10장의 "404·405 에러 code" 열린 질문이 필요하면 추천안과 함께 물어봐줘.
```

### 2-2. 제목 검사와 저장소 (서버 메모리)

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-2. 제목 검사와 저장소" 단계를 진행해줘.
1) backend/app/validation.py: 제목 검사 (1-2의 화면용 함수와 같은 규칙)
2) backend/app/repository/: 저장소 인터페이스(목록/추가/전환/삭제)와 서버 메모리 구현.
   v0.3에서 PostgreSQL 구현으로 갈아 끼울 수 있게, FastAPI 의존성(Depends)으로 주입해줘.
3) backend/app/schemas.py: DATA_MODEL.md 4장의 Pydantic Todo (camelCase alias)
TEST_CASES.md에 SRV-xx 테스트 케이스를 추가하는 안을 먼저 보여주고 확인을 받아줘.
기준: LIB-xx와 같은 경계값, 최신순 + 같은 시각이면 id 순, 새 할 일은 completed=false, 테스트마다 빈 저장소.
```

### 2-3. GET /api/todos

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-3. GET /api/todos" 단계를 진행해줘.
TEST_CASES.md의 API-01 ~ API-06을 backend/tests/에 먼저 쓰고 (TestClient 사용),
실패를 확인한 뒤 backend/app/routers/todos.py의 GET을 구현해줘.
DB 오류는 dependency_overrides로 저장소를 에러를 던지는 가짜로 바꿔서 만들어줘.
```

### 2-4. POST /api/todos

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-4. POST /api/todos" 단계를 진행해줘.
TEST_CASES.md의 API-07 ~ API-27을 먼저 쓰고, 실패를 확인한 뒤 POST를 구현해줘.
본문은 Pydantic 모델로 바로 받지 말고 직접 꺼내서 검사해줘. (API_SPEC 검사 순서: 본문 형식 → 필드 값)
```

### 2-5. PATCH /api/todos/{id}

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-5. PATCH /api/todos/{id}" 단계를 진행해줘.
TEST_CASES.md의 API-28 ~ API-43을 먼저 쓰고, 실패를 확인한 뒤 PATCH를 구현해줘.
id는 str로 받고, UUID 형식이 아니면 바로 404로 해줘. completed 외의 필드는 거절해줘.
검사 순서는 본문 형식 → 필드 값 → id 존재 순서로 해줘.
```

### 2-6. DELETE /api/todos/{id}

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-6. DELETE /api/todos/{id}" 단계를 진행해줘.
TEST_CASES.md의 API-44 ~ API-50을 먼저 쓰고, 실패를 확인한 뒤 DELETE를 구현해줘.
```

### 2-7. API 공통 확인

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-7. API 공통 확인" 단계를 진행해줘.
TEST_CASES.md의 API-51, API-52를 먼저 쓰고, 실패하면 구현을 고쳐줘.
그다음 uvicorn으로 백엔드를 띄워서 curl로 4개 엔드포인트를 한 번씩 호출한 결과를 보여줘.
```

### 2-8. 화면과 백엔드 연결 (rewrites)

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-8. 화면과 백엔드 연결" 단계를 진행해줘.
TRD.md 4장대로 next.config.ts에 rewrites를 설정해서 /api/* 를 FastAPI로 넘겨줘.
백엔드 주소는 환경 변수 API_BASE_URL로 받고, 기본값은 http://localhost:8000으로 해줘.
.env.example도 만들어줘(값 예시만). 화면 코드는 아직 바꾸지 마.
두 서버를 띄우고 curl http://localhost:3000/api/todos 가 백엔드 응답을 돌려주는지 보여줘.
```

### 2-9. TodoApp API 연결: 목록 불러오기

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-9. TodoApp 목록 불러오기" 단계를 진행해줘.
TEST_CASES.md의 CMP-30 ~ CMP-35를 먼저 쓰고 (fetch는 mock), 실패를 확인한 뒤
TodoApp이 페이지를 열 때 GET /api/todos로 목록을 불러오게 바꿔줘.
v0.1용 테스트(CMP-60 ~ CMP-65)는 삭제하지 말고, v0.2 동작에 맞지 않게 되면 어떻게 할지 먼저 물어봐줘.
```

### 2-10. TodoApp API 연결: 추가

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-10. TodoApp 추가" 단계를 진행해줘.
TEST_CASES.md의 CMP-36 ~ CMP-44를 먼저 쓰고, 실패를 확인한 뒤
TodoApp의 추가 동작을 POST /api/todos로 바꿔줘. 낙관적 업데이트는 하지 마.
```

### 2-11. TodoApp API 연결: 전환과 삭제

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-11. TodoApp 전환과 삭제" 단계를 진행해줘.
TEST_CASES.md의 CMP-45 ~ CMP-59를 먼저 쓰고, 실패를 확인한 뒤
전환(PATCH)과 삭제(DELETE)를 API로 바꿔줘. 요청 중에는 그 할 일의 버튼을 막아줘.
```

### 2-12. v0.2 마무리

```
docs/PROMPTS.md의 공통 규칙을 따라 "2-12. v0.2 마무리" 단계를 진행해줘.
1) 화면: npm test, npm run lint, npx tsc --noEmit, npm run build 결과를 보여줘.
2) 백엔드: pytest, ruff check ., mypy app 결과를 보여줘.
3) 두 서버를 띄워서 할 일을 추가한 뒤 새로고침해도 남아 있는지 확인해줘.
4) PRD 6장의 v0.2 완료 기준을 체크한 표를 보여줘.
코드는 고치지 말고, 문제가 있으면 목록으로만 알려줘.
```

---

## v0.3 DB 저장 (PostgreSQL)

### 3-0. 결정할 것 정리

```
docs/PROMPTS.md의 공통 규칙을 따라 "3-0. v0.3 결정" 단계를 진행해줘. 코드는 쓰지 마.
TRD.md와 DATA_MODEL.md의 열린 질문 중 v0.3 전에 정해야 할 것을 정리해줘:
PostgreSQL 버전, 접속 방식(psycopg 3 / SQLAlchemy), 개발용 PostgreSQL 실행 방법(직접 설치 / Docker),
테스트용 DB를 따로 둘지, 테이블 생성 방법(SQL 파일 / 마이그레이션 도구).
각각 추천안과 이유를 한 줄씩 붙여줘.
```

```
추천대로 결정해서 관련 문서(TRD, DATA_MODEL, TEST_CASES, CLAUDE.md)에 반영해줘.
```

### 3-1. PostgreSQL 개발 환경 준비

```
docs/PROMPTS.md의 공통 규칙을 따라 "3-1. PostgreSQL 개발 환경 준비" 단계를 진행해줘.
3-0에서 정한 방식으로 개발용/테스트용 PostgreSQL을 준비할 계획을 먼저 보여주고, 내 확인 후 실행해줘.
- 필요한 파이썬 패키지 설치 (requirements에 추가)
- backend/.env 예시 (backend/.env.example은 값 없이 커밋용으로, DATABASE_URL)
- DATA_MODEL.md 3장의 todos 테이블을 만드는 스크립트
- 접속 확인 방법
비밀번호 같은 실제 값은 파일에 쓰지 말고 나에게 입력하라고 안내해줘.
```

### 3-2. PostgreSQL 저장소 구현

```
docs/PROMPTS.md의 공통 규칙을 따라 "3-2. PostgreSQL 저장소" 단계를 진행해줘.
2-2의 저장소 인터페이스를 그대로 두고 PostgreSQL 구현을 backend/app/repository/에 추가해줘.
먼저 2-2의 저장소 테스트(SRV-xx)가 테스트용 PostgreSQL에서도 돌도록 만들고 실패를 확인한 뒤 구현해줘.
화면 코드와 routers는 바꾸지 않는 것이 목표야. 바꿔야 한다면 먼저 이유를 알려줘.
```

### 3-3. 데이터 유지 테스트

```
docs/PROMPTS.md의 공통 규칙을 따라 "3-3. 데이터 유지 테스트" 단계를 진행해줘.
TEST_CASES.md의 API-53, API-54를 먼저 쓰고, 실패를 확인한 뒤 필요한 구현을 해줘.
그다음 API-01 ~ API-52 전체가 PostgreSQL 저장소로도 통과하는지 확인해줘.
```

### 3-4. v0.3 마무리

```
docs/PROMPTS.md의 공통 규칙을 따라 "3-4. v0.3 마무리" 단계를 진행해줘.
1) 화면과 백엔드의 전체 테스트, 코드 검사, 타입 검사, npm run build 결과를 보여줘.
2) 할 일을 추가하고, 백엔드 서버를 껐다 켠 뒤에도 남아 있는지 확인해줘.
3) PRD 6장의 v0.3 완료 기준을 체크한 표를 보여줘.
코드는 고치지 말고, 문제가 있으면 목록으로만 알려줘.
```

---

## v0.4 필터와 수정 (선택)

PRD에서 F-06(필터), F-07(수정)을 뺀 상태다. 진행하려면 **코드보다 명세를 먼저** 바꾼다. 하지 않을 거면 이 절을 건너뛰고 v1.0으로 간다.

### 4-0. 명세 추가

```
docs/PROMPTS.md의 공통 규칙을 따라 "4-0. v0.4 명세" 단계를 진행해줘. 코드는 쓰지 마.
필터와 수정 기능을 PRD에 F-06, F-07로 다시 추가하기 전에 정해야 할 것을 알려줘.
(필터 조건, 수정 범위, API 모양, 화면 동작, updated_at 필요 여부 등)
```

```
추천대로 결정해서 PRD, TRD, DATA_MODEL, API_SPEC, COMPONENT_SPEC, TEST_CASES에 반영해줘.
새 테스트 ID는 기존 번호 뒤에 이어서 붙여줘.
```

### 4-1. 필터 (F-06)

```
docs/PROMPTS.md의 공통 규칙을 따라 "4-1. 필터" 단계를 진행해줘.
TEST_CASES.md의 F-06 테스트를 백엔드 API → 화면 컴포넌트 순서로 먼저 쓰고, 실패를 확인한 뒤 구현해줘.
```

### 4-2. 수정 (F-07)

```
docs/PROMPTS.md의 공통 규칙을 따라 "4-2. 수정" 단계를 진행해줘.
TEST_CASES.md의 F-07 테스트를 백엔드 API → 화면 컴포넌트 순서로 먼저 쓰고, 실패를 확인한 뒤 구현해줘.
기존 "completed 외의 필드는 거절" 테스트(API-38, API-39)가 바뀐 명세와 충돌하면,
테스트를 지우지 말고 어떻게 할지 먼저 물어봐줘.
```

### 4-3. v0.4 마무리

```
docs/PROMPTS.md의 공통 규칙을 따라 "4-3. v0.4 마무리" 단계를 진행해줘.
화면과 백엔드의 전체 테스트, 코드 검사, 타입 검사, build 결과와 v0.4 완료 기준 체크 표를 보여줘.
```

---

## v1.0 배포

배포할 것이 3개다: 프론트엔드(Next.js), 백엔드(FastAPI), PostgreSQL.

### 5-0. 배포 결정

```
docs/PROMPTS.md의 공통 규칙을 따라 "5-0. 배포 결정" 단계를 진행해줘. 코드는 쓰지 마.
Next.js 프론트엔드, FastAPI 백엔드, PostgreSQL을 각각 어디에 배포할지 선택지를 비교해줘.
(비용, 난이도, 무료 범위, 세 곳을 연결하는 방법)
초보자 기준 추천안 하나와 이유를 알려줘.
```

```
추천대로 결정해서 TRD에 반영해줘.
```

### 5-1. 배포 준비

```
docs/PROMPTS.md의 공통 규칙을 따라 "5-1. 배포 준비" 단계를 진행해줘.
1) 프론트엔드(API_BASE_URL)와 백엔드(DATABASE_URL 등)에 필요한 환경 변수 목록을 정리하고 .env.example들을 맞춰줘.
2) 운영 DB에 todos 테이블을 만드는 방법을 정리해줘.
3) 백엔드 운영 실행 명령(uvicorn, 개발용 --reload 없이)과 필요하면 Dockerfile을 준비해줘.
4) npm run build && npm run start + 백엔드 운영 실행으로 두 서버가 함께 동작하는지 확인해줘.
5) 배포 전에 내가 직접 해야 할 일(계정 생성, 비밀번호 입력 등)을 체크리스트로 알려줘.
```

### 5-2. 배포

```
"5-2. 배포" 단계를 진행해줘.
5-1 체크리스트는 다 끝냈어. 순서는 PostgreSQL → 백엔드 → 프론트엔드로 해줘.
배포 명령이나 설정을 실행하기 전에 무엇을 할지 먼저 보여주고 확인을 받아줘.
```

### 5-3. 배포 확인과 마무리

```
docs/PROMPTS.md의 공통 규칙을 따라 "5-3. 배포 확인" 단계를 진행해줘.
1) 배포 주소에서 추가 → 완료 전환 → 삭제 → 새로고침 후 유지를 확인하는 체크리스트를 만들어줘.
2) PRD 6장의 v1.0 완료 기준과 품질 기준을 체크한 표를 보여줘.
3) README.md에 앱 소개, 구조(프론트엔드/백엔드/DB), 실행 방법, 테스트 방법, 배포 주소를 정리해줘.
```

---

## 단계마다 쓰는 짧은 프롬프트

| 상황 | 프롬프트 |
|------|----------|
| 결과가 괜찮을 때 | `커밋해줘` |
| GitHub에 올릴 때 | `push해줘` |
| 버전 하나를 끝냈을 때 | `v0.1 태그를 만들어줘` (push는 따로) |
| 테스트가 실패한 채로 멈췄을 때 | `테스트는 그대로 두고 실패 원인을 설명한 뒤 구현을 고쳐줘` |
| 범위를 넘은 것 같을 때 | `이번 단계 범위를 넘은 변경이 있으면 목록으로 보여줘` |
| 지금 어디까지 했는지 볼 때 | `docs/PROMPTS.md 기준으로 지금 몇 단계까지 끝났는지 알려줘` |
