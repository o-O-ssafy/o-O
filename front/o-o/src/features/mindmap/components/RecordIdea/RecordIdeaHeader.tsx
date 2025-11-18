import popo1 from "@/shared/assets/images/organize_real_popo.webp";

export function RecordIdeaHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end pt-1">
        <img src={popo1} alt="포포 캐릭터" className="w-14" />
      </div>
      <div className="text-[10px] text-primary pl-2">
        <p>아이디어를 놓치지 않게</p>
        <p><span className="font-bold">Popo</span>가 정리해드려요.</p>
      </div>
    </div>
  );
}
