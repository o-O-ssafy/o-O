import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../data/models/mindmap_creation_response.dart';
import '../entities/mindmap.dart';
import '../entities/mindmap_node.dart';

/// Mindmap Repository 인터페이스
abstract class MindmapRepository {
  /// 워크스페이스 ID로 마인드맵 조회
  Future<Either<Failure, Mindmap>> getMindmapByWorkspaceId(int workspaceId);

  /// STT 텍스트로 마인드맵 생성
  Future<Either<Failure, MindmapCreationResponse>> createMindmapFromText(String text);

  /// 노드 위치 일괄 업데이트
  Future<Either<Failure, void>> updateNodePositions(
    int workspaceId,
    List<MindmapNode> nodes,
  );
}
