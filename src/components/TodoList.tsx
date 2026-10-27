import TodoItem, { type TodoItemProps } from "@/src/components/TodoItem";
import type { Todo } from "@/src/types/todo";

// 할 일 목록 (COMPONENT_SPEC 3장)
export type TodoListProps = {
  todos: Todo[]; // 최신순으로 정렬된 목록
  pendingIds: string[]; // 요청 중인 할 일 id
  // TodoItem에 그대로 넘기므로 TodoItem의 타입을 같이 쓴다
  onToggle: TodoItemProps["onToggle"];
  onDelete: TodoItemProps["onDelete"];
};

// 빈 목록 문구 (COMPONENT_SPEC 5장)
const EMPTY_MESSAGE = "아직 할 일이 없습니다. 위에서 할 일을 추가해 보세요.";

export default function TodoList({ todos, pendingIds, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p>{EMPTY_MESSAGE}</p>;
  }

  // 받은 순서 그대로 그린다 (정렬은 서버가 한다)
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isPending={pendingIds.includes(todo.id)}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
