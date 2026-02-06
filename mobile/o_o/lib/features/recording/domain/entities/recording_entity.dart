import 'package:freezed_annotation/freezed_annotation.dart';

part 'recording_entity.freezed.dart';

/// 녹음 상태 Entity
@freezed
class RecordingEntity with _$RecordingEntity {
  const factory RecordingEntity({
    required bool isRecording,
    String? filePath,
    Duration? duration,
  }) = _RecordingEntity;
}
