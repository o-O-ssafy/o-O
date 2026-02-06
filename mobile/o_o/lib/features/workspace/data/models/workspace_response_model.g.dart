// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workspace_response_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WorkspaceResponseModelImpl _$$WorkspaceResponseModelImplFromJson(
  Map<String, dynamic> json,
) => _$WorkspaceResponseModelImpl(
  workspaces:
      (json['workspaces'] as List<dynamic>)
          .map((e) => WorkspaceModel.fromJson(e as Map<String, dynamic>))
          .toList(),
  nextCursor: (json['nextCursor'] as num?)?.toInt(),
  hasNext: json['hasNext'] as bool,
);

Map<String, dynamic> _$$WorkspaceResponseModelImplToJson(
  _$WorkspaceResponseModelImpl instance,
) => <String, dynamic>{
  'workspaces': instance.workspaces,
  'nextCursor': instance.nextCursor,
  'hasNext': instance.hasNext,
};
