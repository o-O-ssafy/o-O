import 'package:freezed_annotation/freezed_annotation.dart';

part 'recording_state.freezed.dart';

/// 녹음 상태
@freezed
class RecordingState with _$RecordingState {
  /// 초기 상태
  const factory RecordingState.initial() = RecordingInitial;

  /// 녹음 중
  const factory RecordingState.recording({
    @Default('') String recognizedText,
  }) = RecordingInProgress;

  /// 녹음 일시정지
  const factory RecordingState.paused({
    @Default('') String recognizedText,
  }) = RecordingPaused;

  /// 녹음 중지
  const factory RecordingState.stopped({
    required String recognizedText,
  }) = RecordingStopped;

  /// 에러
  const factory RecordingState.error({required String message}) = RecordingError;
}
