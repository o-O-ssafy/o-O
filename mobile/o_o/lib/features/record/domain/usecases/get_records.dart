import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/record_entity.dart';
import '../repositories/record_repository.dart';

/// 모든 녹음 기록을 가져오는 UseCase
class GetRecords implements UseCase<List<RecordEntity>, NoParams> {
  final RecordRepository repository;

  GetRecords(this.repository);

  @override
  Future<Either<Failure, List<RecordEntity>>> call(NoParams params) async {
    return await repository.getRecords();
  }
}
