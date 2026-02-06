import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_response.freezed.dart';
part 'api_response.g.dart';

/// Freezed Union Type 예제
///
/// Union types를 사용하면 여러 상태를 타입 안전하게 표현할 수 있습니다.
/// when/map 메서드로 모든 케이스를 처리할 수 있습니다.
///
/// Generic 타입의 JSON 직렬화는 복잡하므로
/// 실제 사용 시 ApiResponse<UserModel> 형태로 사용하고
/// UserModel의 fromJson을 직접 호출하는 것을 권장합니다.
@freezed
class ApiResponse<T> with _$ApiResponse<T> {
  // 성공 상태
  const factory ApiResponse.success({required T data, String? message}) =
      ApiSuccess<T>;

  // 에러 상태
  const factory ApiResponse.error({
    required String message,
    int? statusCode,
    dynamic errorData,
  }) = ApiError<T>;

  // 로딩 상태
  const factory ApiResponse.loading() = ApiLoading<T>;
}

/// 다른 Union Type 예제 - 사용자 상태
@freezed
class UserStatus with _$UserStatus {
  const factory UserStatus.online() = UserOnline;

  const factory UserStatus.offline() = UserOffline;

  const factory UserStatus.away({required DateTime since}) = UserAway;

  const factory UserStatus.busy({String? customMessage}) = UserBusy;

  factory UserStatus.fromJson(Map<String, dynamic> json) =>
      _$UserStatusFromJson(json);
}

/// 복잡한 nested model 예제
@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String userId,
    required String username,
    required UserStatus status,
    @Default([]) List<String> tags,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    UserSettings? settings,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

/// Nested model 예제
@freezed
class UserSettings with _$UserSettings {
  const factory UserSettings({
    @Default(true) bool notifications,
    @Default('en') String language,
    @Default(ThemeMode.system) ThemeMode theme,
  }) = _UserSettings;

  factory UserSettings.fromJson(Map<String, dynamic> json) =>
      _$UserSettingsFromJson(json);
}

/// Enum with JSON serialization
enum ThemeMode {
  @JsonValue('light')
  light,
  @JsonValue('dark')
  dark,
  @JsonValue('system')
  system,
}
