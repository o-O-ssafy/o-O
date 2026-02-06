import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/workspace_response.dart';
import 'workspace_model.dart';

part 'workspace_response_model.freezed.dart';
part 'workspace_response_model.g.dart';

/// Paginated Workspace Response Model
@freezed
class WorkspaceResponseModel with _$WorkspaceResponseModel {
  const WorkspaceResponseModel._();

  const factory WorkspaceResponseModel({
    required List<WorkspaceModel> workspaces,
    required int? nextCursor,
    required bool hasNext,
  }) = _WorkspaceResponseModel;

  factory WorkspaceResponseModel.fromJson(Map<String, dynamic> json) =>
      _$WorkspaceResponseModelFromJson(json);

  /// Convert to Entity
  WorkspaceResponse toEntity() {
    return WorkspaceResponse(
      workspaces: workspaces.map((model) => model.toEntity()).toList(),
      nextCursor: nextCursor,
      hasNext: hasNext,
    );
  }
}
