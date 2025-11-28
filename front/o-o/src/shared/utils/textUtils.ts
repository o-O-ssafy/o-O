import React from "react";

/**
 * 자식 노드 중 읽을 수 있는 텍스트가 있는지 확인
 * 빈 헤딩 등을 방지하기 위한 유틸리티 함수 (S6850)
 */
export function hasReadableText(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    if (typeof child === "number") return true;
    // 링크/이모지/인라인요소 등은 스크린리더가 읽을 수 있으므로 존재만으로 true 처리
    if (React.isValidElement(child)) return true;
    return false;
  });
}
