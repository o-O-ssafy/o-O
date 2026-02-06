import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/auth_user.dart';

part 'auth_state.freezed.dart';

/// Auth States
@freezed
class AuthState with _$AuthState {
  /// 초기 상태
  const factory AuthState.initial() = AuthInitial;

  /// 로그인 중
  const factory AuthState.loading() = AuthLoading;

  /// 인증됨 (로그인 완료)
  const factory AuthState.authenticated({
    required AuthUser user,
  }) = AuthAuthenticated;

  /// 인증 안됨 (로그아웃 상태)
  const factory AuthState.unauthenticated() = AuthUnauthenticated;

  /// 에러
  const factory AuthState.error({
    required String message,
  }) = AuthError;
}
