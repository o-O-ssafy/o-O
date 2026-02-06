import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/workspace_calendar_entity.dart';

part 'workspace_calendar_model.freezed.dart';
part 'workspace_calendar_model.g.dart';

/// Workspace Calendar Model (일일 활동 응답)
@freezed
class WorkspaceCalendarModel with _$WorkspaceCalendarModel {
  const WorkspaceCalendarModel._();

  const factory WorkspaceCalendarModel({
    required List<String> keywords,
  }) = _WorkspaceCalendarModel;

  factory WorkspaceCalendarModel.fromJson(Map<String, dynamic> json) =>
      _$WorkspaceCalendarModelFromJson(json);

  /// Convert to Entity
  WorkspaceCalendarEntity toEntity() {
    return WorkspaceCalendarEntity(
      keywords: keywords,
    );
  }
}
