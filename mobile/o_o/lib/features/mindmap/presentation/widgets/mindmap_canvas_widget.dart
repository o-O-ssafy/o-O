import 'package:flutter/material.dart';
import '../../domain/entities/mindmap.dart';
import '../../domain/entities/mindmap_node.dart';
import 'mindmap_edge_painter.dart';
import 'mindmap_node_widget.dart';

/// 마인드맵 캔버스 위젯
///
/// 마인드맵의 노드와 엣지를 모두 렌더링합니다.
class MindmapCanvasWidget extends StatefulWidget {
  final Mindmap mindmap;

  /// 캔버스를 이미지로 캡쳐하기 위한 GlobalKey (선택사항)
  final GlobalKey? repaintKey;

  const MindmapCanvasWidget({
    super.key,
    required this.mindmap,
    this.repaintKey,
  });

  @override
  State<MindmapCanvasWidget> createState() => _MindmapCanvasWidgetState();
}

class _MindmapCanvasWidgetState extends State<MindmapCanvasWidget> {
  /// 현재 확장된 노드 ID (확장된 노드를 최상위에 배치하기 위해)
  String? _expandedNodeId;

  @override
  Widget build(BuildContext context) {
    // 캔버스 크기를 계산
    final canvasSize = _calculateCanvasSize(context);

    // 확장되지 않은 노드들
    final normalNodes = widget.mindmap.nodes.where((node) => node.id != _expandedNodeId).toList();

    // 확장된 노드 (있는 경우)
    final expandedNode = _expandedNodeId != null
        ? widget.mindmap.nodes.firstWhere(
            (node) => node.id == _expandedNodeId,
            orElse: () => widget.mindmap.nodes.first,
          )
        : null;

    final canvasWidget = SizedBox(
      width: canvasSize.width,
      height: canvasSize.height,
      child: Stack(
        children: [
          // 엣지(연결선) 그리기
          CustomPaint(
            size: canvasSize,
            painter: MindmapEdgePainter(mindmap: widget.mindmap),
          ),
          // 일반 노드들 배치
          ...normalNodes.map(
            (node) => MindmapNodeWidget(
              key: ValueKey(node.id),
              node: node,
              onTap: () {
                debugPrint('Node tapped: ${node.text}');
              },
              onExpansionChanged: (isExpanded) {
                setState(() {
                  _expandedNodeId = isExpanded ? node.id : null;
                });
              },
            ),
          ),
          // 확장된 노드를 맨 위에 배치
          if (expandedNode != null)
            MindmapNodeWidget(
              key: ValueKey(expandedNode.id),
              node: expandedNode,
              onTap: () {
                debugPrint('Node tapped: ${expandedNode.text}');
              },
              onExpansionChanged: (isExpanded) {
                setState(() {
                  _expandedNodeId = isExpanded ? expandedNode.id : null;
                });
              },
            ),
        ],
      ),
    );

    // repaintKey가 있으면 RepaintBoundary로 래핑하여 캡쳐 가능하게 함
    return widget.repaintKey != null
        ? RepaintBoundary(
            key: widget.repaintKey,
            child: canvasWidget,
          )
        : canvasWidget;
  }

  /// 캔버스 크기 계산
  Size _calculateCanvasSize(BuildContext context) {
    if (widget.mindmap.nodes.isEmpty) {
      return const Size(5000, 5000);
    }

    // 모든 노드를 포함하는 bounding box 계산
    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = double.negativeInfinity;
    double maxY = double.negativeInfinity;

    for (final node in widget.mindmap.nodes) {
      final nodeLeft = node.position.dx - node.width / 2;
      final nodeTop = node.position.dy - node.height / 2;
      final nodeRight = node.position.dx + node.width / 2;
      final nodeBottom = node.position.dy + node.height / 2;

      if (nodeLeft < minX) minX = nodeLeft;
      if (nodeTop < minY) minY = nodeTop;
      if (nodeRight > maxX) maxX = nodeRight;
      if (nodeBottom > maxY) maxY = nodeBottom;
    }

    // 여유 공간 추가
    final padding = 1000.0;
    final width = maxX - minX + padding * 2;
    final height = maxY - minY + padding * 2;

    // 최소 크기 보장 (자동 배치는 (2500, 2500) 중심이므로 최소 5000x5000 필요)
    final minSize = 5000.0;
    return Size(
      width < minSize ? minSize : width,
      height < minSize ? minSize : height,
    );
  }
}
