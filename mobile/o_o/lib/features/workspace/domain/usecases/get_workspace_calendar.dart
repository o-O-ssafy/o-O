import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/workspace_calendar_entity.dart';
import '../repositories/workspace_repository.dart';

/// Daily Activity Params
class DailyActivityParams extends Equatable {
  final String date;

  const DailyActivityParams({
    required this.date,
  });

  @override
  List<Object?> get props => [date];
}

/// Get Workspace Calendar UseCase (일일 활동 키워드)
class GetWorkspaceCalendar implements UseCase<WorkspaceCalendarEntity, DailyActivityParams> {
  final WorkspaceRepository repository;

  GetWorkspaceCalendar(this.repository);

  @override
  Future<Either<Failure, WorkspaceCalendarEntity>> call(DailyActivityParams params) async {
    return await repository.getDailyActivity(
      date: params.date,
    );
  }
}
