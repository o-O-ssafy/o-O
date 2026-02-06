import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../../../../core/utils/platform_utils.dart';

/// 백엔드 API와 통신하는 Auth DataSource
abstract class AuthApiDataSource {
  /// 백엔드에 ID Token 전송하여 인증
  ///
  /// Returns: {
  ///   'userId': int,
  ///   'accessToken': String,
  ///   'refreshToken': String,
  /// }
  Future<Map<String, dynamic>> authenticateWithBackend(String idToken);
}

class AuthApiDataSourceImpl implements AuthApiDataSource {
  final Dio dio;

  AuthApiDataSourceImpl({Dio? dio})
      : dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: ApiConstants.baseUrl,
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
                headers: {
                  'Content-Type': 'application/json',
                },
              ),
            );

  @override
  Future<Map<String, dynamic>> authenticateWithBackend(String idToken) async {
    try {
      final platform = PlatformUtils.getPlatform();

      logger.i('🌐 백엔드 인증 시작...');
      logger.i('📍 Platform: $platform');
      logger.i('🎫 ID Token: ${idToken.substring(0, 50)}...');

      final response = await dio.post(
        ApiConstants.googleLogin,
        data: {
          'idToken': idToken,
          'platform': platform,
        },
      );

      logger.i('✅ 백엔드 인증 성공!');
      logger.i('📦 Response Status: ${response.statusCode}');

      // Response Body에서 userId 추출
      final userId = response.data['userId'];
      if (userId == null) {
        throw ServerException('userId가 응답에 포함되지 않았습니다.');
      }

      // Authorization 헤더에서 Access Token 추출
      final accessToken = response.headers.value('authorization');
      if (accessToken == null) {
        throw ServerException('Authorization 헤더가 응답에 포함되지 않았습니다.');
      }

      logger.i('🔑 Access Token: ${accessToken.substring(0, 50)}...');

      // Set-Cookie 헤더에서 Refresh Token 추출
      final setCookieHeader = response.headers.value('set-cookie');
      String? refreshToken;

      if (setCookieHeader != null) {
        // Set-Cookie 파싱: "refreshToken=value; Path=/; HttpOnly"
        final cookieParts = setCookieHeader.split(';');
        for (var part in cookieParts) {
          if (part.trim().startsWith('refreshToken=')) {
            refreshToken = part.trim().substring('refreshToken='.length);
            break;
          }
        }
      }

      if (refreshToken == null) {
        throw ServerException('Set-Cookie 헤더에서 Refresh Token을 찾을 수 없습니다.');
      }

      logger.i('🔄 Refresh Token: ${refreshToken.substring(0, 50)}...');
      logger.i('👤 User ID: $userId');

      return {
        'userId': userId,
        'accessToken': accessToken,
        'refreshToken': refreshToken,
      };
    } on DioException catch (e) {
      logger.e('❌ 백엔드 인증 실패: ${e.message}');
      if (e.response != null) {
        logger.e('📦 Response Data: ${e.response?.data}');
        throw ServerException(
          '백엔드 인증 실패: ${e.response?.data['message'] ?? e.message}',
        );
      }
      throw ServerException('백엔드 인증 실패: ${e.message}');
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      logger.e('❌ 예상치 못한 오류: $e');
      throw ServerException('백엔드 인증 중 오류 발생: $e');
    }
  }
}
