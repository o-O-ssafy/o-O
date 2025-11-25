import 'dart:typed_data';

import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/workspace_repository.dart';

/// Upload Workspace Thumbnail UseCase
class UploadWorkspaceThumbnail implements UseCase<void, UploadWorkspaceThumbnailParams> {
  final WorkspaceRepository repository;

  UploadWorkspaceThumbnail(this.repository);

  @override
  Future<Either<Failure, void>> call(UploadWorkspaceThumbnailParams params) async {
    return await repository.uploadWorkspaceThumbnail(
      workspaceId: params.workspaceId,
      imageBytes: params.imageBytes,
    );
  }
}

/// Upload Workspace Thumbnail Params
class UploadWorkspaceThumbnailParams extends Equatable {
  final int workspaceId;
  final Uint8List imageBytes;

  const UploadWorkspaceThumbnailParams({
    required this.workspaceId,
    required this.imageBytes,
  });

  @override
  List<Object?> get props => [workspaceId, imageBytes];
}
