import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/workspace.dart';

part 'workspace_state.freezed.dart';

@freezed
class WorkspaceState with _$WorkspaceState {
  const factory WorkspaceState.initial() = WorkspaceInitial;
  const factory WorkspaceState.loading() = WorkspaceLoading;
  const factory WorkspaceState.loaded({
    required List<Workspace> workspaces,
    required bool hasNext,
    int? nextCursor,
  }) = WorkspaceLoaded;
  const factory WorkspaceState.loadingMore({required List<Workspace> workspaces}) = WorkspaceLoadingMore;
  const factory WorkspaceState.error({required String message}) = WorkspaceError;
}
