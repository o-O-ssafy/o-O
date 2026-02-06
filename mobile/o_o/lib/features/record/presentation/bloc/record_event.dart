import 'package:freezed_annotation/freezed_annotation.dart';

part 'record_event.freezed.dart';

/// Record BLoC Event with Freezed
@freezed
class RecordEvent with _$RecordEvent {
  /// 모든 녹음 기록 조회
  const factory RecordEvent.getRecords() = GetRecordsEvent;

  /// 특정 녹음 기록 조회
  const factory RecordEvent.getRecord({
    required int id,
  }) = GetRecordEvent;

  /// 녹음 기록 삭제
  const factory RecordEvent.deleteRecord({
    required int id,
  }) = DeleteRecordEvent;

  /// 녹음 기록 새로고침
  const factory RecordEvent.refreshRecords() = RefreshRecordsEvent;
}
