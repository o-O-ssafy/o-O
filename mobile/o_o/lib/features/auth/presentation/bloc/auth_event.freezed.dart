// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$AuthEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() signInWithGoogle,
    required TResult Function() signOut,
    required TResult Function() checkAuthStatus,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? signInWithGoogle,
    TResult? Function()? signOut,
    TResult? Function()? checkAuthStatus,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? signInWithGoogle,
    TResult Function()? signOut,
    TResult Function()? checkAuthStatus,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(AuthSignInWithGoogle value) signInWithGoogle,
    required TResult Function(AuthSignOut value) signOut,
    required TResult Function(AuthCheckStatus value) checkAuthStatus,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult? Function(AuthSignOut value)? signOut,
    TResult? Function(AuthCheckStatus value)? checkAuthStatus,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult Function(AuthSignOut value)? signOut,
    TResult Function(AuthCheckStatus value)? checkAuthStatus,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AuthEventCopyWith<$Res> {
  factory $AuthEventCopyWith(AuthEvent value, $Res Function(AuthEvent) then) =
      _$AuthEventCopyWithImpl<$Res, AuthEvent>;
}

/// @nodoc
class _$AuthEventCopyWithImpl<$Res, $Val extends AuthEvent>
    implements $AuthEventCopyWith<$Res> {
  _$AuthEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AuthEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$AuthSignInWithGoogleImplCopyWith<$Res> {
  factory _$$AuthSignInWithGoogleImplCopyWith(
    _$AuthSignInWithGoogleImpl value,
    $Res Function(_$AuthSignInWithGoogleImpl) then,
  ) = __$$AuthSignInWithGoogleImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$AuthSignInWithGoogleImplCopyWithImpl<$Res>
    extends _$AuthEventCopyWithImpl<$Res, _$AuthSignInWithGoogleImpl>
    implements _$$AuthSignInWithGoogleImplCopyWith<$Res> {
  __$$AuthSignInWithGoogleImplCopyWithImpl(
    _$AuthSignInWithGoogleImpl _value,
    $Res Function(_$AuthSignInWithGoogleImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AuthEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$AuthSignInWithGoogleImpl implements AuthSignInWithGoogle {
  const _$AuthSignInWithGoogleImpl();

  @override
  String toString() {
    return 'AuthEvent.signInWithGoogle()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AuthSignInWithGoogleImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() signInWithGoogle,
    required TResult Function() signOut,
    required TResult Function() checkAuthStatus,
  }) {
    return signInWithGoogle();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? signInWithGoogle,
    TResult? Function()? signOut,
    TResult? Function()? checkAuthStatus,
  }) {
    return signInWithGoogle?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? signInWithGoogle,
    TResult Function()? signOut,
    TResult Function()? checkAuthStatus,
    required TResult orElse(),
  }) {
    if (signInWithGoogle != null) {
      return signInWithGoogle();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(AuthSignInWithGoogle value) signInWithGoogle,
    required TResult Function(AuthSignOut value) signOut,
    required TResult Function(AuthCheckStatus value) checkAuthStatus,
  }) {
    return signInWithGoogle(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult? Function(AuthSignOut value)? signOut,
    TResult? Function(AuthCheckStatus value)? checkAuthStatus,
  }) {
    return signInWithGoogle?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult Function(AuthSignOut value)? signOut,
    TResult Function(AuthCheckStatus value)? checkAuthStatus,
    required TResult orElse(),
  }) {
    if (signInWithGoogle != null) {
      return signInWithGoogle(this);
    }
    return orElse();
  }
}

abstract class AuthSignInWithGoogle implements AuthEvent {
  const factory AuthSignInWithGoogle() = _$AuthSignInWithGoogleImpl;
}

/// @nodoc
abstract class _$$AuthSignOutImplCopyWith<$Res> {
  factory _$$AuthSignOutImplCopyWith(
    _$AuthSignOutImpl value,
    $Res Function(_$AuthSignOutImpl) then,
  ) = __$$AuthSignOutImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$AuthSignOutImplCopyWithImpl<$Res>
    extends _$AuthEventCopyWithImpl<$Res, _$AuthSignOutImpl>
    implements _$$AuthSignOutImplCopyWith<$Res> {
  __$$AuthSignOutImplCopyWithImpl(
    _$AuthSignOutImpl _value,
    $Res Function(_$AuthSignOutImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AuthEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$AuthSignOutImpl implements AuthSignOut {
  const _$AuthSignOutImpl();

  @override
  String toString() {
    return 'AuthEvent.signOut()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$AuthSignOutImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() signInWithGoogle,
    required TResult Function() signOut,
    required TResult Function() checkAuthStatus,
  }) {
    return signOut();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? signInWithGoogle,
    TResult? Function()? signOut,
    TResult? Function()? checkAuthStatus,
  }) {
    return signOut?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? signInWithGoogle,
    TResult Function()? signOut,
    TResult Function()? checkAuthStatus,
    required TResult orElse(),
  }) {
    if (signOut != null) {
      return signOut();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(AuthSignInWithGoogle value) signInWithGoogle,
    required TResult Function(AuthSignOut value) signOut,
    required TResult Function(AuthCheckStatus value) checkAuthStatus,
  }) {
    return signOut(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult? Function(AuthSignOut value)? signOut,
    TResult? Function(AuthCheckStatus value)? checkAuthStatus,
  }) {
    return signOut?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult Function(AuthSignOut value)? signOut,
    TResult Function(AuthCheckStatus value)? checkAuthStatus,
    required TResult orElse(),
  }) {
    if (signOut != null) {
      return signOut(this);
    }
    return orElse();
  }
}

abstract class AuthSignOut implements AuthEvent {
  const factory AuthSignOut() = _$AuthSignOutImpl;
}

/// @nodoc
abstract class _$$AuthCheckStatusImplCopyWith<$Res> {
  factory _$$AuthCheckStatusImplCopyWith(
    _$AuthCheckStatusImpl value,
    $Res Function(_$AuthCheckStatusImpl) then,
  ) = __$$AuthCheckStatusImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$AuthCheckStatusImplCopyWithImpl<$Res>
    extends _$AuthEventCopyWithImpl<$Res, _$AuthCheckStatusImpl>
    implements _$$AuthCheckStatusImplCopyWith<$Res> {
  __$$AuthCheckStatusImplCopyWithImpl(
    _$AuthCheckStatusImpl _value,
    $Res Function(_$AuthCheckStatusImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AuthEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$AuthCheckStatusImpl implements AuthCheckStatus {
  const _$AuthCheckStatusImpl();

  @override
  String toString() {
    return 'AuthEvent.checkAuthStatus()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$AuthCheckStatusImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() signInWithGoogle,
    required TResult Function() signOut,
    required TResult Function() checkAuthStatus,
  }) {
    return checkAuthStatus();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? signInWithGoogle,
    TResult? Function()? signOut,
    TResult? Function()? checkAuthStatus,
  }) {
    return checkAuthStatus?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? signInWithGoogle,
    TResult Function()? signOut,
    TResult Function()? checkAuthStatus,
    required TResult orElse(),
  }) {
    if (checkAuthStatus != null) {
      return checkAuthStatus();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(AuthSignInWithGoogle value) signInWithGoogle,
    required TResult Function(AuthSignOut value) signOut,
    required TResult Function(AuthCheckStatus value) checkAuthStatus,
  }) {
    return checkAuthStatus(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult? Function(AuthSignOut value)? signOut,
    TResult? Function(AuthCheckStatus value)? checkAuthStatus,
  }) {
    return checkAuthStatus?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(AuthSignInWithGoogle value)? signInWithGoogle,
    TResult Function(AuthSignOut value)? signOut,
    TResult Function(AuthCheckStatus value)? checkAuthStatus,
    required TResult orElse(),
  }) {
    if (checkAuthStatus != null) {
      return checkAuthStatus(this);
    }
    return orElse();
  }
}

abstract class AuthCheckStatus implements AuthEvent {
  const factory AuthCheckStatus() = _$AuthCheckStatusImpl;
}
