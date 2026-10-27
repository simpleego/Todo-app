import { render, screen } from "@testing-library/react";
import TodoList from "@/src/components/TodoList";
import type { Todo } from "@/src/types/todo";

// 테스트용 할 일을 만든다. 바꾸고 싶은 값만 넘긴다
function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01",
    title: "우유 사기",
    completed: false,
    createdAt: "2026-10-23T09:30:00.000Z",
    ...overrides,
  };
}

// 빈 목록 문구 (COMPONENT_SPEC 5장)
const EMPTY_MESSAGE = "아직 할 일이 없습니다. 위에서 할 일을 추가해 보세요.";

describe("TodoList", () => {
  test("CMP-25 todos가 빈 배열이면 빈 목록 문구가 보이고 listitem이 0개다", () => {
    render(<TodoList todos={[]} pendingIds={[]} onToggle={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  test("CMP-26 todos가 3개면 listitem이 3개이고 받은 순서 그대로 보인다", () => {
    // 일부러 최신순이 아닌 순서로 넘긴다 (TodoList가 다시 정렬하지 않는지 확인)
    const todos = [
      makeTodo({ id: "id-1", title: "첫째", createdAt: "2026-10-21T09:00:00.000Z" }),
      makeTodo({ id: "id-2", title: "둘째", createdAt: "2026-10-23T09:00:00.000Z" }),
      makeTodo({ id: "id-3", title: "셋째", createdAt: "2026-10-22T09:00:00.000Z" }),
    ];
    render(<TodoList todos={todos} pendingIds={[]} onToggle={jest.fn()} onDelete={jest.fn()} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("첫째");
    expect(items[1]).toHaveTextContent("둘째");
    expect(items[2]).toHaveTextContent("셋째");
  });
});
