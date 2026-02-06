import 'package:freezed_annotation/freezed_annotation.dart';

part 'node_position_update_request.freezed.dart';
part 'node_position_update_request.g.dart';

/// 노드 위치 정보 아이템
@freezed
class NodePositionItem with _$NodePositionItem {
  const factory NodePositionItem({
    required int nodeId,
    required double x,
    required double y,
    String? color,
  }) = _NodePositionItem;

  factory NodePositionItem.fromJson(Map<String, dynamic> json) =>
      _$NodePositionItemFromJson(json);
}

/// 노드 위치 일괄 업데이트 요청
@freezed
class NodePositionUpdateRequest with _$NodePositionUpdateRequest {
  const factory NodePositionUpdateRequest({
    required List<NodePositionItem> positions,
  }) = _NodePositionUpdateRequest;

  factory NodePositionUpdateRequest.fromJson(Map<String, dynamic> json) =>
      _$NodePositionUpdateRequestFromJson(json);
}
