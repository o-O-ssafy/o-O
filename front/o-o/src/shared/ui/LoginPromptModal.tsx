import Modal from "./Modal";

interface LoginPromptModelProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function LoginPromptModel({
  isOpen,
  onClose,
}: LoginPromptModelProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2
        className="font-semibold text-gray-900 text-center mb-1"
        style={{
          fontSize: "clamp(18px, 2.5vw, 28px)",
        }}
      >
        아이디어 생성을 위해 로그인해주세요.
      </h2>

      <button
        onClick={onClose}
        className="w-full bg-gray-100 hover:bg-gray-200 text-[#6F6F6F] font-size rounded-lg transition-colors"
        style={{
          fontSize: "clamp(14px, 1.8vw, 24px)",
          padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem)",
        }}
      >
        둘러보기
      </button>
    </Modal>
  );
}
