import type { Todo } from "@/src/types/todo";

// 할 일 한 줄 (COMPONENT_SPEC 3장)
export type TodoItemProps = {
  todo: Todo;
  // 요청 중이면 체크박스와 삭제 버튼을 막는다
  isPending: boolean;
  // 바꿀 값(현재의 반대)을 넘긴다
  onToggle: (id: string, completed: boolean) => void;
  // 삭제할 할 일의 id를 넘긴다
  onDelete: (id: string) => void;
};

export default function TodoItem({ todo, isPending, onToggle, onDelete }: TodoItemProps) {
  // 체크하면 지금 상태의 반대로 바꿔 달라고 알린다
  const handleToggle = () => onToggle(todo.id, !todo.completed);
  const handleDelete = () => onDelete(todo.id);

  // aria-label: 화면 읽기 프로그램이 읽어 주는 이름 (COMPONENT_SPEC 6장)
  return (
    <li className="flex items-center gap-2 py-1">
      <input
        type="checkbox"
        aria-label={todo.title}
        checked={todo.completed}
        disabled={isPending}
        onChange={handleToggle}
      />
      <span className="flex-1">{todo.title}</span>
      <button
        type="button"
        aria-label={`${todo.title} 삭제`}
        disabled={isPending}
        onClick={handleDelete}
        className="rounded border px-2 text-sm disabled:opacity-50"
      >
        삭제
      </button>
    </li>
  );
}
