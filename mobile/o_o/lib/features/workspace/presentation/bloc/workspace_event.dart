import 'package:freezed_annotation/freezed_annotation.dart';

part 'workspace_event.freezed.dart';

@freezed
class WorkspaceEvent with _$WorkspaceEvent {
  const factory WorkspaceEvent.load() = WorkspaceLoadEvent;
  const factory WorkspaceEvent.refresh() = WorkspaceRefreshEvent;
  const factory WorkspaceEvent.loadMore() = WorkspaceLoadMoreEvent;
}
