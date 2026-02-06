// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'api_response.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$ApiResponse<T> {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(T data, String? message) success,
    required TResult Function(
      String message,
      int? statusCode,
      dynamic errorData,
    )
    error,
    required TResult Function() loading,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(T data, String? message)? success,
    TResult? Function(String message, int? statusCode, dynamic errorData)?
    error,
    TResult? Function()? loading,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(T data, String? message)? success,
    TResult Function(String message, int? statusCode, dynamic errorData)? error,
    TResult Function()? loading,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(ApiSuccess<T> value) success,
    required TResult Function(ApiError<T> value) error,
    required TResult Function(ApiLoading<T> value) loading,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(ApiSuccess<T> value)? success,
    TResult? Function(ApiError<T> value)? error,
    TResult? Function(ApiLoading<T> value)? loading,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(ApiSuccess<T> value)? success,
    TResult Function(ApiError<T> value)? error,
    TResult Function(ApiLoading<T> value)? loading,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ApiResponseCopyWith<T, $Res> {
  factory $ApiResponseCopyWith(
    ApiResponse<T> value,
    $Res Function(ApiResponse<T>) then,
  ) = _$ApiResponseCopyWithImpl<T, $Res, ApiResponse<T>>;
}

/// @nodoc
class _$ApiResponseCopyWithImpl<T, $Res, $Val extends ApiResponse<T>>
    implements $ApiResponseCopyWith<T, $Res> {
  _$ApiResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$ApiSuccessImplCopyWith<T, $Res> {
  factory _$$ApiSuccessImplCopyWith(
    _$ApiSuccessImpl<T> value,
    $Res Function(_$ApiSuccessImpl<T>) then,
  ) = __$$ApiSuccessImplCopyWithImpl<T, $Res>;
  @useResult
  $Res call({T data, String? message});
}

/// @nodoc
class __$$ApiSuccessImplCopyWithImpl<T, $Res>
    extends _$ApiResponseCopyWithImpl<T, $Res, _$ApiSuccessImpl<T>>
    implements _$$ApiSuccessImplCopyWith<T, $Res> {
  __$$ApiSuccessImplCopyWithImpl(
    _$ApiSuccessImpl<T> _value,
    $Res Function(_$ApiSuccessImpl<T>) _then,
  ) : super(_value, _then);

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? data = freezed, Object? message = freezed}) {
    return _then(
      _$ApiSuccessImpl<T>(
        data:
            freezed == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                    as T,
        message:
            freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc

class _$ApiSuccessImpl<T> implements ApiSuccess<T> {
  const _$ApiSuccessImpl({required this.data, this.message});

  @override
  final T data;
  @override
  final String? message;

  @override
  String toString() {
    return 'ApiResponse<$T>.success(data: $data, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ApiSuccessImpl<T> &&
            const DeepCollectionEquality().equals(other.data, data) &&
            (identical(other.message, message) || other.message == message));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(data),
    message,
  );

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ApiSuccessImplCopyWith<T, _$ApiSuccessImpl<T>> get copyWith =>
      __$$ApiSuccessImplCopyWithImpl<T, _$ApiSuccessImpl<T>>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(T data, String? message) success,
    required TResult Function(
      String message,
      int? statusCode,
      dynamic errorData,
    )
    error,
    required TResult Function() loading,
  }) {
    return success(data, message);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(T data, String? message)? success,
    TResult? Function(String message, int? statusCode, dynamic errorData)?
    error,
    TResult? Function()? loading,
  }) {
    return success?.call(data, message);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(T data, String? message)? success,
    TResult Function(String message, int? statusCode, dynamic errorData)? error,
    TResult Function()? loading,
    required TResult orElse(),
  }) {
    if (success != null) {
      return success(data, message);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(ApiSuccess<T> value) success,
    required TResult Function(ApiError<T> value) error,
    required TResult Function(ApiLoading<T> value) loading,
  }) {
    return success(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(ApiSuccess<T> value)? success,
    TResult? Function(ApiError<T> value)? error,
    TResult? Function(ApiLoading<T> value)? loading,
  }) {
    return success?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(ApiSuccess<T> value)? success,
    TResult Function(ApiError<T> value)? error,
    TResult Function(ApiLoading<T> value)? loading,
    required TResult orElse(),
  }) {
    if (success != null) {
      return success(this);
    }
    return orElse();
  }
}

abstract class ApiSuccess<T> implements ApiResponse<T> {
  const factory ApiSuccess({required final T data, final String? message}) =
      _$ApiSuccessImpl<T>;

  T get data;
  String? get message;

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ApiSuccessImplCopyWith<T, _$ApiSuccessImpl<T>> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$ApiErrorImplCopyWith<T, $Res> {
  factory _$$ApiErrorImplCopyWith(
    _$ApiErrorImpl<T> value,
    $Res Function(_$ApiErrorImpl<T>) then,
  ) = __$$ApiErrorImplCopyWithImpl<T, $Res>;
  @useResult
  $Res call({String message, int? statusCode, dynamic errorData});
}

/// @nodoc
class __$$ApiErrorImplCopyWithImpl<T, $Res>
    extends _$ApiResponseCopyWithImpl<T, $Res, _$ApiErrorImpl<T>>
    implements _$$ApiErrorImplCopyWith<T, $Res> {
  __$$ApiErrorImplCopyWithImpl(
    _$ApiErrorImpl<T> _value,
    $Res Function(_$ApiErrorImpl<T>) _then,
  ) : super(_value, _then);

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? message = null,
    Object? statusCode = freezed,
    Object? errorData = freezed,
  }) {
    return _then(
      _$ApiErrorImpl<T>(
        message:
            null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String,
        statusCode:
            freezed == statusCode
                ? _value.statusCode
                : statusCode // ignore: cast_nullable_to_non_nullable
                    as int?,
        errorData:
            freezed == errorData
                ? _value.errorData
                : errorData // ignore: cast_nullable_to_non_nullable
                    as dynamic,
      ),
    );
  }
}

/// @nodoc

class _$ApiErrorImpl<T> implements ApiError<T> {
  const _$ApiErrorImpl({
    required this.message,
    this.statusCode,
    this.errorData,
  });

  @override
  final String message;
  @override
  final int? statusCode;
  @override
  final dynamic errorData;

  @override
  String toString() {
    return 'ApiResponse<$T>.error(message: $message, statusCode: $statusCode, errorData: $errorData)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ApiErrorImpl<T> &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.statusCode, statusCode) ||
                other.statusCode == statusCode) &&
            const DeepCollectionEquality().equals(other.errorData, errorData));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    message,
    statusCode,
    const DeepCollectionEquality().hash(errorData),
  );

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ApiErrorImplCopyWith<T, _$ApiErrorImpl<T>> get copyWith =>
      __$$ApiErrorImplCopyWithImpl<T, _$ApiErrorImpl<T>>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(T data, String? message) success,
    required TResult Function(
      String message,
      int? statusCode,
      dynamic errorData,
    )
    error,
    required TResult Function() loading,
  }) {
    return error(message, statusCode, errorData);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(T data, String? message)? success,
    TResult? Function(String message, int? statusCode, dynamic errorData)?
    error,
    TResult? Function()? loading,
  }) {
    return error?.call(message, statusCode, errorData);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(T data, String? message)? success,
    TResult Function(String message, int? statusCode, dynamic errorData)? error,
    TResult Function()? loading,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(message, statusCode, errorData);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(ApiSuccess<T> value) success,
    required TResult Function(ApiError<T> value) error,
    required TResult Function(ApiLoading<T> value) loading,
  }) {
    return error(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(ApiSuccess<T> value)? success,
    TResult? Function(ApiError<T> value)? error,
    TResult? Function(ApiLoading<T> value)? loading,
  }) {
    return error?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(ApiSuccess<T> value)? success,
    TResult Function(ApiError<T> value)? error,
    TResult Function(ApiLoading<T> value)? loading,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this);
    }
    return orElse();
  }
}

abstract class ApiError<T> implements ApiResponse<T> {
  const factory ApiError({
    required final String message,
    final int? statusCode,
    final dynamic errorData,
  }) = _$ApiErrorImpl<T>;

  String get message;
  int? get statusCode;
  dynamic get errorData;

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ApiErrorImplCopyWith<T, _$ApiErrorImpl<T>> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$ApiLoadingImplCopyWith<T, $Res> {
  factory _$$ApiLoadingImplCopyWith(
    _$ApiLoadingImpl<T> value,
    $Res Function(_$ApiLoadingImpl<T>) then,
  ) = __$$ApiLoadingImplCopyWithImpl<T, $Res>;
}

/// @nodoc
class __$$ApiLoadingImplCopyWithImpl<T, $Res>
    extends _$ApiResponseCopyWithImpl<T, $Res, _$ApiLoadingImpl<T>>
    implements _$$ApiLoadingImplCopyWith<T, $Res> {
  __$$ApiLoadingImplCopyWithImpl(
    _$ApiLoadingImpl<T> _value,
    $Res Function(_$ApiLoadingImpl<T>) _then,
  ) : super(_value, _then);

  /// Create a copy of ApiResponse
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$ApiLoadingImpl<T> implements ApiLoading<T> {
  const _$ApiLoadingImpl();

  @override
  String toString() {
    return 'ApiResponse<$T>.loading()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$ApiLoadingImpl<T>);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(T data, String? message) success,
    required TResult Function(
      String message,
      int? statusCode,
      dynamic errorData,
    )
    error,
    required TResult Function() loading,
  }) {
    return loading();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(T data, String? message)? success,
    TResult? Function(String message, int? statusCode, dynamic errorData)?
    error,
    TResult? Function()? loading,
  }) {
    return loading?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(T data, String? message)? success,
    TResult Function(String message, int? statusCode, dynamic errorData)? error,
    TResult Function()? loading,
    required TResult orElse(),
  }) {
    if (loading != null) {
      return loading();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(ApiSuccess<T> value) success,
    required TResult Function(ApiError<T> value) error,
    required TResult Function(ApiLoading<T> value) loading,
  }) {
    return loading(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(ApiSuccess<T> value)? success,
    TResult? Function(ApiError<T> value)? error,
    TResult? Function(ApiLoading<T> value)? loading,
  }) {
    return loading?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(ApiSuccess<T> value)? success,
    TResult Function(ApiError<T> value)? error,
    TResult Function(ApiLoading<T> value)? loading,
    required TResult orElse(),
  }) {
    if (loading != null) {
      return loading(this);
    }
    return orElse();
  }
}

abstract class ApiLoading<T> implements ApiResponse<T> {
  const factory ApiLoading() = _$ApiLoadingImpl<T>;
}

UserStatus _$UserStatusFromJson(Map<String, dynamic> json) {
  switch (json['runtimeType']) {
    case 'online':
      return UserOnline.fromJson(json);
    case 'offline':
      return UserOffline.fromJson(json);
    case 'away':
      return UserAway.fromJson(json);
    case 'busy':
      return UserBusy.fromJson(json);

    default:
      throw CheckedFromJsonException(
        json,
        'runtimeType',
        'UserStatus',
        'Invalid union type "${json['runtimeType']}"!',
      );
  }
}

/// @nodoc
mixin _$UserStatus {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() online,
    required TResult Function() offline,
    required TResult Function(DateTime since) away,
    required TResult Function(String? customMessage) busy,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? online,
    TResult? Function()? offline,
    TResult? Function(DateTime since)? away,
    TResult? Function(String? customMessage)? busy,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? online,
    TResult Function()? offline,
    TResult Function(DateTime since)? away,
    TResult Function(String? customMessage)? busy,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserOnline value) online,
    required TResult Function(UserOffline value) offline,
    required TResult Function(UserAway value) away,
    required TResult Function(UserBusy value) busy,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserOnline value)? online,
    TResult? Function(UserOffline value)? offline,
    TResult? Function(UserAway value)? away,
    TResult? Function(UserBusy value)? busy,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserOnline value)? online,
    TResult Function(UserOffline value)? offline,
    TResult Function(UserAway value)? away,
    TResult Function(UserBusy value)? busy,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;

  /// Serializes this UserStatus to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserStatusCopyWith<$Res> {
  factory $UserStatusCopyWith(
    UserStatus value,
    $Res Function(UserStatus) then,
  ) = _$UserStatusCopyWithImpl<$Res, UserStatus>;
}

/// @nodoc
class _$UserStatusCopyWithImpl<$Res, $Val extends UserStatus>
    implements $UserStatusCopyWith<$Res> {
  _$UserStatusCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$UserOnlineImplCopyWith<$Res> {
  factory _$$UserOnlineImplCopyWith(
    _$UserOnlineImpl value,
    $Res Function(_$UserOnlineImpl) then,
  ) = __$$UserOnlineImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$UserOnlineImplCopyWithImpl<$Res>
    extends _$UserStatusCopyWithImpl<$Res, _$UserOnlineImpl>
    implements _$$UserOnlineImplCopyWith<$Res> {
  __$$UserOnlineImplCopyWithImpl(
    _$UserOnlineImpl _value,
    $Res Function(_$UserOnlineImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
@JsonSerializable()
class _$UserOnlineImpl implements UserOnline {
  const _$UserOnlineImpl({final String? $type}) : $type = $type ?? 'online';

  factory _$UserOnlineImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserOnlineImplFromJson(json);

  @JsonKey(name: 'runtimeType')
  final String $type;

  @override
  String toString() {
    return 'UserStatus.online()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$UserOnlineImpl);
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() online,
    required TResult Function() offline,
    required TResult Function(DateTime since) away,
    required TResult Function(String? customMessage) busy,
  }) {
    return online();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? online,
    TResult? Function()? offline,
    TResult? Function(DateTime since)? away,
    TResult? Function(String? customMessage)? busy,
  }) {
    return online?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? online,
    TResult Function()? offline,
    TResult Function(DateTime since)? away,
    TResult Function(String? customMessage)? busy,
    required TResult orElse(),
  }) {
    if (online != null) {
      return online();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserOnline value) online,
    required TResult Function(UserOffline value) offline,
    required TResult Function(UserAway value) away,
    required TResult Function(UserBusy value) busy,
  }) {
    return online(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserOnline value)? online,
    TResult? Function(UserOffline value)? offline,
    TResult? Function(UserAway value)? away,
    TResult? Function(UserBusy value)? busy,
  }) {
    return online?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserOnline value)? online,
    TResult Function(UserOffline value)? offline,
    TResult Function(UserAway value)? away,
    TResult Function(UserBusy value)? busy,
    required TResult orElse(),
  }) {
    if (online != null) {
      return online(this);
    }
    return orElse();
  }

  @override
  Map<String, dynamic> toJson() {
    return _$$UserOnlineImplToJson(this);
  }
}

abstract class UserOnline implements UserStatus {
  const factory UserOnline() = _$UserOnlineImpl;

  factory UserOnline.fromJson(Map<String, dynamic> json) =
      _$UserOnlineImpl.fromJson;
}

/// @nodoc
abstract class _$$UserOfflineImplCopyWith<$Res> {
  factory _$$UserOfflineImplCopyWith(
    _$UserOfflineImpl value,
    $Res Function(_$UserOfflineImpl) then,
  ) = __$$UserOfflineImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$UserOfflineImplCopyWithImpl<$Res>
    extends _$UserStatusCopyWithImpl<$Res, _$UserOfflineImpl>
    implements _$$UserOfflineImplCopyWith<$Res> {
  __$$UserOfflineImplCopyWithImpl(
    _$UserOfflineImpl _value,
    $Res Function(_$UserOfflineImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
@JsonSerializable()
class _$UserOfflineImpl implements UserOffline {
  const _$UserOfflineImpl({final String? $type}) : $type = $type ?? 'offline';

  factory _$UserOfflineImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserOfflineImplFromJson(json);

  @JsonKey(name: 'runtimeType')
  final String $type;

  @override
  String toString() {
    return 'UserStatus.offline()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$UserOfflineImpl);
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() online,
    required TResult Function() offline,
    required TResult Function(DateTime since) away,
    required TResult Function(String? customMessage) busy,
  }) {
    return offline();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? online,
    TResult? Function()? offline,
    TResult? Function(DateTime since)? away,
    TResult? Function(String? customMessage)? busy,
  }) {
    return offline?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? online,
    TResult Function()? offline,
    TResult Function(DateTime since)? away,
    TResult Function(String? customMessage)? busy,
    required TResult orElse(),
  }) {
    if (offline != null) {
      return offline();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserOnline value) online,
    required TResult Function(UserOffline value) offline,
    required TResult Function(UserAway value) away,
    required TResult Function(UserBusy value) busy,
  }) {
    return offline(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserOnline value)? online,
    TResult? Function(UserOffline value)? offline,
    TResult? Function(UserAway value)? away,
    TResult? Function(UserBusy value)? busy,
  }) {
    return offline?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserOnline value)? online,
    TResult Function(UserOffline value)? offline,
    TResult Function(UserAway value)? away,
    TResult Function(UserBusy value)? busy,
    required TResult orElse(),
  }) {
    if (offline != null) {
      return offline(this);
    }
    return orElse();
  }

  @override
  Map<String, dynamic> toJson() {
    return _$$UserOfflineImplToJson(this);
  }
}

abstract class UserOffline implements UserStatus {
  const factory UserOffline() = _$UserOfflineImpl;

  factory UserOffline.fromJson(Map<String, dynamic> json) =
      _$UserOfflineImpl.fromJson;
}

/// @nodoc
abstract class _$$UserAwayImplCopyWith<$Res> {
  factory _$$UserAwayImplCopyWith(
    _$UserAwayImpl value,
    $Res Function(_$UserAwayImpl) then,
  ) = __$$UserAwayImplCopyWithImpl<$Res>;
  @useResult
  $Res call({DateTime since});
}

/// @nodoc
class __$$UserAwayImplCopyWithImpl<$Res>
    extends _$UserStatusCopyWithImpl<$Res, _$UserAwayImpl>
    implements _$$UserAwayImplCopyWith<$Res> {
  __$$UserAwayImplCopyWithImpl(
    _$UserAwayImpl _value,
    $Res Function(_$UserAwayImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? since = null}) {
    return _then(
      _$UserAwayImpl(
        since:
            null == since
                ? _value.since
                : since // ignore: cast_nullable_to_non_nullable
                    as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserAwayImpl implements UserAway {
  const _$UserAwayImpl({required this.since, final String? $type})
    : $type = $type ?? 'away';

  factory _$UserAwayImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserAwayImplFromJson(json);

  @override
  final DateTime since;

  @JsonKey(name: 'runtimeType')
  final String $type;

  @override
  String toString() {
    return 'UserStatus.away(since: $since)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserAwayImpl &&
            (identical(other.since, since) || other.since == since));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, since);

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserAwayImplCopyWith<_$UserAwayImpl> get copyWith =>
      __$$UserAwayImplCopyWithImpl<_$UserAwayImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() online,
    required TResult Function() offline,
    required TResult Function(DateTime since) away,
    required TResult Function(String? customMessage) busy,
  }) {
    return away(since);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? online,
    TResult? Function()? offline,
    TResult? Function(DateTime since)? away,
    TResult? Function(String? customMessage)? busy,
  }) {
    return away?.call(since);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? online,
    TResult Function()? offline,
    TResult Function(DateTime since)? away,
    TResult Function(String? customMessage)? busy,
    required TResult orElse(),
  }) {
    if (away != null) {
      return away(since);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserOnline value) online,
    required TResult Function(UserOffline value) offline,
    required TResult Function(UserAway value) away,
    required TResult Function(UserBusy value) busy,
  }) {
    return away(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserOnline value)? online,
    TResult? Function(UserOffline value)? offline,
    TResult? Function(UserAway value)? away,
    TResult? Function(UserBusy value)? busy,
  }) {
    return away?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserOnline value)? online,
    TResult Function(UserOffline value)? offline,
    TResult Function(UserAway value)? away,
    TResult Function(UserBusy value)? busy,
    required TResult orElse(),
  }) {
    if (away != null) {
      return away(this);
    }
    return orElse();
  }

  @override
  Map<String, dynamic> toJson() {
    return _$$UserAwayImplToJson(this);
  }
}

abstract class UserAway implements UserStatus {
  const factory UserAway({required final DateTime since}) = _$UserAwayImpl;

  factory UserAway.fromJson(Map<String, dynamic> json) =
      _$UserAwayImpl.fromJson;

  DateTime get since;

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserAwayImplCopyWith<_$UserAwayImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$UserBusyImplCopyWith<$Res> {
  factory _$$UserBusyImplCopyWith(
    _$UserBusyImpl value,
    $Res Function(_$UserBusyImpl) then,
  ) = __$$UserBusyImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String? customMessage});
}

/// @nodoc
class __$$UserBusyImplCopyWithImpl<$Res>
    extends _$UserStatusCopyWithImpl<$Res, _$UserBusyImpl>
    implements _$$UserBusyImplCopyWith<$Res> {
  __$$UserBusyImplCopyWithImpl(
    _$UserBusyImpl _value,
    $Res Function(_$UserBusyImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? customMessage = freezed}) {
    return _then(
      _$UserBusyImpl(
        customMessage:
            freezed == customMessage
                ? _value.customMessage
                : customMessage // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserBusyImpl implements UserBusy {
  const _$UserBusyImpl({this.customMessage, final String? $type})
    : $type = $type ?? 'busy';

  factory _$UserBusyImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserBusyImplFromJson(json);

  @override
  final String? customMessage;

  @JsonKey(name: 'runtimeType')
  final String $type;

  @override
  String toString() {
    return 'UserStatus.busy(customMessage: $customMessage)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserBusyImpl &&
            (identical(other.customMessage, customMessage) ||
                other.customMessage == customMessage));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, customMessage);

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserBusyImplCopyWith<_$UserBusyImpl> get copyWith =>
      __$$UserBusyImplCopyWithImpl<_$UserBusyImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() online,
    required TResult Function() offline,
    required TResult Function(DateTime since) away,
    required TResult Function(String? customMessage) busy,
  }) {
    return busy(customMessage);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? online,
    TResult? Function()? offline,
    TResult? Function(DateTime since)? away,
    TResult? Function(String? customMessage)? busy,
  }) {
    return busy?.call(customMessage);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? online,
    TResult Function()? offline,
    TResult Function(DateTime since)? away,
    TResult Function(String? customMessage)? busy,
    required TResult orElse(),
  }) {
    if (busy != null) {
      return busy(customMessage);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(UserOnline value) online,
    required TResult Function(UserOffline value) offline,
    required TResult Function(UserAway value) away,
    required TResult Function(UserBusy value) busy,
  }) {
    return busy(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(UserOnline value)? online,
    TResult? Function(UserOffline value)? offline,
    TResult? Function(UserAway value)? away,
    TResult? Function(UserBusy value)? busy,
  }) {
    return busy?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(UserOnline value)? online,
    TResult Function(UserOffline value)? offline,
    TResult Function(UserAway value)? away,
    TResult Function(UserBusy value)? busy,
    required TResult orElse(),
  }) {
    if (busy != null) {
      return busy(this);
    }
    return orElse();
  }

  @override
  Map<String, dynamic> toJson() {
    return _$$UserBusyImplToJson(this);
  }
}

abstract class UserBusy implements UserStatus {
  const factory UserBusy({final String? customMessage}) = _$UserBusyImpl;

  factory UserBusy.fromJson(Map<String, dynamic> json) =
      _$UserBusyImpl.fromJson;

  String? get customMessage;

  /// Create a copy of UserStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserBusyImplCopyWith<_$UserBusyImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UserProfile _$UserProfileFromJson(Map<String, dynamic> json) {
  return _UserProfile.fromJson(json);
}

/// @nodoc
mixin _$UserProfile {
  String get userId => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  UserStatus get status => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  UserSettings? get settings => throw _privateConstructorUsedError;

  /// Serializes this UserProfile to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserProfileCopyWith<UserProfile> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserProfileCopyWith<$Res> {
  factory $UserProfileCopyWith(
    UserProfile value,
    $Res Function(UserProfile) then,
  ) = _$UserProfileCopyWithImpl<$Res, UserProfile>;
  @useResult
  $Res call({
    String userId,
    String username,
    UserStatus status,
    List<String> tags,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    UserSettings? settings,
  });

  $UserStatusCopyWith<$Res> get status;
  $UserSettingsCopyWith<$Res>? get settings;
}

/// @nodoc
class _$UserProfileCopyWithImpl<$Res, $Val extends UserProfile>
    implements $UserProfileCopyWith<$Res> {
  _$UserProfileCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userId = null,
    Object? username = null,
    Object? status = null,
    Object? tags = null,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? settings = freezed,
  }) {
    return _then(
      _value.copyWith(
            userId:
                null == userId
                    ? _value.userId
                    : userId // ignore: cast_nullable_to_non_nullable
                        as String,
            username:
                null == username
                    ? _value.username
                    : username // ignore: cast_nullable_to_non_nullable
                        as String,
            status:
                null == status
                    ? _value.status
                    : status // ignore: cast_nullable_to_non_nullable
                        as UserStatus,
            tags:
                null == tags
                    ? _value.tags
                    : tags // ignore: cast_nullable_to_non_nullable
                        as List<String>,
            createdAt:
                null == createdAt
                    ? _value.createdAt
                    : createdAt // ignore: cast_nullable_to_non_nullable
                        as DateTime,
            updatedAt:
                freezed == updatedAt
                    ? _value.updatedAt
                    : updatedAt // ignore: cast_nullable_to_non_nullable
                        as DateTime?,
            settings:
                freezed == settings
                    ? _value.settings
                    : settings // ignore: cast_nullable_to_non_nullable
                        as UserSettings?,
          )
          as $Val,
    );
  }

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserStatusCopyWith<$Res> get status {
    return $UserStatusCopyWith<$Res>(_value.status, (value) {
      return _then(_value.copyWith(status: value) as $Val);
    });
  }

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserSettingsCopyWith<$Res>? get settings {
    if (_value.settings == null) {
      return null;
    }

    return $UserSettingsCopyWith<$Res>(_value.settings!, (value) {
      return _then(_value.copyWith(settings: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$UserProfileImplCopyWith<$Res>
    implements $UserProfileCopyWith<$Res> {
  factory _$$UserProfileImplCopyWith(
    _$UserProfileImpl value,
    $Res Function(_$UserProfileImpl) then,
  ) = __$$UserProfileImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String userId,
    String username,
    UserStatus status,
    List<String> tags,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    UserSettings? settings,
  });

  @override
  $UserStatusCopyWith<$Res> get status;
  @override
  $UserSettingsCopyWith<$Res>? get settings;
}

/// @nodoc
class __$$UserProfileImplCopyWithImpl<$Res>
    extends _$UserProfileCopyWithImpl<$Res, _$UserProfileImpl>
    implements _$$UserProfileImplCopyWith<$Res> {
  __$$UserProfileImplCopyWithImpl(
    _$UserProfileImpl _value,
    $Res Function(_$UserProfileImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userId = null,
    Object? username = null,
    Object? status = null,
    Object? tags = null,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? settings = freezed,
  }) {
    return _then(
      _$UserProfileImpl(
        userId:
            null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                    as String,
        username:
            null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                    as String,
        status:
            null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                    as UserStatus,
        tags:
            null == tags
                ? _value._tags
                : tags // ignore: cast_nullable_to_non_nullable
                    as List<String>,
        createdAt:
            null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                    as DateTime,
        updatedAt:
            freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                    as DateTime?,
        settings:
            freezed == settings
                ? _value.settings
                : settings // ignore: cast_nullable_to_non_nullable
                    as UserSettings?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserProfileImpl implements _UserProfile {
  const _$UserProfileImpl({
    required this.userId,
    required this.username,
    required this.status,
    final List<String> tags = const [],
    @JsonKey(name: 'created_at') required this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
    this.settings,
  }) : _tags = tags;

  factory _$UserProfileImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserProfileImplFromJson(json);

  @override
  final String userId;
  @override
  final String username;
  @override
  final UserStatus status;
  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  @override
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  @override
  final UserSettings? settings;

  @override
  String toString() {
    return 'UserProfile(userId: $userId, username: $username, status: $status, tags: $tags, createdAt: $createdAt, updatedAt: $updatedAt, settings: $settings)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserProfileImpl &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.settings, settings) ||
                other.settings == settings));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    userId,
    username,
    status,
    const DeepCollectionEquality().hash(_tags),
    createdAt,
    updatedAt,
    settings,
  );

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserProfileImplCopyWith<_$UserProfileImpl> get copyWith =>
      __$$UserProfileImplCopyWithImpl<_$UserProfileImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserProfileImplToJson(this);
  }
}

abstract class _UserProfile implements UserProfile {
  const factory _UserProfile({
    required final String userId,
    required final String username,
    required final UserStatus status,
    final List<String> tags,
    @JsonKey(name: 'created_at') required final DateTime createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
    final UserSettings? settings,
  }) = _$UserProfileImpl;

  factory _UserProfile.fromJson(Map<String, dynamic> json) =
      _$UserProfileImpl.fromJson;

  @override
  String get userId;
  @override
  String get username;
  @override
  UserStatus get status;
  @override
  List<String> get tags;
  @override
  @JsonKey(name: 'created_at')
  DateTime get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt;
  @override
  UserSettings? get settings;

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserProfileImplCopyWith<_$UserProfileImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UserSettings _$UserSettingsFromJson(Map<String, dynamic> json) {
  return _UserSettings.fromJson(json);
}

/// @nodoc
mixin _$UserSettings {
  bool get notifications => throw _privateConstructorUsedError;
  String get language => throw _privateConstructorUsedError;
  ThemeMode get theme => throw _privateConstructorUsedError;

  /// Serializes this UserSettings to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserSettingsCopyWith<UserSettings> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserSettingsCopyWith<$Res> {
  factory $UserSettingsCopyWith(
    UserSettings value,
    $Res Function(UserSettings) then,
  ) = _$UserSettingsCopyWithImpl<$Res, UserSettings>;
  @useResult
  $Res call({bool notifications, String language, ThemeMode theme});
}

/// @nodoc
class _$UserSettingsCopyWithImpl<$Res, $Val extends UserSettings>
    implements $UserSettingsCopyWith<$Res> {
  _$UserSettingsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? notifications = null,
    Object? language = null,
    Object? theme = null,
  }) {
    return _then(
      _value.copyWith(
            notifications:
                null == notifications
                    ? _value.notifications
                    : notifications // ignore: cast_nullable_to_non_nullable
                        as bool,
            language:
                null == language
                    ? _value.language
                    : language // ignore: cast_nullable_to_non_nullable
                        as String,
            theme:
                null == theme
                    ? _value.theme
                    : theme // ignore: cast_nullable_to_non_nullable
                        as ThemeMode,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UserSettingsImplCopyWith<$Res>
    implements $UserSettingsCopyWith<$Res> {
  factory _$$UserSettingsImplCopyWith(
    _$UserSettingsImpl value,
    $Res Function(_$UserSettingsImpl) then,
  ) = __$$UserSettingsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool notifications, String language, ThemeMode theme});
}

/// @nodoc
class __$$UserSettingsImplCopyWithImpl<$Res>
    extends _$UserSettingsCopyWithImpl<$Res, _$UserSettingsImpl>
    implements _$$UserSettingsImplCopyWith<$Res> {
  __$$UserSettingsImplCopyWithImpl(
    _$UserSettingsImpl _value,
    $Res Function(_$UserSettingsImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? notifications = null,
    Object? language = null,
    Object? theme = null,
  }) {
    return _then(
      _$UserSettingsImpl(
        notifications:
            null == notifications
                ? _value.notifications
                : notifications // ignore: cast_nullable_to_non_nullable
                    as bool,
        language:
            null == language
                ? _value.language
                : language // ignore: cast_nullable_to_non_nullable
                    as String,
        theme:
            null == theme
                ? _value.theme
                : theme // ignore: cast_nullable_to_non_nullable
                    as ThemeMode,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserSettingsImpl implements _UserSettings {
  const _$UserSettingsImpl({
    this.notifications = true,
    this.language = 'en',
    this.theme = ThemeMode.system,
  });

  factory _$UserSettingsImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserSettingsImplFromJson(json);

  @override
  @JsonKey()
  final bool notifications;
  @override
  @JsonKey()
  final String language;
  @override
  @JsonKey()
  final ThemeMode theme;

  @override
  String toString() {
    return 'UserSettings(notifications: $notifications, language: $language, theme: $theme)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserSettingsImpl &&
            (identical(other.notifications, notifications) ||
                other.notifications == notifications) &&
            (identical(other.language, language) ||
                other.language == language) &&
            (identical(other.theme, theme) || other.theme == theme));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, notifications, language, theme);

  /// Create a copy of UserSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserSettingsImplCopyWith<_$UserSettingsImpl> get copyWith =>
      __$$UserSettingsImplCopyWithImpl<_$UserSettingsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserSettingsImplToJson(this);
  }
}

abstract class _UserSettings implements UserSettings {
  const factory _UserSettings({
    final bool notifications,
    final String language,
    final ThemeMode theme,
  }) = _$UserSettingsImpl;

  factory _UserSettings.fromJson(Map<String, dynamic> json) =
      _$UserSettingsImpl.fromJson;

  @override
  bool get notifications;
  @override
  String get language;
  @override
  ThemeMode get theme;

  /// Create a copy of UserSettings
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserSettingsImplCopyWith<_$UserSettingsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
