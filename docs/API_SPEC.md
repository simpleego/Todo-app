# API_SPEC: 간단한 할 일 목록 웹 앱

- 문서 상태: 초안
- 기준 문서: docs/DATA_MODEL.md, docs/TRD.md (6장 API 규칙)
- 작성일: 2026-10-23

## 1. 개요

| 기능 | 메서드 | 주소 | 성공 코드 |
|------|--------|------|-----------|
| F-02 목록 보기 | GET | `/api/todos` | 200 |
| F-01 할 일 추가 | POST | `/api/todos` | 201 |
| F-03 완료/미완료 전환 | PATCH | `/api/todos/{id}` | 200 |
| F-04 할 일 삭제 | DELETE | `/api/todos/{id}` | 204 |

- 적용 버전: v0.2(서버 메모리)부터. v0.3에서 MySQL로 바뀌어도 API는 그대로다. (v0.1은 API 없음)
- 로그인이 없으므로 인증 헤더는 쓰지 않는다.

## 2. 공통 규칙

### 요청과 응답

- 본문이 있는 요청과 응답은 JSON이다. 헤더 `Content-Type: application/json`
- 성공 응답은 감싸지 않고 그대로 보낸다. 목록은 배열 `[...]`, 할 일 하나는 객체 `{...}`
- 응답의 할 일 모양은 DATA_MODEL.md의 `Todo` 타입과 같다.

```json
{
  "id": "3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01",
  "title": "우유 사기",
  "completed": false,
  "createdAt": "2026-10-23T09:30:00.000Z"
}
```

### 제목 검사 규칙

1. `title`이 문자열이 아니거나 없으면 오류
2. 앞뒤 공백을 지운다.
3. 지운 제목이 1~100자가 아니면 오류. (공백만 있으면 0자이므로 오류)
4. 저장은 공백을 지운 제목으로 한다.

글자 수는 MySQL `CHAR_LENGTH`와 같게 "보이는 글자 하나 = 1자" 기준으로 센다. (이모지 하나도 1자)

### 에러 형식

모든 에러는 아래 형식으로 통일한다.

```json
{
  "error": {
    "code": "INVALID_TITLE",
    "message": "제목은 1~100자로 입력해 주세요."
  }
}
```

- `code`: 에러 종류. 테스트와 코드에서 이 값으로 구분한다. 바뀌지 않는다.
- `message`: 사람이 읽는 한국어 안내. 화면에 그대로 보여준다. 문구는 바뀔 수 있다.

### 에러 코드 목록

| code | 상태 코드 | 언제 | message 예시 |
|------|-----------|------|--------------|
| INVALID_REQUEST | 400 | 본문이 JSON이 아니거나, 객체가 아니거나, 받지 않는 필드가 들어 있음 | 요청 형식이 올바르지 않습니다. |
| INVALID_TITLE | 400 | `title`이 없거나, 문자열이 아니거나, 공백을 지운 뒤 1~100자가 아님 | 제목은 1~100자로 입력해 주세요. |
| INVALID_COMPLETED | 400 | `completed`가 없거나 true/false가 아님 | 완료 여부 값이 올바르지 않습니다. |
| NOT_FOUND | 404 | 해당 id의 할 일이 없음 (형식이 틀린 id 포함) | 할 일을 찾을 수 없습니다. |
| INTERNAL_ERROR | 500 | 서버나 DB에서 예상하지 못한 오류 | 잠시 후 다시 시도해 주세요. |

### 검사 순서

여러 오류가 동시에 있으면 먼저 걸린 하나만 돌려준다.

1. 본문 형식 (`INVALID_REQUEST`)
2. 필드 값 (`INVALID_TITLE`, `INVALID_COMPLETED`)
3. id 존재 여부 (`NOT_FOUND`)

## 3. 엔드포인트

### 3.1 목록 보기 — `GET /api/todos` (F-02)

모든 할 일을 최신순으로 돌려준다.

**요청**

```http
GET /api/todos
```

본문 없음.

**성공 응답: `200 OK`**

`createdAt` 최신순, 같으면 `id` 순으로 정렬된 배열.

```json
[
  {
    "id": "3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01",
    "title": "우유 사기",
    "completed": false,
    "createdAt": "2026-10-23T09:30:00.000Z"
  },
  {
    "id": "8b7d4e2f-1a3c-4b5d-8e6f-9a0b1c2d3e04",
    "title": "보고서 제출",
    "completed": true,
    "createdAt": "2026-10-22T14:00:00.000Z"
  }
]
```

할 일이 없으면 빈 배열.

```json
[]
```

**에러**

| 상황 | 상태 코드 | code |
|------|-----------|------|
| DB 조회 실패 | 500 | INTERNAL_ERROR |

---

### 3.2 할 일 추가 — `POST /api/todos` (F-01)

새 할 일을 만든다. `id`, `completed`(false), `createdAt`은 서버가 채운다.

**요청**

```http
POST /api/todos
Content-Type: application/json
```

```json
{
  "title": "  우유 사기  "
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | 예 | 앞뒤 공백을 지운 뒤 1~100자 |

`title` 외의 필드는 받지 않는다.

**성공 응답: `201 Created`**

만들어진 할 일. 제목은 앞뒤 공백이 지워진 값이다.

```json
{
  "id": "3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01",
  "title": "우유 사기",
  "completed": false,
  "createdAt": "2026-10-23T09:30:00.000Z"
}
```

**에러**

| 상황 | 요청 본문 예시 | 상태 코드 | code |
|------|----------------|-----------|------|
| 본문이 JSON이 아님 | `우유 사기` | 400 | INVALID_REQUEST |
| 본문이 객체가 아님 | `["우유 사기"]` | 400 | INVALID_REQUEST |
| 받지 않는 필드가 있음 | `{ "title": "우유", "completed": true }` | 400 | INVALID_REQUEST |
| title 없음 | `{}` | 400 | INVALID_TITLE |
| title이 문자열이 아님 | `{ "title": 123 }` | 400 | INVALID_TITLE |
| title이 빈 문자열 | `{ "title": "" }` | 400 | INVALID_TITLE |
| title이 공백만 있음 | `{ "title": "   " }` | 400 | INVALID_TITLE |
| title이 101자 이상 (공백 제외) | `{ "title": "가가가...(101자)" }` | 400 | INVALID_TITLE |
| DB 저장 실패 | | 500 | INTERNAL_ERROR |

에러 응답 예시:

```json
{
  "error": {
    "code": "INVALID_TITLE",
    "message": "제목은 1~100자로 입력해 주세요."
  }
}
```

---

### 3.3 완료/미완료 전환 — `PATCH /api/todos/{id}` (F-03)

할 일의 완료 여부를 요청받은 값으로 바꾼다. 같은 요청을 두 번 보내도 결과는 같다.
수정 기능은 범위 밖이므로 `completed`만 바꿀 수 있다.

**요청**

```http
PATCH /api/todos/3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01
Content-Type: application/json
```

```json
{
  "completed": true
}
```

| 위치 | 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| 주소 | id | string (UUID) | 예 | 바꿀 할 일의 id |
| 본문 | completed | boolean | 예 | true면 완료, false면 미완료 |

`completed` 외의 필드는 받지 않는다.

**성공 응답: `200 OK`**

바뀐 할 일.

```json
{
  "id": "3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01",
  "title": "우유 사기",
  "completed": true,
  "createdAt": "2026-10-23T09:30:00.000Z"
}
```

**에러**

| 상황 | 요청 예시 | 상태 코드 | code |
|------|-----------|-----------|------|
| 본문이 JSON이 아님 | `{ "completed": tru` (깨진 JSON) | 400 | INVALID_REQUEST |
| 받지 않는 필드가 있음 (제목 수정 시도 등) | `{ "completed": true, "title": "새 제목" }` | 400 | INVALID_REQUEST |
| completed 없음 | `{}` | 400 | INVALID_COMPLETED |
| completed가 true/false가 아님 | `{ "completed": "yes" }`, `{ "completed": 1 }` | 400 | INVALID_COMPLETED |
| 해당 id의 할 일이 없음 | `PATCH /api/todos/<지워진 id>` | 404 | NOT_FOUND |
| id 형식이 틀림 | `PATCH /api/todos/abc` | 404 | NOT_FOUND |
| DB 수정 실패 | | 500 | INTERNAL_ERROR |

에러 응답 예시:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "할 일을 찾을 수 없습니다."
  }
}
```

---

### 3.4 할 일 삭제 — `DELETE /api/todos/{id}` (F-04)

할 일 하나를 지운다.

**요청**

```http
DELETE /api/todos/3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01
```

| 위치 | 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| 주소 | id | string (UUID) | 예 | 지울 할 일의 id |

본문 없음.

**성공 응답: `204 No Content`**

응답 본문 없음.

**에러**

| 상황 | 요청 예시 | 상태 코드 | code |
|------|-----------|-----------|------|
| 해당 id의 할 일이 없음 (이미 지움 포함) | `DELETE /api/todos/<지워진 id>` | 404 | NOT_FOUND |
| id 형식이 틀림 | `DELETE /api/todos/abc` | 404 | NOT_FOUND |
| DB 삭제 실패 | | 500 | INTERNAL_ERROR |

에러 응답 예시:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "할 일을 찾을 수 없습니다."
  }
}
```

## 4. TypeScript 타입 예시

`src/types/`에 둔다. (예시이며, 실제 파일은 구현 단계에서 만든다.) `Todo`, `CreateTodoInput`은 DATA_MODEL.md와 같다.

```ts
// 완료 전환 요청에 담는 값
export type UpdateTodoInput = {
  completed: boolean;
};

// 에러 코드
export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_TITLE"
  | "INVALID_COMPLETED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

// 에러 응답
export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
```
