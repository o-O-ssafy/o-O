import 'package:freezed_annotation/freezed_annotation.dart';

// 1. part 파일 선언 - build_runner가 생성할 파일들
part 'user_entity.freezed.dart';

/// User entity using Freezed
/// Freezed를 사용하면 불변 클래스와 copyWith, equals, toString 등이 자동 생성됩니다
@freezed
class UserEntity with _$UserEntity {
  const factory UserEntity({
    required String email,
    required String nickname,
    required String profileImage,
  }) = _UserEntity;

  // Custom methods는 private constructor 아래에 추가 가능
  const UserEntity._();

  // 커스텀 getter 예제
  String get displayName => nickname.isEmpty ? email : nickname;
}
