// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mindmap_creation_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MindmapCreationResponseImpl _$$MindmapCreationResponseImplFromJson(
  Map<String, dynamic> json,
) => _$MindmapCreationResponseImpl(
  workspaceId: (json['workspaceId'] as num).toInt(),
  nodeId: (json['nodeId'] as num).toInt(),
  keyword: json['keyword'] as String,
  memo: json['memo'] as String?,
  analysisStatus: json['analysisStatus'] as String,
  message: json['message'] as String,
);

Map<String, dynamic> _$$MindmapCreationResponseImplToJson(
  _$MindmapCreationResponseImpl instance,
) => <String, dynamic>{
  'workspaceId': instance.workspaceId,
  'nodeId': instance.nodeId,
  'keyword': instance.keyword,
  'memo': instance.memo,
  'analysisStatus': instance.analysisStatus,
  'message': instance.message,
};
