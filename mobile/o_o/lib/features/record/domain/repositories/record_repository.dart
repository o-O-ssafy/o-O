import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/record_entity.dart';

/// Record repository interface
abstract class RecordRepository {
  /// 모든 녹음 기록 조회
  Future<Either<Failure, List<RecordEntity>>> getRecords();

  /// 특정 녹음 기록 조회
  Future<Either<Failure, RecordEntity>> getRecord(int id);

  /// 녹음 기록 삭제
  Future<Either<Failure, void>> deleteRecord(int id);
}
