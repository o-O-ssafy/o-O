import 'package:flutter/material.dart';

/// 마인드맵 엣지 (연결선)
///
/// 두 노드를 연결하는 선을 나타냅니다.
class MindmapEdge {
  /// 엣지 ID
  final String id;

  /// 시작 노드 ID
  final String fromNodeId;

  /// 끝 노드 ID
  final String toNodeId;

  /// 선 색상
  final Color color;

  /// 선 두께
  final double strokeWidth;

  const MindmapEdge({
    required this.id,
    required this.fromNodeId,
    required this.toNodeId,
    this.color = Colors.grey,
    this.strokeWidth = 2.0,
  });

  MindmapEdge copyWith({
    String? id,
    String? fromNodeId,
    String? toNodeId,
    Color? color,
    double? strokeWidth,
  }) {
    return MindmapEdge(
      id: id ?? this.id,
      fromNodeId: fromNodeId ?? this.fromNodeId,
      toNodeId: toNodeId ?? this.toNodeId,
      color: color ?? this.color,
      strokeWidth: strokeWidth ?? this.strokeWidth,
    );
  }
}
