# DATA_MODEL: 간단한 할 일 목록 웹 앱

- 문서 상태: 초안
- 기준 문서: docs/PRD.md, docs/TRD.md
- 작성일: 2026-10-23
- 수정일: 2026-10-27 (DB를 PostgreSQL로 변경, 백엔드 Pydantic 모델 추가)
- DB: PostgreSQL (v0.3부터 사용)

## 1. 개요

PRD의 기능(F-01~F-05)에 필요한 데이터만 정의한다.
로그인, 공유, 마감일, 카테고리는 범위 밖이므로 사용자 테이블이나 카테고리 테이블은 두지 않는다.

- 테이블 수: 1개 (`todos`)
- v0.1(브라우저 메모리), v0.2(서버 메모리)에서도 같은 모양의 데이터를 쓰고, v0.3부터 PostgreSQL에 저장한다.
- 문자 인코딩: `UTF8` (PostgreSQL 기본값. 한글과 이모지를 그대로 저장한다)
- 시각은 시간대 정보와 함께 저장한다(`TIMESTAMPTZ`). API로 보낼 때는 UTC로 바꿔 보낸다.

## 2. 테이블: todos

할 일 하나가 한 줄(행)이다.

| 필드 (DB 컬럼) | PostgreSQL 타입 | 제약조건 | 설명 | 관련 기능 |
|------|------|----------|------|-----------|
| id | UUID | PRIMARY KEY, NOT NULL | 할 일을 구분하는 고유 번호. 서버가 만든다. | F-03, F-04 |
| title | VARCHAR(100) | NOT NULL, 1~100자 (CHECK) | 할 일 제목. 사용자가 입력한다. | F-01 |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 완료 여부. true면 완료, false면 미완료. | F-03 |
| created_at | TIMESTAMPTZ(3) | NOT NULL, 저장 후 바뀌지 않음, INDEX | 할 일을 만든 시각(밀리초까지). 최신순 정렬 기준. | F-02 |

### 필드별 참고

- **id**: 숫자 자동 증가 대신 UUID를 쓴다. v0.1·v0.2처럼 DB가 없는 단계에서도 같은 방식으로 만들 수 있기 때문이다. PostgreSQL에는 `UUID` 타입이 따로 있어서 문자열보다 작고 빠르게 저장된다.
  - 주의: UUID 형식이 아닌 문자열(예: `"abc"`)로 조회하면 PostgreSQL이 에러를 낸다. 그래서 서버는 DB에 묻기 전에 형식을 먼저 확인하고, 틀리면 바로 `404`를 돌려준다. (API_SPEC)
- **title**: 서버가 앞뒤 공백을 지운 뒤 1~100자인지 검사하고, 지운 값을 저장한다. 그래서 저장된 제목에는 앞뒤 공백이 없다. 공백만 있는 제목은 빈 제목으로 보고 저장하지 않는다. `VARCHAR(100)`은 바이트가 아닌 "글자 수" 기준이라 한글 100자도 들어간다. 1자 이상 규칙은 `CHECK`로 한 번 더 막는다. 서버 검사가 최종 기준이다(TRD 6장).
- **completed**: PostgreSQL의 `BOOLEAN`은 true/false를 그대로 저장하므로 따로 바꿀 필요가 없다.
- **created_at**: `TIMESTAMPTZ(3)`은 밀리초까지, 시간대 정보와 함께 저장한다. 최신순 조회가 빠르도록 인덱스를 둔다.

### 글자 수 기준

- "유니코드 코드 포인트" 하나를 1자로 센다. PostgreSQL `char_length()`, 파이썬 `len()`, 자바스크립트 `[...title].length`가 모두 같은 결과를 낸다.
- 흔한 이모지(예: 😀)는 1자다. 여러 문자를 합친 이모지(예: 가족 이모지 👨‍👩‍👧)는 여러 자로 세지만, 화면·서버·DB가 모두 같게 세므로 결과가 어긋나지 않는다.

### 이름 규칙

| 위치 | 규칙 | 예 |
|------|------|-----|
| PostgreSQL 컬럼 | snake_case | `created_at` |
| 파이썬 코드 (Pydantic 필드) | snake_case | `created_at` |
| API JSON, TypeScript | camelCase | `createdAt` |

- snake_case ↔ camelCase 변환은 백엔드가 응답을 만들 때 한 번만 한다(Pydantic의 alias). 화면은 항상 camelCase만 본다.

### 정렬

- 목록은 `created_at` 내림차순(최신이 맨 위)으로 돌려준다. (F-02)
- `created_at`이 같으면 `id` 오름차순으로 정렬한다. 순서에 의미는 없지만 항상 같은 순서가 나온다.
- SQL로는 `ORDER BY created_at DESC, id ASC`

## 3. PostgreSQL 테이블 예시

아래는 예시이며, 실제 적용은 v0.3 구현 단계에서 한다.

```sql
-- 할 일 테이블
CREATE TABLE todos (
  id         UUID           PRIMARY KEY,             -- 고유 번호
  title      VARCHAR(100)   NOT NULL,                -- 제목 1~100자
  completed  BOOLEAN        NOT NULL DEFAULT FALSE,  -- 완료 여부
  created_at TIMESTAMPTZ(3) NOT NULL,                -- 만든 시각
  CONSTRAINT chk_todos_title_length CHECK (char_length(title) BETWEEN 1 AND 100)
);

-- 최신순 조회용 인덱스
CREATE INDEX idx_todos_created_at ON todos (created_at);
```

## 4. 타입 예시

아래는 예시이며, 실제 파일은 구현 단계에서 만든다.

### 백엔드: Pydantic 모델 (backend/app/schemas.py)

```python
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


# 할 일 하나 (API 응답 모양)
class Todo(BaseModel):
    # JSON으로 보낼 때 created_at → createdAt
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: UUID             # 고유 번호
    title: str           # 제목, 1~100자
    completed: bool      # 완료 여부
    created_at: datetime  # 만든 시각 (UTC)
```

- 요청 본문(추가·전환)은 API_SPEC의 검사 순서를 지키려고 Pydantic 모델로 바로 받지 않고 직접 검사한다. (TRD 6장)

### 프론트엔드: TypeScript 타입 (src/types/)

```ts
// 할 일 하나
export type Todo = {
  id: string;         // 고유 번호 (UUID)
  title: string;      // 제목, 1~100자
  completed: boolean; // 완료 여부
  createdAt: string;  // 만든 시각 (ISO 8601 문자열, UTC)
};

// 할 일 추가 요청에 담는 값
export type CreateTodoInput = {
  title: string;
};
```

- `id`, `completed`, `createdAt`은 서버가 채우므로 추가 요청에는 `title`만 담는다.
- `createdAt`은 JSON으로 주고받기 쉽게 `string`으로 둔다. 예) `"2026-10-23T09:30:00.000Z"`
- 백엔드 `Todo`와 프론트엔드 `Todo`는 언어가 달라 따로 만든다. 필드를 바꿀 때는 두 곳을 함께 고친다.

## 5. 예시 데이터

| id | title | completed | created_at |
|----|-------|-----------|------------|
| 3f2a...-c1 | 우유 사기 | false | 2026-10-23 09:30:00.000+00 |
| 8b7d...-e4 | 보고서 제출 | true | 2026-10-22 14:00:00.000+00 |

## 6. 정해야 할 것

- 사용할 PostgreSQL 버전 (TRD 열린 질문과 같음)
