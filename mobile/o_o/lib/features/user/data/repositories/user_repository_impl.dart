import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/user_api_data_source.dart';

/// User Repository Implementation
class UserRepositoryImpl implements UserRepository {
  final UserApiDataSource apiDataSource;

  UserRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Failure, UserEntity>> getUserInfo() async {
    try {
      final model = await apiDataSource.getUserInfo();
      final entity = model.toEntity();
      return Right(entity);
    } on ServerException catch (e) {
      logger.e('❌ ServerException in repository: ${e.message}');
      return Left(ServerFailure(e.message));
    } catch (e) {
      logger.e('❌ Unexpected error in repository: $e');
      return Left(ServerFailure('Unexpected error: $e'));
    }
  }
}
