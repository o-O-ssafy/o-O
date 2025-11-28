interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    // 배경 오버레이
    <div
      className="fixed inset-0 bg-[#B8B8B8]/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* 모달 컨텐츠 박스 */}
      <div
        className="bg-white rounded-2xl shadow-lg w-[80%] max-w-2xl"
        style={{
          padding: "clamp(1.5rem, 4vw, 3rem)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
