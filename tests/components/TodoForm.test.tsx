import { render, screen } from "@testing-library/react";
import TodoForm from "@/src/components/TodoForm";

describe("TodoForm", () => {
  test("CMP-01 화면에 그리면 '할 일' 입력창과 '추가' 버튼이 보인다", () => {
    render(
      <TodoForm
        onAdd={jest.fn()}
        onTitleChange={jest.fn()}
        isSubmitting={false}
        errorMessage={null}
      />,
    );

    // 라벨 "할 일"로 입력창을 찾는다 (COMPONENT_SPEC 6장)
    expect(screen.getByLabelText("할 일")).toBeInTheDocument();
    // 이름이 "추가"인 버튼을 찾는다
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
  });
});
