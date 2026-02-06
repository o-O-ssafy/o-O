import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

/// User repository interface
abstract class UserRepository {
  /// Get current user info
  Future<Either<Failure, UserEntity>> getUserInfo();
}
