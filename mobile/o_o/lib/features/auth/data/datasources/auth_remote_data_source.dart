import 'dart:io';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';

/// Google Sign-In을 통한 인증 데이터 소스
///
/// Google Sign-In SDK를 사용하여 ID Token을 발급받습니다.
abstract class AuthRemoteDataSource {
  /// 구글 로그인 후 ID Token 발급
  ///
  /// Returns: ID Token string
  /// Throws: [ServerException] 로그인 실패 시
  Future<Map<String, dynamic>> signInWithGoogle();

  /// 로그아웃
  Future<void> signOut();

  /// 현재 로그인된 사용자 정보
  Future<Map<String, dynamic>?> getCurrentUser();

  /// 로그인 상태 스트림
  Stream<Map<String, dynamic>?> get authStateChanges;
}

/// AuthRemoteDataSource의 실제 구현
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final GoogleSignIn _googleSignIn;

  AuthRemoteDataSourceImpl({GoogleSignIn? googleSignIn})
      : _googleSignIn = googleSignIn ??
            GoogleSignIn(
              scopes: [
                'email',
                'profile',
                // 'nickname'
              ],
              // iOS에서는 clientID를 명시적으로 설정해야 함
              clientId: Platform.isIOS
                  ? dotenv.env['GOOGLE_IOS_CLIENT_ID']
                  : null,
              // Android에서만 백엔드 인증을 위해 serverClientId 사용
              serverClientId: Platform.isAndroid
                  ? dotenv.env['GOOGLE_WEB_CLIENT_ID']
                  : null,
            );

  @override
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      // Google Sign-In 시작
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        // 사용자가 로그인을 취소한 경우
        throw const ServerException('로그인이 취소되었습니다.');
      }

      // Google Sign-In 인증 정보 가져오기
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // ID Token 확인
      final String? idToken = googleAuth.idToken;
      if (idToken == null) {
        throw const ServerException('ID Token을 가져올 수 없습니다.');
      }

      // ID Token 로깅
      logger.i('🔑 Google Sign-In 성공!');
      logger.i('📧 Email: ${googleUser.email}');
      logger.i('👤 Name: ${googleUser.displayName}');
      logger.i('🎫 ID Token: $idToken');
      logger.i('🔐 Access Token: ${googleAuth.accessToken}');

      // 사용자 정보와 ID Token 반환
      return {
        'id': googleUser.id,
        'email': googleUser.email,
        'name': googleUser.displayName ?? '',
        'photoUrl': googleUser.photoUrl,
        'idToken': idToken,
        'accessToken': googleAuth.accessToken,
        'provider': 'google',
      };
    } catch (e) {
      if (e is ServerException) {
        rethrow;
      }
      throw ServerException(
        '구글 로그인 실패: ${e.toString()}',
      );
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (e) {
      throw ServerException(
        '로그아웃 실패: ${e.toString()}',
      );
    }
  }

  @override
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final GoogleSignInAccount? currentUser = _googleSignIn.currentUser;

      if (currentUser == null) {
        // 자동 로그인 시도
        final GoogleSignInAccount? googleUser =
            await _googleSignIn.signInSilently();

        if (googleUser == null) {
          return null;
        }

        final GoogleSignInAuthentication googleAuth =
            await googleUser.authentication;

        return {
          'id': googleUser.id,
          'email': googleUser.email,
          'name': googleUser.displayName ?? '',
          'photoUrl': googleUser.photoUrl,
          'idToken': googleAuth.idToken,
          'accessToken': googleAuth.accessToken,
          'provider': 'google',
        };
      }

      final GoogleSignInAuthentication googleAuth =
          await currentUser.authentication;

      return {
        'id': currentUser.id,
        'email': currentUser.email,
        'name': currentUser.displayName ?? '',
        'photoUrl': currentUser.photoUrl,
        'idToken': googleAuth.idToken,
        'accessToken': googleAuth.accessToken,
        'provider': 'google',
      };
    } catch (e) {
      throw ServerException(
        '현재 사용자 조회 실패: ${e.toString()}',
      );
    }
  }

  @override
  Stream<Map<String, dynamic>?> get authStateChanges {
    return _googleSignIn.onCurrentUserChanged.asyncMap((googleUser) async {
      if (googleUser == null) {
        return null;
      }

      try {
        final GoogleSignInAuthentication googleAuth =
            await googleUser.authentication;

        return {
          'id': googleUser.id,
          'email': googleUser.email,
          'name': googleUser.displayName ?? '',
          'photoUrl': googleUser.photoUrl,
          'idToken': googleAuth.idToken,
          'accessToken': googleAuth.accessToken,
          'provider': 'google',
        };
      } catch (e) {
        return null;
      }
    });
  }
}
