import 'package:freezed_annotation/freezed_annotation.dart';

part 'mindmap_creation_response.freezed.dart';
part 'mindmap_creation_response.g.dart';

/// 마인드맵 생성 응답
@freezed
class MindmapCreationResponse with _$MindmapCreationResponse {
  const factory MindmapCreationResponse({
    required int workspaceId,
    required int nodeId,
    required String keyword,
    String? memo,
    required String analysisStatus,
    required String message,
  }) = _MindmapCreationResponse;

  factory MindmapCreationResponse.fromJson(Map<String, dynamic> json) =>
      _$MindmapCreationResponseFromJson(json);
}
