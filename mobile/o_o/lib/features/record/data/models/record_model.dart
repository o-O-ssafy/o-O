import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/record_entity.dart';

part 'record_model.freezed.dart';
part 'record_model.g.dart';

/// Record model using Freezed + JSON Serialization
@freezed
class RecordModel with _$RecordModel {
  const factory RecordModel({
    required int id,
    required String title,
    required String visibility,
    required DateTime createdAt,
    String? thumbnail,
    String? startPrompt,
  }) = _RecordModel;

  factory RecordModel.fromJson(Map<String, dynamic> json) =>
      _$RecordModelFromJson(json);

  const RecordModel._();

  /// Entity로 변환
  RecordEntity toEntity() {
    return RecordEntity(
      id: id,
      title: title,
      startPrompt: startPrompt,
      createdAt: createdAt,
      thumbnail: thumbnail,
      visibility: visibility,
      mindmapId: id, // workspace id를 mindmapId로 사용
    );
  }

  /// Entity에서 Model로 변환
  factory RecordModel.fromEntity(RecordEntity entity) {
    return RecordModel(
      id: entity.id,
      title: entity.title,
      startPrompt: entity.startPrompt,
      createdAt: entity.createdAt,
      thumbnail: entity.thumbnail,
      visibility: entity.visibility ?? 'PUBLIC',
    );
  }
}
