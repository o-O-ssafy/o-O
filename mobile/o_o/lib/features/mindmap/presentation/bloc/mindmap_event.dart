import 'package:freezed_annotation/freezed_annotation.dart';

part 'mindmap_event.freezed.dart';

/// Mindmap BLoC Event
@freezed
class MindmapEvent with _$MindmapEvent {
  /// 마인드맵 로드
  const factory MindmapEvent.loadMindmap({
    required int workspaceId,
  }) = LoadMindmapEvent;

  /// 마인드맵 새로고침
  const factory MindmapEvent.refreshMindmap({
    required int workspaceId,
  }) = RefreshMindmapEvent;

  /// STT 텍스트로 마인드맵 생성
  const factory MindmapEvent.createMindmapFromText({
    required String text,
  }) = CreateMindmapFromTextEvent;
}
