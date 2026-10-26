# DATA_MODEL: 간단한 할 일 목록 웹 앱

- 문서 상태: 초안
- 기준 문서: docs/PRD.md, docs/TRD.md
- 작성일: 2026-10-23
- DB: MySQL (v0.3부터 사용)

## 1. 개요

PRD의 기능(F-01~F-05)에 필요한 데이터만 정의한다.
로그인, 공유, 마감일, 카테고리는 범위 밖이므로 사용자 테이블이나 카테고리 테이블은 두지 않는다.

- 테이블 수: 1개 (`todos`)
- v0.1(브라우저 메모리), v0.2(서버 메모리)에서도 같은 모양의 데이터를 쓰고, v0.3부터 MySQL에 저장한다.
- 문자 인코딩: `utf8mb4` (한글과 이모지를 문제없이 저장하기 위해)
- 시각은 UTC로 저장한다. 화면에서 보여줄 때 한국 시간 등으로 바꾼다.

## 2. 테이블: todos

할 일 하나가 한 줄(행)이다.

| 필드 (MySQL 컬럼) | MySQL 타입 | 제약조건 | 설명 | 관련 기능 |
|------|------|----------|------|-----------|
| id | CHAR(36) | PRIMARY KEY, NOT NULL | 할 일을 구분하는 고유 번호(UUID). 서버가 만든다. | F-03, F-04 |
| title | VARCHAR(100) | NOT NULL, 1~100자 (CHECK) | 할 일 제목. 사용자가 입력한다. | F-01 |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 완료 여부. true면 완료, false면 미완료. | F-03 |
| created_at | DATETIME(3) | NOT NULL, 저장 후 바뀌지 않음, INDEX | 할 일을 만든 시각(UTC, 밀리초까지). 최신순 정렬 기준. | F-02 |

### 필드별 참고

- **id**: 숫자 자동 증가(AUTO_INCREMENT) 대신 UUID를 쓴다. v0.1·v0.2처럼 DB가 없는 단계에서도 같은 방식으로 만들 수 있기 때문이다. UUID는 항상 36자이므로 `CHAR(36)`으로 둔다.
- **title**: 서버가 앞뒤 공백을 지운 뒤 1~100자인지 검사하고, 지운 값을 저장한다. 그래서 저장된 제목에는 앞뒤 공백이 없다. 공백만 있는 제목은 빈 제목으로 보고 저장하지 않는다. `VARCHAR(100)`은 utf8mb4에서 바이트가 아닌 "글자 수" 기준이라 한글 100자도 들어간다. 1자 이상 규칙은 `CHECK`로 한 번 더 막는다. 서버(lib) 검사가 최종 기준이다(TRD 6장).
- **completed**: MySQL의 `BOOLEAN`은 실제로는 `TINYINT(1)`이라 0/1로 저장된다. 읽을 때 true/false로 바꾼다.
- **created_at**: `DATETIME(3)`은 밀리초까지 저장해서 같은 시각이 겹칠 일을 줄인다. 최신순 조회가 빠르도록 인덱스를 둔다.

### 이름 규칙

- MySQL 컬럼은 `snake_case`(예: `created_at`), TypeScript는 `camelCase`(예: `createdAt`)로 쓴다.
- 두 이름을 바꾸는 일은 `src/lib`에서만 한다. 화면은 항상 TypeScript 이름만 본다.

### 정렬

- 목록은 `created_at` 내림차순(최신이 맨 위)으로 돌려준다. (F-02)
- `created_at`이 같으면 `id` 오름차순으로 정렬한다. 순서에 의미는 없지만 항상 같은 순서가 나온다.
- SQL로는 `ORDER BY created_at DESC, id ASC`

## 3. MySQL 테이블 예시

아래는 예시이며, 실제 적용은 v0.3 구현 단계에서 한다. (`CHECK`는 MySQL 8.0.16 이상에서 동작)

```sql
-- 할 일 테이블
CREATE TABLE todos (
  id         CHAR(36)     NOT NULL,                -- UUID
  title      VARCHAR(100) NOT NULL,                -- 제목 1~100자
  completed  BOOLEAN      NOT NULL DEFAULT FALSE,  -- 완료 여부
  created_at DATETIME(3)  NOT NULL,                -- 만든 시각 (UTC)
  PRIMARY KEY (id),
  INDEX idx_todos_created_at (created_at),
  CONSTRAINT chk_todos_title_length CHECK (CHAR_LENGTH(title) BETWEEN 1 AND 100)
) DEFAULT CHARSET = utf8mb4;
```

## 4. TypeScript 타입 예시

화면과 서버가 같이 쓰는 타입이므로 `src/types/`에 둔다. (아래는 예시이며, 실제 파일은 구현 단계에서 만든다.)

```ts
// 할 일 하나
export type Todo = {
  id: string;         // 고유 번호 (UUID)
  title: string;      // 제목, 1~100자
  completed: boolean; // 완료 여부
  createdAt: string;  // 만든 시각 (ISO 8601 문자열)
};

// 할 일 추가 요청에 담는 값
export type CreateTodoInput = {
  title: string;
};
```

- `id`, `completed`, `createdAt`은 서버가 채우므로 추가 요청에는 `title`만 담는다.
- `createdAt`은 JSON으로 주고받기 쉽게 `string`으로 둔다. 예) `"2026-10-23T09:30:00.000Z"`
- MySQL에서 읽은 값은 `src/lib`에서 `Todo` 모양으로 바꾼다. (`created_at` → `createdAt`, 0/1 → false/true)

## 5. 예시 데이터

| id | title | completed | created_at |
|----|-------|-----------|------------|
| 3f2a...-c1 | 우유 사기 | 0 (false) | 2026-10-23 09:30:00.000 |
| 8b7d...-e4 | 보고서 제출 | 1 (true) | 2026-10-22 14:00:00.000 |

## 6. 정해야 할 것

- 사용할 MySQL 버전 (`CHECK`를 쓰려면 8.0.16 이상 필요)
