import 'package:equatable/equatable.dart';

import 'workspace.dart';

/// Workspace Response Entity (for pagination)
class WorkspaceResponse extends Equatable {
  final List<Workspace> workspaces;
  final int? nextCursor;
  final bool hasNext;

  const WorkspaceResponse({
    required this.workspaces,
    this.nextCursor,
    required this.hasNext,
  });

  @override
  List<Object?> get props => [workspaces, nextCursor, hasNext];
}
