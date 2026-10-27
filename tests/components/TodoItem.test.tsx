import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "@/src/components/TodoItem";
import type { Todo } from "@/src/types/todo";

// 테스트용 할 일 (미완료)
const todo: Todo = {
  id: "3f2a9c1e-7b4d-4e8a-9f10-2c5d6e7f8a01",
  title: "우유 사기",
  completed: false,
  createdAt: "2026-10-23T09:30:00.000Z",
};

describe("TodoItem", () => {
  test("CMP-20 미완료 할 일의 체크박스를 누르면 onToggle(id, true)가 호출된다", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(
      <TodoItem todo={todo} isPending={false} onToggle={onToggle} onDelete={jest.fn()} />,
    );

    await user.click(screen.getByRole("checkbox", { name: "우유 사기" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(todo.id, true);
  });

  test("CMP-21 완료된 할 일의 체크박스를 누르면 onToggle(id, false)가 호출된다", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const completedTodo: Todo = { ...todo, completed: true };
    render(
      <TodoItem
        todo={completedTodo}
        isPending={false}
        onToggle={onToggle}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "우유 사기" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(todo.id, false);
  });

  test("CMP-22 삭제 버튼을 누르면 onDelete(id)가 호출된다", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(
      <TodoItem todo={todo} isPending={false} onToggle={jest.fn()} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole("button", { name: "우유 사기 삭제" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(todo.id);
  });

  test("CMP-23 isPending이 true면 체크박스와 삭제 버튼이 비활성이고 눌러도 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    render(
      <TodoItem todo={todo} isPending={true} onToggle={onToggle} onDelete={onDelete} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "우유 사기" });
    const deleteButton = screen.getByRole("button", { name: "우유 사기 삭제" });
    expect(checkbox).toBeDisabled();
    expect(deleteButton).toBeDisabled();

    await user.click(checkbox);
    await user.click(deleteButton);

    expect(onToggle).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
