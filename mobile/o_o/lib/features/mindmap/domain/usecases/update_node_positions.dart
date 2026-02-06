import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../entities/mindmap_node.dart';
import '../repositories/mindmap_repository.dart';

/// Update Node Positions UseCase
class UpdateNodePositions {
  final MindmapRepository repository;

  UpdateNodePositions(this.repository);

  Future<Either<Failure, void>> call(UpdateNodePositionsParams params) async {
    return await repository.updateNodePositions(
      params.workspaceId,
      params.nodes,
    );
  }
}

/// Update Node Positions Params
class UpdateNodePositionsParams extends Equatable {
  final int workspaceId;
  final List<MindmapNode> nodes;

  const UpdateNodePositionsParams({
    required this.workspaceId,
    required this.nodes,
  });

  @override
  List<Object?> get props => [workspaceId, nodes];
}
