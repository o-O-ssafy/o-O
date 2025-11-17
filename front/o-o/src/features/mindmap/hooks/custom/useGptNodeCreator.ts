import { useCallback } from 'react';
import type { GptNodeSuggestion } from '../../../workspace/types/voice.types';
import type { NodeData } from '../../types';
import { useColorTheme } from '../useColorTheme';
import { useNodePositioning } from '../useNodePositioning';

interface YjsCRUD {
  create: (node: NodeData) => void;
  read: (id: string) => NodeData | undefined;
}

export function useGptNodeCreator(crud: YjsCRUD | null, workspaceId: string, nodes: NodeData[] = []) {
  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition } = useNodePositioning();

  const createNodesFromGpt = useCallback(
    (suggestions: GptNodeSuggestion[]) => {
      if (!crud) {
        return [];
      }

      const createdNodeIds: string[] = [];

      suggestions.forEach((suggestion, index) => {
        const nodeId = `gpt-${Date.now()}-${index}`;
        createdNodeIds.push(nodeId);

        // 부모 노드 찾기
        let parentNode: NodeData | undefined;
        if (suggestion.parentId) {
          parentNode = crud.read(suggestion.parentId);
        }

        // 위치 계산
        let x = 0;
        let y = 0;

        if (parentNode) {
          // 부모 노드 주변에 배치 (방사형)
          const angle = (Math.PI * 2 / suggestions.length) * index;
          const distance = 200;
          x = parentNode.x + Math.cos(angle) * distance;
          y = parentNode.y + Math.sin(angle) * distance;
        } else {
          // 루트 노드 - 중앙에서 약간 떨어진 위치
          const offsetX = (index - Math.floor(suggestions.length / 2)) * 250;
          x = offsetX;
          y = 0;
        }

        // 겹침 방지
        const position = findNonOverlappingPosition(nodes, x, y);

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
    [crud, nodes, getRandomThemeColor, findNonOverlappingPosition]
  );

  return { createNodesFromGpt };
}
