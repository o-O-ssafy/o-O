import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/workspace_response.dart';
import '../repositories/workspace_repository.dart';

/// Workspace Params
class WorkspaceParams extends Equatable {
  final int? cursor;

  const WorkspaceParams({this.cursor});

  @override
  List<Object?> get props => [cursor];
}

/// Get Workspaces UseCase
class GetWorkspaces implements UseCase<WorkspaceResponse, WorkspaceParams> {
  final WorkspaceRepository repository;

  GetWorkspaces(this.repository);

  @override
  Future<Either<Failure, WorkspaceResponse>> call(WorkspaceParams params) async {
    return await repository.getWorkspaces(cursor: params.cursor);
  }
}
