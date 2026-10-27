// 할 일 하나 (DATA_MODEL.md 4장)
export type Todo = {
  id: string; // 고유 번호 (UUID)
  title: string; // 제목, 1~100자
  completed: boolean; // 완료 여부
  // JSON으로 주고받을 때 Date 객체는 문자열이 되므로 처음부터 ISO 문자열로 둔다
  createdAt: string; // 만든 시각 (ISO 8601, UTC) 예: "2026-10-23T09:30:00.000Z"
};
