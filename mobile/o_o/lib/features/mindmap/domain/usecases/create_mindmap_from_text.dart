import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../data/models/mindmap_creation_response.dart';
import '../repositories/mindmap_repository.dart';

/// Create Mindmap From Text UseCase
class CreateMindmapFromText {
  final MindmapRepository repository;

  CreateMindmapFromText(this.repository);

  Future<Either<Failure, MindmapCreationResponse>> call(String text) async {
    return await repository.createMindmapFromText(text);
  }
}
