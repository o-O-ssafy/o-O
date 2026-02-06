import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_event.freezed.dart';

/// Auth Events
@freezed
class AuthEvent with _$AuthEvent {
  /// 구글 로그인 시도
  const factory AuthEvent.signInWithGoogle() = AuthSignInWithGoogle;

  /// 로그아웃
  const factory AuthEvent.signOut() = AuthSignOut;

  /// 현재 로그인 상태 확인
  const factory AuthEvent.checkAuthStatus() = AuthCheckStatus;
}
