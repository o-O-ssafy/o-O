// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mindmap_node_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MindmapNodeModelImpl _$$MindmapNodeModelImplFromJson(
  Map<String, dynamic> json,
) => _$MindmapNodeModelImpl(
  id: json['id'] as String,
  nodeId: (json['nodeId'] as num).toInt(),
  workspaceId: (json['workspaceId'] as num).toInt(),
  parentId: (json['parentId'] as num?)?.toInt(),
  type: json['type'] as String,
  keyword: json['keyword'] as String,
  memo: json['memo'] as String?,
  analysisStatus: json['analysisStatus'] as String,
  x: (json['x'] as num?)?.toDouble(),
  y: (json['y'] as num?)?.toDouble(),
  color: json['color'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$$MindmapNodeModelImplToJson(
  _$MindmapNodeModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'nodeId': instance.nodeId,
  'workspaceId': instance.workspaceId,
  'parentId': instance.parentId,
  'type': instance.type,
  'keyword': instance.keyword,
  'memo': instance.memo,
  'analysisStatus': instance.analysisStatus,
  'x': instance.x,
  'y': instance.y,
  'color': instance.color,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};
