// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'node_position_update_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$NodePositionItemImpl _$$NodePositionItemImplFromJson(
  Map<String, dynamic> json,
) => _$NodePositionItemImpl(
  nodeId: (json['nodeId'] as num).toInt(),
  x: (json['x'] as num).toDouble(),
  y: (json['y'] as num).toDouble(),
  color: json['color'] as String?,
);

Map<String, dynamic> _$$NodePositionItemImplToJson(
  _$NodePositionItemImpl instance,
) => <String, dynamic>{
  'nodeId': instance.nodeId,
  'x': instance.x,
  'y': instance.y,
  'color': instance.color,
};

_$NodePositionUpdateRequestImpl _$$NodePositionUpdateRequestImplFromJson(
  Map<String, dynamic> json,
) => _$NodePositionUpdateRequestImpl(
  positions:
      (json['positions'] as List<dynamic>)
          .map((e) => NodePositionItem.fromJson(e as Map<String, dynamic>))
          .toList(),
);

Map<String, dynamic> _$$NodePositionUpdateRequestImplToJson(
  _$NodePositionUpdateRequestImpl instance,
) => <String, dynamic>{'positions': instance.positions};
