import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/mindmap.dart';
import '../repositories/mindmap_repository.dart';

/// Get Mindmap Nodes UseCase
class GetMindmapNodes {
  final MindmapRepository repository;

  GetMindmapNodes(this.repository);

  Future<Either<Failure, Mindmap>> call(int workspaceId) async {
    return await repository.getMindmapByWorkspaceId(workspaceId);
  }
}
