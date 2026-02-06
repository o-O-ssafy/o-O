import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/record_entity.dart';

part 'record_state.freezed.dart';

/// Record BLoC State with Freezed
@freezed
class RecordState with _$RecordState {
  /// 초기 상태
  const factory RecordState.initial() = RecordInitial;

  /// 로딩 상태
  const factory RecordState.loading() = RecordLoading;

  /// 녹음 기록 리스트 로드 완료
  const factory RecordState.loaded({
    required List<RecordEntity> records,
  }) = RecordLoaded;

  /// 특정 녹음 기록 로드 완료
  const factory RecordState.detailLoaded({
    required RecordEntity record,
  }) = RecordDetailLoaded;

  /// 삭제 성공
  const factory RecordState.deleted() = RecordDeleted;

  /// 에러 상태
  const factory RecordState.error({
    required String message,
    String? errorCode,
  }) = RecordError;
}
