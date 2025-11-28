interface ProfileFormProps {
  readonly name: string;
  readonly email: string;
  readonly isEditing: boolean;
  readonly onNameChange: (name: string) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

export function ProfileForm({
  name,
  email,
  isEditing,
  onNameChange,
  onSave,
  onCancel,
}: ProfileFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className="block text-md font-medium mb-2">
          이름
          {isEditing && <span className="text-[#FF8B8B] ml-1">*</span>}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={!isEditing}
          maxLength={30}
          className={`w-full px-3 py-2 text-sm -m-3 text-deep-gray focus:outline-none ${
            isEditing
              ? "bg-[#E8E8E8] m-0 rounded-md"
              : "bg-white truncate pointer-events-none"
          } `}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-md font-medium mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled={true}
          className="m-w-full px-3 py-2 bg-white focus:outline-none text-sm -m-3 text-deep-gray truncate pointer-events-none"
        />
      </div>

      {isEditing && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[#E5E5E5] rounded-md hover:bg-gray-50 text-sm leading-none"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-4 py-0 bg-primary text-white rounded-md hover:bg-primary/90 text-sm leading-none"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
