import { useCallback } from 'react';
import type { GptNodeSuggestion } from '../../../workspace/types/voice.types';
import type { NodeData } from '../../types';
import { useColorTheme } from '../useColorTheme';
import { useNodePositioning } from '../useNodePositioning';
import { useAppSelector } from '@/store/hooks';
import type { WorkspaceTheme } from '@/services/dto/workspace.dto';

interface YjsCRUD {
  create: (node: NodeData) => void;
  read: (id: string) => NodeData | undefined;
}

export function useGptNodeCreator(crud: YjsCRUD | null, workspaceId: string, nodes: NodeData[] = [], workspaceTheme: WorkspaceTheme = "PASTEL") {
  const { getRandomThemeColor } = useColorTheme(workspaceTheme);
  const { findNonOverlappingPosition } = useNodePositioning();
  const currentUser = useAppSelector((state) => state.user.user);

  const createNodesFromGpt = useCallback(
    (suggestions: GptNodeSuggestion[]) => {
      if (!crud) {
        return [];
      }

      const createdNodeIds: string[] = [];
      const timestamp = Date.now();

      suggestions.forEach((suggestion, index) => {
        // Include userId to ensure unique IDs across different clients
        const nodeId = `gpt-${currentUser?.id || 'unknown'}-${timestamp}-${index}`;
        createdNodeIds.push(nodeId);

        // 부모 노드 찾기
        let parentNode: NodeData | undefined;
        if (suggestion.parentId && suggestion.parentId !== '0') {
          parentNode = crud.read(suggestion.parentId);

          // parentId로 찾지 못한 경우 nodes 배열에서 직접 검색
          if (!parentNode) {
            parentNode = nodes.find(n => n.id === suggestion.parentId);
          }
        }

        // 위치 계산
        let baseX = 0;
        let baseY = 0;

        if (parentNode && typeof parentNode.x === 'number' && typeof parentNode.y === 'number') {
          // 부모 노드 주변에 배치 (방사형)
          const angle = (Math.PI * 2 / suggestions.length) * index;
          const distance = 220;
          baseX = parentNode.x + Math.cos(angle) * distance;
          baseY = parentNode.y + Math.sin(angle) * distance;
        } else {
          // 부모가 없거나 찾지 못한 경우: 기존 노드들 근처에 배치
          if (nodes.length > 0) {
            // 기존 노드들의 중심점 계산
            const validNodes = nodes.filter(n => typeof n.x === 'number' && typeof n.y === 'number');
            if (validNodes.length > 0) {
              const centerX = validNodes.reduce((sum, n) => sum + (n.x || 0), 0) / validNodes.length;
              const centerY = validNodes.reduce((sum, n) => sum + (n.y || 0), 0) / validNodes.length;

              // 중심점에서 방사형으로 배치
              const angle = (Math.PI * 2 / suggestions.length) * index;
              const distance = 300;
              baseX = centerX + Math.cos(angle) * distance;
              baseY = centerY + Math.sin(angle) * distance;
            } else {
              // 노드는 있지만 좌표가 없는 경우 - 화면 중앙(2500, 2500) 기준
              const offsetX = (index - Math.floor(suggestions.length / 2)) * 250;
              baseX = 2500 + offsetX;
              baseY = 2500;
            }
          } else {
            // 첫 노드인 경우 - 화면 중앙(2500, 2500) 기준
            const offsetX = (index - Math.floor(suggestions.length / 2)) * 250;
            baseX = 2500 + offsetX;
            baseY = 2500;
          }
        }

        // 겹침 방지
        const position = findNonOverlappingPosition(nodes, baseX, baseY);

        // 노드 생성
        const color = getRandomThemeColor();
        const newNode: NodeData = {
          id: nodeId,
          keyword: suggestion.keyword,
          memo: suggestion.memo,
          x: position.x,
          y: position.y,
          color,
          parentId: suggestion.parentId || '0',
          type: 'text',
          analysisStatus: 'DONE',
          createdAt: new Date().toISOString(),
        };

        crud.create(newNode);
      });

      return createdNodeIds;
    },
    [crud, nodes, getRandomThemeColor, findNonOverlappingPosition, currentUser]
  );

  return { createNodesFromGpt };
}
