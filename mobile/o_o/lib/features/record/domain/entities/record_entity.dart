import 'package:freezed_annotation/freezed_annotation.dart';

part 'record_entity.freezed.dart';

/// Record entity using Freezed
/// 녹음된 기록의 엔티티
@freezed
class RecordEntity with _$RecordEntity {
  const factory RecordEntity({
    required int id,
    required String title,
    String? startPrompt,
    required DateTime createdAt,
    String? thumbnail,
    String? visibility,
    int? mindmapId,
  }) = _RecordEntity;

  const RecordEntity._();

  /// 날짜를 포맷팅된 문자열로 반환
  String get formattedDate {
    return '${createdAt.year}.${createdAt.month.toString().padLeft(2, '0')}.${createdAt.day.toString().padLeft(2, '0')} ${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}';
  }
}
