import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/user_repository.dart';

/// Get User Info UseCase
class GetUserInfo implements UseCase<UserEntity, NoParams> {
  final UserRepository repository;

  GetUserInfo(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(NoParams params) async {
    return await repository.getUserInfo();
  }
}
