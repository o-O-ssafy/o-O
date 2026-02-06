import 'package:flutter/material.dart';
import '../../domain/entities/mindmap.dart';
import '../../domain/entities/mindmap_edge.dart';

/// 마인드맵 엣지(연결선)를 그리는 CustomPainter
class MindmapEdgePainter extends CustomPainter {
  final Mindmap mindmap;

  MindmapEdgePainter({required this.mindmap});

  @override
  void paint(Canvas canvas, Size size) {
    for (final edge in mindmap.edges) {
      _drawEdge(canvas, edge);
    }
  }

  void _drawEdge(Canvas canvas, MindmapEdge edge) {
    final fromNode = mindmap.getNodeById(edge.fromNodeId);
    final toNode = mindmap.getNodeById(edge.toNodeId);

    if (fromNode == null || toNode == null) return;

    final paint = Paint()
      ..color = edge.color.withOpacity(0.3)
      ..strokeWidth = edge.strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // 각 노드의 중심을 직선으로 연결
    final start = fromNode.center;
    final end = toNode.center;

    canvas.drawLine(start, end, paint);
  }

  @override
  bool shouldRepaint(covariant MindmapEdgePainter oldDelegate) {
    return oldDelegate.mindmap != mindmap;
  }
}
