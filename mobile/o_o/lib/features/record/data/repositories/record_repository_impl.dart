import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/record_entity.dart';
import '../../domain/repositories/record_repository.dart';
import '../datasources/record_api_data_source.dart';

/// Record Repository Implementation
class RecordRepositoryImpl implements RecordRepository {
  final RecordApiDataSource apiDataSource;

  RecordRepositoryImpl({
    required this.apiDataSource,
  });

  @override
  Future<Either<Failure, List<RecordEntity>>> getRecords() async {
    try {
      logger.i('🔄 RecordRepositoryImpl: Fetching records...');

      final records = await apiDataSource.getRecords();
      final entities = records.map((model) => model.toEntity()).toList();

      logger.i('✅ RecordRepositoryImpl: Successfully fetched ${entities.length} records');
      return Right(entities);
    } on ServerException catch (e) {
      logger.e('❌ RecordRepositoryImpl: ServerException - ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ RecordRepositoryImpl: Unexpected error - $e');
      return Left(ServerFailure('Failed to fetch records: $e'));
    }
  }

  @override
  Future<Either<Failure, RecordEntity>> getRecord(int id) async {
    try {
      logger.i('🔄 RecordRepositoryImpl: Fetching record with id: $id');

      // TODO: 개별 record 조회 API 구현 필요
      // 현재는 전체 목록에서 찾기
      final records = await apiDataSource.getRecords();
      final record = records.firstWhere(
        (r) => r.id == id,
        orElse: () => throw ServerException('Record not found'),
      );

      logger.i('✅ RecordRepositoryImpl: Successfully fetched record with id: $id');
      return Right(record.toEntity());
    } on ServerException catch (e) {
      logger.e('❌ RecordRepositoryImpl: ServerException - ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ RecordRepositoryImpl: Unexpected error - $e');
      return Left(ServerFailure('Failed to fetch record: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> deleteRecord(int id) async {
    try {
      logger.i('🔄 RecordRepositoryImpl: Deleting record with id: $id');

      // TODO: 삭제 API 구현 필요
      logger.w('⚠️ Delete API not implemented yet');

      return const Right(null);
    } on ServerException catch (e) {
      logger.e('❌ RecordRepositoryImpl: ServerException - ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ RecordRepositoryImpl: Unexpected error - $e');
      return Left(ServerFailure('Failed to delete record: $e'));
    }
  }
}
