import 'dart:async';

import 'package:dartz/dartz.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_api_data_source.dart';
import '../datasources/auth_local_data_source.dart';
import '../datasources/auth_remote_data_source.dart';

/// AuthRepository의 실제 구현
///
/// Google Sign-In SDK를 사용하여 인증을 처리하고,
/// 백엔드 API와 통신하여 토큰을 받아 저장합니다.
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthApiDataSource apiDataSource;
  final AuthLocalDataSource localDataSource;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.apiDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, AuthUser>> signInWithGoogle() async {
    try {
      // 1. Google Sign-In으로 ID Token 받기
      logger.i('🚀 Step 1: Google Sign-In 시작');
      final googleResult = await remoteDataSource.signInWithGoogle();
      final idToken = googleResult['idToken'] as String;

      // 2. 백엔드 API에 ID Token 전송
      logger.i('🚀 Step 2: 백엔드 인증 시작');
      final backendResult = await apiDataSource.authenticateWithBackend(idToken);

      // 3. 토큰 저장
      logger.i('🚀 Step 3: 토큰 저장 시작');
      await localDataSource.saveAccessToken(backendResult['accessToken']);
      await localDataSource.saveRefreshToken(backendResult['refreshToken']);
      await localDataSource.saveUserId(backendResult['userId']);

      logger.i('✅ 로그인 완료!');
      logger.i('💾 저장된 Access Token: ${backendResult['accessToken'].toString().substring(0, 50)}...');
      logger.i('💾 저장된 Refresh Token: ${backendResult['refreshToken'].toString()}...');
      logger.i('💾 저장된 User ID: ${backendResult['userId']}');

      // 4. AuthUser 반환
      final user = AuthUser(
        id: googleResult['id'] as String,
        email: googleResult['email'] as String,
        name: googleResult['name'] as String,
        photoUrl: googleResult['photoUrl'] as String?,
        provider: googleResult['provider'] as String,
      );

      return Right(user);
    } on ServerException catch (e) {
      logger.e('❌ 로그인 실패: ${e.message}');

      // 백엔드 인증 실패 시 Google Sign-Out 처리
      try {
        await remoteDataSource.signOut();
        logger.i('🔄 Google Sign-Out 처리 완료');
      } catch (signOutError) {
        logger.e('⚠️ Google Sign-Out 실패: $signOutError');
      }

      return Left(ServerFailure(e.message));
    } on CacheException catch (e) {
      logger.e('❌ 토큰 저장 실패: ${e.message}');

      // 토큰 저장 실패 시에도 Google Sign-Out
      try {
        await remoteDataSource.signOut();
        logger.i('🔄 Google Sign-Out 처리 완료');
      } catch (signOutError) {
        logger.e('⚠️ Google Sign-Out 실패: $signOutError');
      }

      return Left(CacheFailure(e.message));
    } catch (e) {
      logger.e('❌ 알 수 없는 오류: $e');

      // 알 수 없는 오류 시에도 Google Sign-Out
      try {
        await remoteDataSource.signOut();
        logger.i('🔄 Google Sign-Out 처리 완료');
      } catch (signOutError) {
        logger.e('⚠️ Google Sign-Out 실패: $signOutError');
      }

      return Left(ServerFailure('알 수 없는 오류가 발생했습니다: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> signOut() async {
    try {
      // 1. Google Sign-Out
      await remoteDataSource.signOut();

      // 2. 로컬 토큰 삭제
      await localDataSource.clearTokens();

      logger.i('✅ 로그아웃 완료!');
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('로그아웃 실패: $e'));
    }
  }

  @override
  Future<Either<Failure, AuthUser?>> getCurrentUser() async {
    try {
      final result = await remoteDataSource.getCurrentUser();

      if (result == null) {
        return const Right(null);
      }

      // Map을 AuthUser로 변환
      final user = AuthUser(
        id: result['id'] as String,
        email: result['email'] as String,
        name: result['name'] as String,
        photoUrl: result['photoUrl'] as String?,
        provider: result['provider'] as String,
      );

      return Right(user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('사용자 정보 조회 실패: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> hasValidToken() async {
    try {
      // SecureStorage에서 AccessToken 확인
      final accessToken = await localDataSource.getAccessToken();
      final userId = await localDataSource.getUserId();

      // AccessToken과 UserId가 모두 있으면 로그인 상태로 판단
      final hasToken = accessToken != null &&
                       accessToken.isNotEmpty &&
                       userId != null;

      logger.i('🔍 자동 로그인 체크: ${hasToken ? "토큰 있음" : "토큰 없음"}');

      return Right(hasToken);
    } on CacheException catch (e) {
      logger.e('❌ 토큰 확인 실패: ${e.message}');
      return Left(CacheFailure(e.message));
    } catch (e) {
      logger.e('❌ 알 수 없는 오류: $e');
      return Left(CacheFailure('토큰 확인 실패: $e'));
    }
  }

  @override
  Stream<AuthUser?> get authStateChanges {
    return remoteDataSource.authStateChanges.map((data) {
      if (data == null) {
        return null;
      }

      return AuthUser(
        id: data['id'] as String,
        email: data['email'] as String,
        name: data['name'] as String,
        photoUrl: data['photoUrl'] as String?,
        provider: data['provider'] as String,
      );
    });
  }
}
