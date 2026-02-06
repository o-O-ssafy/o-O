import 'package:dio/dio.dart';

import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../constants/api_constants.dart';
import '../utils/app_logger.dart';

/// 인증 토큰을 자동으로 관리하는 Dio 인터셉터
///
/// 기능:
/// 1. 모든 요청에 AccessToken을 Authorization 헤더에 자동 추가
/// 2. 401 에러 발생 시 RefreshToken으로 토큰 재발급
/// 3. 재발급 성공 시 원래 요청 재시도
class AuthInterceptor extends Interceptor {
  final AuthLocalDataSource localDataSource;
  final Dio dio;

  AuthInterceptor({
    required this.localDataSource,
    required this.dio,
  });

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // 로그인 API는 토큰 없이 요청
    if (options.path.contains('/auth/login')) {
      return handler.next(options);
    }

    try {
      // SecureStorage에서 AccessToken 가져오기
      final accessToken = await localDataSource.getAccessToken();

      if (accessToken != null && accessToken.isNotEmpty) {
        // Authorization 헤더에 AccessToken 추가
        options.headers['Authorization'] = accessToken;
        logger.d('🔐 Authorization 헤더 추가: $accessToken');
      }
    } catch (e) {
      logger.e('❌ AccessToken 조회 실패: $e');
    }

    return handler.next(options);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // 401 Unauthorized 에러 처리
    if (err.response?.statusCode == 401) {
      logger.w('⚠️ 401 Unauthorized 발생!');
      logger.w('📍 요청 URL: ${err.requestOptions.uri}');
      logger.w('📍 요청 Method: ${err.requestOptions.method}');
      logger.w('📍 현재 헤더: ${err.requestOptions.headers}');
      logger.w('📍 응답 데이터: ${err.response?.data}');

      try {
        // 1. RefreshToken 가져오기
        final refreshToken = await localDataSource.getRefreshToken();

        logger.i('🔍 저장된 RefreshToken 확인 중...');
        if (refreshToken == null || refreshToken.isEmpty) {
          logger.e('❌ RefreshToken이 없습니다. 로그아웃 필요.');
          return handler.next(err);
        }

        logger.i('✅ RefreshToken 존재: ${refreshToken.substring(0, 20)}...');

        // 2. 토큰 재발급 API 호출
        logger.i('🔄 토큰 재발급 시도 시작...');
        final newTokens = await _refreshTokens(refreshToken);

        // 3. 새 토큰 저장
        await localDataSource.saveAccessToken(newTokens['accessToken']!);
        await localDataSource.saveRefreshToken(newTokens['refreshToken']!);

        logger.i('💾 새 토큰 저장 완료');
        logger.i('🔑 새 Access Token: ${newTokens['accessToken']!.substring(0, 30)}...');
        logger.i('🔄 새 Refresh Token: ${newTokens['refreshToken']!.substring(0, 30)}...');

        logger.i('✅ 토큰 재발급 성공!');

        // 4. 원래 요청 재시도
        logger.i('🔁 원래 요청 재시도: ${err.requestOptions.uri}');
        final options = err.requestOptions;
        options.headers['Authorization'] = newTokens['accessToken'];

        final response = await dio.fetch(options);
        logger.i('✅ 재시도 요청 성공!');
        return handler.resolve(response);
      } catch (e, stackTrace) {
        logger.e('❌ 토큰 재발급 실패: $e');
        logger.e('📍 StackTrace: $stackTrace');
        // 재발급 실패 시 로그아웃 처리 필요
        await localDataSource.clearTokens();
        logger.w('🗑️ 토큰 삭제 완료 - 로그아웃 필요');
        return handler.next(err);
      }
    }

    return handler.next(err);
  }

  /// 토큰 재발급 API 호출
  ///
  /// POST /auth/reissue
  /// Cookie: refreshToken=<refresh_token>
  ///
  /// Returns: {
  ///   'accessToken': String,
  ///   'refreshToken': String,
  /// }
  Future<Map<String, String>> _refreshTokens(String refreshToken) async {
    try {
      logger.i('🔄 토큰 재발급 API 호출 시작...');
      logger.i('📍 API URL: ${ApiConstants.baseUrl}${ApiConstants.reissue}');
      logger.i('📍 전송할 RefreshToken (앞 30자): ${refreshToken.substring(0, 30)}...');

      // 별도의 Dio 인스턴스로 재발급 요청 (무한 루프 방지)
      final refreshDio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'refreshToken=$refreshToken',
          },
        ),
      );

      logger.i('📤 POST 요청 전송 중...');
      final response = await refreshDio.post(ApiConstants.reissue);

      logger.i('✅ 토큰 재발급 응답 받음');
      logger.i('📍 응답 상태 코드: ${response.statusCode}');
      logger.i('📍 응답 헤더: ${response.headers}');
      logger.i('📍 응답 데이터: ${response.data}');

      // Authorization 헤더에서 새 Access Token 추출
      final newAccessToken = response.headers.value('authorization');
      logger.i('📍 Authorization 헤더 값: $newAccessToken');

      if (newAccessToken == null) {
        logger.e('❌ Authorization 헤더가 응답에 포함되지 않았습니다.');
        logger.e('📍 전체 응답 헤더: ${response.headers.map}');
        throw Exception('Authorization 헤더가 응답에 포함되지 않았습니다.');
      }

      // Set-Cookie 헤더에서 새 Refresh Token 추출
      final setCookieHeader = response.headers.value('set-cookie');
      logger.i('📍 Set-Cookie 헤더 값: $setCookieHeader');

      String? newRefreshToken;

      if (setCookieHeader != null) {
        final cookieParts = setCookieHeader.split(';');
        logger.i('📍 Cookie 파싱 중: $cookieParts');

        for (var part in cookieParts) {
          if (part.trim().startsWith('refreshToken=')) {
            newRefreshToken = part.trim().substring('refreshToken='.length);
            logger.i('✅ RefreshToken 파싱 성공: ${newRefreshToken.substring(0, 30)}...');
            break;
          }
        }
      }

      if (newRefreshToken == null) {
        logger.e('❌ Set-Cookie 헤더에서 Refresh Token을 찾을 수 없습니다.');
        logger.e('📍 Set-Cookie 전체 값: $setCookieHeader');
        throw Exception('Set-Cookie 헤더에서 Refresh Token을 찾을 수 없습니다.');
      }

      logger.i('🔑 새 Access Token (앞 30자): ${newAccessToken.substring(0, 30)}...');
      logger.i('🔄 새 Refresh Token (앞 30자): ${newRefreshToken.substring(0, 30)}...');

      return {
        'accessToken': newAccessToken,
        'refreshToken': newRefreshToken,
      };
    } on DioException catch (e) {
      logger.e('❌ [DioException] 토큰 재발급 API 호출 실패');
      logger.e('📍 상태 코드: ${e.response?.statusCode}');
      logger.e('📍 응답 데이터: ${e.response?.data}');
      logger.e('📍 응답 헤더: ${e.response?.headers}');
      logger.e('📍 에러 메시지: ${e.message}');
      logger.e('📍 에러 타입: ${e.type}');
      rethrow;
    } catch (e, stackTrace) {
      logger.e('❌ [Exception] 토큰 재발급 중 예외 발생: $e');
      logger.e('📍 StackTrace: $stackTrace');
      rethrow;
    }
  }
}
