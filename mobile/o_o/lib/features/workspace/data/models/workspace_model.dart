import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/workspace.dart';

part 'workspace_model.freezed.dart';
part 'workspace_model.g.dart';

@freezed
class WorkspaceModel with _$WorkspaceModel {
  const WorkspaceModel._();

  const factory WorkspaceModel({
    required int id,
    required String title,
    required String visibility,
    @JsonKey(name: 'createdAt') required DateTime createdAt,
    String? thumbnail,
    String? startPrompt,
  }) = _WorkspaceModel;

  factory WorkspaceModel.fromJson(Map<String, dynamic> json) =>
      _$WorkspaceModelFromJson(json);

  /// Convert to Entity
  Workspace toEntity() {
    return Workspace(
      id: id,
      title: title,
      visibility: visibility,
      createdAt: createdAt,
      thumbnail: thumbnail,
      startPrompt: startPrompt,
    );
  }

  /// Convert from Entity
  factory WorkspaceModel.fromEntity(Workspace entity) {
    return WorkspaceModel(
      id: entity.id,
      title: entity.title,
      visibility: entity.visibility,
      createdAt: entity.createdAt,
      thumbnail: entity.thumbnail,
      startPrompt: entity.startPrompt,
    );
  }
}
