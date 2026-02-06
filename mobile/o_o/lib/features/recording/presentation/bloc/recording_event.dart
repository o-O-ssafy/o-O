import 'package:freezed_annotation/freezed_annotation.dart';

part 'recording_event.freezed.dart';

/// 녹음 이벤트
@freezed
class RecordingEvent with _$RecordingEvent {
  /// 녹음 시작
  const factory RecordingEvent.start() = RecordingStart;

  /// 녹음 일시정지
  const factory RecordingEvent.pause() = RecordingPause;

  /// 녹음 재개
  const factory RecordingEvent.resume() = RecordingResume;

  /// 녹음 종료
  const factory RecordingEvent.stop() = RecordingStop;

  /// 녹음 토글 (시작/종료)
  const factory RecordingEvent.toggle() = RecordingToggle;

  /// 텍스트 업데이트 (실시간)
  const factory RecordingEvent.updateText(String text) = RecordingUpdateText;
}
