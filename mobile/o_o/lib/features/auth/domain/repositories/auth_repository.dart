import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/auth_user.dart';

/// 인증 Repository 인터페이스
abstract class AuthRepository {
  /// 구글 로그인
  Future<Either<Failure, AuthUser>> signInWithGoogle();

  /// 로그아웃
  Future<Either<Failure, void>> signOut();

  /// 현재 로그인된 사용자 가져오기
  Future<Either<Failure, AuthUser?>> getCurrentUser();

  /// 저장된 토큰이 있는지 확인 (자동 로그인용)
  Future<Either<Failure, bool>> hasValidToken();

  /// 로그인 상태 스트림
  Stream<AuthUser?> get authStateChanges;
}
