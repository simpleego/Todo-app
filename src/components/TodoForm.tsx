// 제목 입력창과 "추가" 버튼 (COMPONENT_SPEC 3장)
export type TodoFormProps = {
  // 추가 요청. 앞뒤 공백을 지운 제목을 넘긴다. 성공하면 true, 실패하면 false
  onAdd: (title: string) => Promise<boolean>;
  // 입력창 글자가 바뀔 때 알린다
  onTitleChange: () => void;
  // 추가 요청 중이면 true
  isSubmitting: boolean;
  // 서버가 돌려준 에러 문구. 없으면 null
  errorMessage: string | null;
};

// 라벨과 입력창을 연결하는 id
const TITLE_INPUT_ID = "todo-title";

// Props는 다음 테스트(CMP-02~)에서 사용한다
export default function TodoForm(_props: TodoFormProps) {
  return (
    <div>
      <label htmlFor={TITLE_INPUT_ID}>할 일</label>
      <input id={TITLE_INPUT_ID} type="text" />
      <button type="button">추가</button>
    </div>
  );
}
