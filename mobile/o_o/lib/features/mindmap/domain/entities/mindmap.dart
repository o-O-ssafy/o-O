import 'mindmap_edge.dart';
import 'mindmap_node.dart';

/// 마인드맵
///
/// 전체 마인드맵 데이터를 나타냅니다.
class Mindmap {
  /// 마인드맵 ID
  final String id;

  /// 마인드맵 제목
  final String title;

  /// 노드 리스트
  final List<MindmapNode> nodes;

  /// 엣지 리스트
  final List<MindmapEdge> edges;

  /// 생성일시
  final DateTime createdAt;

  /// 원래 x, y, color가 null이었던 노드 ID 집합 (String 형식)
  final Set<String> nullNodeIds;

  const Mindmap({
    required this.id,
    required this.title,
    required this.nodes,
    required this.edges,
    required this.createdAt,
    this.nullNodeIds = const {},
  });

  /// ID로 노드를 찾습니다
  MindmapNode? getNodeById(String id) {
    try {
      return nodes.firstWhere((node) => node.id == id);
    } catch (e) {
      return null;
    }
  }

  /// 특정 노드의 자식 노드들을 반환합니다
  List<MindmapNode> getChildNodes(String nodeId) {
    final childEdges = edges.where((edge) => edge.fromNodeId == nodeId);
    return childEdges
        .map((edge) => getNodeById(edge.toNodeId))
        .whereType<MindmapNode>()
        .toList();
  }

  Mindmap copyWith({
    String? id,
    String? title,
    List<MindmapNode>? nodes,
    List<MindmapEdge>? edges,
    DateTime? createdAt,
    Set<String>? nullNodeIds,
  }) {
    return Mindmap(
      id: id ?? this.id,
      title: title ?? this.title,
      nodes: nodes ?? this.nodes,
      edges: edges ?? this.edges,
      createdAt: createdAt ?? this.createdAt,
      nullNodeIds: nullNodeIds ?? this.nullNodeIds,
    );
  }
}
