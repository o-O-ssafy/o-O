import 'package:freezed_annotation/freezed_annotation.dart';

part 'mindmap_creation_request.freezed.dart';
part 'mindmap_creation_request.g.dart';

/// STT 텍스트로 마인드맵 생성 요청
@freezed
class MindmapCreationRequest with _$MindmapCreationRequest {
  const factory MindmapCreationRequest({
    required String text,
  }) = _MindmapCreationRequest;

  factory MindmapCreationRequest.fromJson(Map<String, dynamic> json) =>
      _$MindmapCreationRequestFromJson(json);
}
