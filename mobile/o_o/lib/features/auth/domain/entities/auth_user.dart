import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_user.freezed.dart';

/// 인증된 사용자 엔티티
///
/// 로그인 후 사용자 정보를 담는 엔티티입니다.
@freezed
class AuthUser with _$AuthUser {
  const factory AuthUser({
    required String id,
    required String email,
    required String name,
    String? photoUrl,
    required String provider, // 'google', 'kakao', 'apple' etc.
  }) = _AuthUser;

  const AuthUser._();

  /// 사용자 이니셜 (프로필 이미지 없을 때 사용)
  String get initials {
    final names = name.split(' ');
    if (names.length >= 2) {
      return '${names[0][0]}${names[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}
