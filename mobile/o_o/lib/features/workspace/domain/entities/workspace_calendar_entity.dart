import 'package:equatable/equatable.dart';

/// Workspace Calendar Item Entity (구슬에 표시될 키워드)
class WorkspaceCalendarItem extends Equatable {
  final String keyword;

  const WorkspaceCalendarItem({
    required this.keyword,
  });

  @override
  List<Object?> get props => [keyword];
}

/// Workspace Calendar Entity (일일 활동 키워드 목록)
class WorkspaceCalendarEntity extends Equatable {
  final List<String> keywords;

  const WorkspaceCalendarEntity({
    required this.keywords,
  });

  @override
  List<Object?> get props => [keywords];
}
