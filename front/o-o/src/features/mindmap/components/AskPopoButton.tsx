import AskPopoIcon from '@/shared/assets/images/AskPopo.webp';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRestructureMindmapMutation } from '../hooks/mutation/useRestructureMindmapMutation';
import { useToast } from '@/shared/ui/ToastProvider';
import { useLoadingStore } from '@/shared/store/loadingStore';

interface AskPopoProps {
  workspaceId: string;
}

export default function AskPopo({ workspaceId }: AskPopoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  const { mutate, isPending } = useRestructureMindmapMutation(workspaceId);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);

  const handleOrganize = () => {
    setIsLoading(true); // 전체 화면 로딩 시작
    mutate(undefined, {
      onSuccess: () => {
        // 성공 시에는 로딩을 끄지 않음 - WebSocket restructure_apply 메시지가 오면 자동으로 꺼짐
        showToast('아이디어가 정리되었습니다!', 'success');
        setIsOpen(false);
      },
      onError: (error) => {
        setIsLoading(false); // 에러 시에는 즉시 로딩 종료
        console.error('Restructure failed:', error);
        showToast('정리에 실패했습니다. 다시 시도해주세요.', 'error');
      },
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <img
          src={AskPopoIcon}
          alt="Ask Popo"
          className="cursor-pointer hover:opacity-80 transition-opacity w-20"
        />
      </PopoverTrigger>

      <PopoverContent
        className="w-[320px] p-6 bg-white rounded-2xl shadow-2xl"
        align="end"
        side="top"
        alignOffset={5} sideOffset={10}
      >
        <div className="space-y-4">
          {/* 헤더 */}
          <h2 className="text-2xl font-bold text-primary font-paperlogy">
            Ask Popo
          </h2>

          {/* 설명 */}
          <p className="font-paperlogy text-gray-600 text-sm leading-relaxed">
            Popo가 유사한 아이디어를 자동으로<br />
            병합하고 정리합니다.
          </p>

          {/* 정리하기 버튼 */}
          <Button
            onClick={handleOrganize}
            disabled={isPending}
            className="w-full hover:bg-primary text-white font-medium py-6 rounded-xl"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                정리 중...
              </>
            ) : (
              '정리하기'
            )}
          </Button>

        </div>
      </PopoverContent>
    </Popover>
  );
}