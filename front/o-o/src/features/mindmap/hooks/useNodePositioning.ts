import { useCallback } from "react";
import type { NodeData } from "../types";

/**
 * 노드 위치 계산 및 겹침 방지 hook
 */
export function useNodePositioning() {
  /**
   * 부모 노드 근처에서 빈 공간 찾기
   * @param nodes 기존 노드 배열
   * @param preferredX 선호하는 X 좌표 (부모 근처)
   * @param preferredY 선호하는 Y 좌표 (부모 근처)
   * @param minDistance 최소 거리
   * @returns 부모 근처의 빈 공간 좌표
   */
  const findEmptySpace = useCallback(
    (nodes: NodeData[], preferredX: number, preferredY: number, minDistance: number = 180): { x: number; y: number } => {
      if (nodes.length === 0) {
        return { x: preferredX, y: preferredY };
      }

      // 위치가 겹치는지 확인
      const isPositionClear = (x: number, y: number): boolean => {
        for (const node of nodes) {
          const dx = x - (node.x ?? 0);
          const dy = y - (node.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            return false;
          }
        }
        return true;
      };

      // 1단계: 선호 위치 주변 근거리 후보들 (부모 노드 근처 우선)
      const nearbyDistances = [0, 30, 60, 90, 120, 150];
      const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

      for (const distance of nearbyDistances) {
        for (const angleDeg of angles) {
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = preferredX + distance * Math.cos(angleRad);
          const y = preferredY + distance * Math.sin(angleRad);

          if (isPositionClear(x, y)) {
            return { x, y };
          }
        }
      }

      // 2단계: 나선형 탐색 (부모 근처에서 점진적으로 멀어짐)
      const radiusStep = 40;
      const maxRadius = 400; // 부모에서 너무 멀어지지 않게 제한

      for (let radius = minDistance; radius <= maxRadius; radius += radiusStep) {
        const numAngles = Math.max(16, Math.floor((2 * Math.PI * radius) / 80));

        for (let i = 0; i < numAngles; i++) {
          const angle = (i * 2 * Math.PI) / numAngles;
          const x = preferredX + radius * Math.cos(angle);
          const y = preferredY + radius * Math.sin(angle);

          if (isPositionClear(x, y)) {
            return { x, y };
          }
        }
      }

      // 최악의 경우: 선호 위치 반환
      return { x: preferredX, y: preferredY };
    },
    []
  );

  /**
   * 기존 노드들과 겹치지 않는 위치 찾기
   * @param nodes 기존 노드 배열
   * @param baseX 기준 X 좌표
   * @param baseY 기준 Y 좌표
   * @param minDistance 최소 거리 (기본값: 150)
   * @returns 겹치지 않는 {x, y} 좌표
   */
  const findNonOverlappingPosition = useCallback(
    (nodes: NodeData[], baseX: number, baseY: number, minDistance: number = 150): { x: number; y: number } => {
      if (nodes.length === 0) {
        return { x: baseX, y: baseY };
      }

      // 위치가 겹치는지 확인하는 헬퍼 함수
      const isPositionClear = (x: number, y: number): boolean => {
        for (const node of nodes) {
          const dx = x - (node.x ?? 0);
          const dy = y - (node.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            return false;
          }
        }
        return true;
      };

      // 1단계: 초기 후보 위치들 (더 많은 방향과 거리 조합)
      const distances = [180, 220, 260];
      const angles = [0, 45, 90, 135, 180, 225, 270, 315]; // 8방향

      const candidates: Array<{ x: number; y: number }> = [
        { x: baseX, y: baseY }, // 원래 위치
      ];

      // 각 거리와 방향 조합으로 후보 생성
      for (const distance of distances) {
        for (const angleDeg of angles) {
          const angleRad = (angleDeg * Math.PI) / 180;
          candidates.push({
            x: baseX + distance * Math.cos(angleRad),
            y: baseY + distance * Math.sin(angleRad),
          });
        }
      }

      // 후보 위치 중 겹치지 않는 첫 번째 위치 반환
      for (const candidate of candidates) {
        if (isPositionClear(candidate.x, candidate.y)) {
          return candidate;
        }
      }

      // 2단계: 나선형 탐색 (더 촘촘하고 넓은 범위)
      const angleStep = Math.PI / 6; // 30도씩 (더 촘촘하게)
      const radiusStep = 60; // 더 작은 간격
      const maxRadius = 1200; // 더 넓은 범위

      for (let radius = minDistance; radius <= maxRadius; radius += radiusStep) {
        const anglesInRing = Math.max(12, Math.floor((2 * Math.PI * radius) / 100)); // 반지름에 비례하여 각도 수 증가

        for (let i = 0; i < anglesInRing; i++) {
          const angle = (i * 2 * Math.PI) / anglesInRing;
          const candidate = {
            x: baseX + radius * Math.cos(angle),
            y: baseY + radius * Math.sin(angle),
          };

          if (isPositionClear(candidate.x, candidate.y)) {
            return candidate;
          }
        }
      }

      // 최악의 경우: 랜덤 오프셋 추가하여 겹치지 않도록
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomRadius = minDistance + Math.random() * 200;
      return {
        x: baseX + randomRadius * Math.cos(randomAngle),
        y: baseY + randomRadius * Math.sin(randomAngle),
      };
    },
    []
  );

  return {
    findNonOverlappingPosition,
    findEmptySpace,
  };
}
