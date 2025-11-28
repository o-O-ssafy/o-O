import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getWorkspace } from '@/services/workspaceService';
import type { WorkspaceDetailDTO } from '@/services/dto/workspace.dto';

interface UseWorkspaceAccessQueryResult {
  workspace: WorkspaceDetailDTO | undefined;
  hasAccess: boolean;
  isLoading: boolean;
  isError: boolean;
}

/**
 * 워크스페이스 접근 권한을 확인하는 훅
 *
 * - PUBLIC 워크스페이스는 누구나 접근 가능
 * - PRIVATE 워크스페이스는 역할(MAINTAINER, EDIT, VIEW)이 있어야 접근 가능
 * - 접근 권한이 없거나 워크스페이스가 존재하지 않으면 홈으로 리다이렉트
 *
 * @param workspaceId - 확인할 워크스페이스 ID
 * @returns 워크스페이스 정보, 접근 권한 여부, 로딩/에러 상태
 */
export function useWorkspaceAccessQuery(
  workspaceId: string,
): UseWorkspaceAccessQueryResult {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    retry: false, // 403/404 시 재시도하지 않음
    enabled: !!workspaceId && workspaceId !== 'undefined', // workspaceId가 유효할 때만 쿼리 실행
  });

  // 접근 권한 확인 로직
  // PUBLIC 워크스페이스이거나, 유효한 역할이 있으면 접근 가능
  const hasAccess =
    query.data?.visibility === 'PUBLIC' ||
    ['MAINTAINER', 'EDIT', 'VIEW'].includes(query.data?.myRole ?? '');

  useEffect(() => {
    if (query.isError) {
      // 네트워크 에러, 404, 403 등 - 홈으로 리다이렉트
      navigate('/', { replace: true });
    } else if (query.data && !hasAccess) {
      // 워크스페이스는 존재하지만 접근 권한 없음
      navigate('/', { replace: true });
    }
  }, [query.isError, query.data, hasAccess, navigate]);

  return {
    workspace: query.data,
    hasAccess,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
