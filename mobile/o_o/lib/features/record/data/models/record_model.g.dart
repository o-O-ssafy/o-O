// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'record_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecordModelImpl _$$RecordModelImplFromJson(Map<String, dynamic> json) =>
    _$RecordModelImpl(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String,
      visibility: json['visibility'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      thumbnail: json['thumbnail'] as String?,
      startPrompt: json['startPrompt'] as String?,
    );

Map<String, dynamic> _$$RecordModelImplToJson(_$RecordModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'visibility': instance.visibility,
      'createdAt': instance.createdAt.toIso8601String(),
      'thumbnail': instance.thumbnail,
      'startPrompt': instance.startPrompt,
    };
