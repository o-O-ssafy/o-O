import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../models/user_model.dart';

/// User API Data Source
abstract class UserApiDataSource {
  /// Get current user info
  Future<UserModel> getUserInfo();
}

/// User API Data Source Implementation
class UserApiDataSourceImpl implements UserApiDataSource {
  final Dio dio;

  UserApiDataSourceImpl({required this.dio});

  @override
  Future<UserModel> getUserInfo() async {
    try {
      logger.i('📡 Fetching user info from ${ApiConstants.getUsers}');

      final response = await dio.get(ApiConstants.getUsers);

      if (response.statusCode == 200) {
        final userModel = UserModel.fromJson(response.data as Map<String, dynamic>);
        logger.i('✅ User info fetched: ${userModel.nickname}');
        return userModel;
      } else {
        logger.e('❌ Failed to fetch user info: ${response.statusCode}');
        throw ServerException('Failed to fetch user info: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      throw ServerException('Failed to fetch user info: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch user info: $e');
    }
  }
}
