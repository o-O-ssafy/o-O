import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_workspaces.dart';
import 'workspace_event.dart';
import 'workspace_state.dart';

/// Workspace BLoC
class WorkspaceBloc extends Bloc<WorkspaceEvent, WorkspaceState> {
  final GetWorkspaces getWorkspaces;

  WorkspaceBloc({required this.getWorkspaces})
      : super(const WorkspaceState.initial()) {
    on<WorkspaceLoadEvent>(_onLoad);
    on<WorkspaceRefreshEvent>(_onRefresh);
    on<WorkspaceLoadMoreEvent>(_onLoadMore);
  }

  Future<void> _onLoad(
    WorkspaceLoadEvent event,
    Emitter<WorkspaceState> emit,
  ) async {
    emit(const WorkspaceState.loading());

    final result = await getWorkspaces(const WorkspaceParams());

    result.fold(
      (failure) => emit(const WorkspaceState.error(message: '워크스페이스를 불러올 수 없습니다')),
      (response) => emit(WorkspaceState.loaded(
        workspaces: response.workspaces,
        hasNext: response.hasNext,
        nextCursor: response.nextCursor,
      )),
    );
  }

  Future<void> _onRefresh(
    WorkspaceRefreshEvent event,
    Emitter<WorkspaceState> emit,
  ) async {
    // Refresh는 loading 상태 없이 바로 로드
    final result = await getWorkspaces(const WorkspaceParams());

    result.fold(
      (failure) => emit(const WorkspaceState.error(message: '워크스페이스를 불러올 수 없습니다')),
      (response) => emit(WorkspaceState.loaded(
        workspaces: response.workspaces,
        hasNext: response.hasNext,
        nextCursor: response.nextCursor,
      )),
    );
  }

  Future<void> _onLoadMore(
    WorkspaceLoadMoreEvent event,
    Emitter<WorkspaceState> emit,
  ) async {
    final currentState = state;

    // loaded 상태일 때만 loadMore 가능
    if (currentState is! WorkspaceLoaded) return;

    // 더 이상 불러올 데이터가 없으면 return
    if (!currentState.hasNext) return;

    // cursor가 없으면 return
    if (currentState.nextCursor == null) return;

    // 현재 데이터를 유지하면서 loadingMore 상태로 전환
    emit(WorkspaceState.loadingMore(workspaces: currentState.workspaces));

    final result = await getWorkspaces(WorkspaceParams(cursor: currentState.nextCursor));

    result.fold(
      (failure) {
        // 에러 발생 시 이전 loaded 상태로 복원
        emit(WorkspaceState.loaded(
          workspaces: currentState.workspaces,
          hasNext: currentState.hasNext,
          nextCursor: currentState.nextCursor,
        ));
      },
      (response) {
        // 기존 데이터에 새 데이터 추가
        final updatedWorkspaces = [...currentState.workspaces, ...response.workspaces];
        emit(WorkspaceState.loaded(
          workspaces: updatedWorkspaces,
          hasNext: response.hasNext,
          nextCursor: response.nextCursor,
        ));
      },
    );
  }
}
