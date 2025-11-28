import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { RootState } from "@/store/store";
import { resetPathExceptParent } from "@/store/slices/trendPathSlice";
import { useAppSelector } from "@/store/hooks";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";
import { useDrawerDimensions } from "../../../hooks/custom/useDrawerDimensions";
import { DrawerToggleButton } from "./DrawerToggleButton";
import { KeywordButton } from "../Drawer/KeywordButton";
import { ImportToMindmapButton } from "./ImportToMindmapButton";

export interface Keyword {
  readonly id: number;
  readonly keyword: string;
}

interface DrawerButtonProps {
  readonly onOpenModal: () => void;
}

export function DrawerButton({ onOpenModal }: DrawerButtonProps) {
  const { trendId } = useParams<{ trendId: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const { drawerHeight, buttonBottom } = useDrawerDimensions(isOpen);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux에서 경로 가져오기
  const visitPath = useSelector(
    (state: RootState) => state.trendPath.visitPath
  );

  // 로그인 상태 확인
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  const handleImportToMindmap = () => {
    console.log("handleImportToMindmap 호출됨!");

    // 비회원이면 로그인 안내
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다. 로그인 후 이용해주세요.");
      return;
    }

    onOpenModal();
  };

  // 경로에 있는 키워드 클릭 핸들러
  const handlePathKeywordClick = (keyword: string) => {
    // 해당 키워드로 네비게이트
    navigate(`/trend/${encodeURIComponent(keyword)}`);

    // 드로어 닫기
    setIsOpen(false);
  };

  // 경로 리셋 핸들러 - 현재 부모만 남기기
  const handleResetPath = () => {
    if (trendId) {
      const parentKeyword = decodeURIComponent(trendId);
      dispatch(resetPathExceptParent(parentKeyword));
    }
  };

  return (
    <div className="relative">
      <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DrawerTrigger asChild>
          <DrawerToggleButton isOpen={isOpen} buttonBottom={buttonBottom} />
        </DrawerTrigger>

        <DrawerContent className={drawerHeight}>
          <div className="w-full max-w-full h-full flex flex-col px-2 sm:px-4 md:px-6">
            {/* 드래그 핸들 */}
            <div className="mx-auto w-8 sm:w-10 md:w-12 h-1 flex-shrink-0 rounded-full bg-gray-300 mb-2 cursor-grab active:cursor-grabbing" />

            {/* 컨텐츠 영역: 스크롤 + 버튼 */}
            <div className="flex-1 flex gap-3 overflow-hidden">
              {/* 가로 스크롤 영역 - visitPath 표시 */}
              <div className="flex-1 overflow-hidden">
                <CustomScrollbar maxWidth="100%" direction="horizontal">
                  <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3 pr-2 items-center">
                    {visitPath.length > 0 ? (
                      visitPath.map((keyword: string, index: number) => (
                        <div
                          key={`${keyword}-${index}`}
                          onClick={() => handlePathKeywordClick(keyword)}
                          className="cursor-pointer"
                        >
                          <KeywordButton keyword={keyword} index={index} />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm whitespace-nowrap">
                        노드를 선택하면 경로가 표시됩니다
                      </p>
                    )}
                  </div>
                </CustomScrollbar>
              </div>

              {/* 리셋 버튼 + 마인드맵 가져오기 버튼 */}
              <div className="flex items-center gap-2 pb-3">
                {visitPath.length > 1 && (
                  <button
                    onClick={handleResetPath}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors whitespace-nowrap"
                    title="경로를 현재 노드만 남기고 초기화"
                  >
                    리셋
                  </button>
                )}
                <ImportToMindmapButton onClick={handleImportToMindmap} />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
