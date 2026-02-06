// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$UserEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadCalendar,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadCalendar,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadCalendar,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadUserInfo value) load,
    required TResult Function(RefreshUserInfo value) refresh,
    required TResult Function(LoadCalendar value) loadCalendar,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadUserInfo value)? load,
    TResult? Function(RefreshUserInfo value)? refresh,
    TResult? Function(LoadCalendar value)? loadCalendar,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadUserInfo value)? load,
    TResult Function(RefreshUserInfo value)? refresh,
    TResult Function(LoadCalendar value)? loadCalendar,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserEventCopyWith<$Res> {
  factory $UserEventCopyWith(UserEvent value, $Res Function(UserEvent) then) =
      _$UserEventCopyWithImpl<$Res, UserEvent>;
}

/// @nodoc
class _$UserEventCopyWithImpl<$Res, $Val extends UserEvent>
    implements $UserEventCopyWith<$Res> {
  _$UserEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$LoadUserInfoImplCopyWith<$Res> {
  factory _$$LoadUserInfoImplCopyWith(
    _$LoadUserInfoImpl value,
    $Res Function(_$LoadUserInfoImpl) then,
  ) = __$$LoadUserInfoImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$LoadUserInfoImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$LoadUserInfoImpl>
    implements _$$LoadUserInfoImplCopyWith<$Res> {
  __$$LoadUserInfoImplCopyWithImpl(
    _$LoadUserInfoImpl _value,
    $Res Function(_$LoadUserInfoImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$LoadUserInfoImpl implements LoadUserInfo {
  const _$LoadUserInfoImpl();

  @override
  String toString() {
    return 'UserEvent.load()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$LoadUserInfoImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadCalendar,
  }) {
    return load();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadCalendar,
  }) {
    return load?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadCalendar,
    required TResult orElse(),
  }) {
    if (load != null) {
      return load();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadUserInfo value) load,
    required TResult Function(RefreshUserInfo value) refresh,
    required TResult Function(LoadCalendar value) loadCalendar,
  }) {
    return load(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadUserInfo value)? load,
    TResult? Function(RefreshUserInfo value)? refresh,
    TResult? Function(LoadCalendar value)? loadCalendar,
  }) {
    return load?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadUserInfo value)? load,
    TResult Function(RefreshUserInfo value)? refresh,
    TResult Function(LoadCalendar value)? loadCalendar,
    required TResult orElse(),
  }) {
    if (load != null) {
      return load(this);
    }
    return orElse();
  }
}

abstract class LoadUserInfo implements UserEvent {
  const factory LoadUserInfo() = _$LoadUserInfoImpl;
}

/// @nodoc
abstract class _$$RefreshUserInfoImplCopyWith<$Res> {
  factory _$$RefreshUserInfoImplCopyWith(
    _$RefreshUserInfoImpl value,
    $Res Function(_$RefreshUserInfoImpl) then,
  ) = __$$RefreshUserInfoImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RefreshUserInfoImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$RefreshUserInfoImpl>
    implements _$$RefreshUserInfoImplCopyWith<$Res> {
  __$$RefreshUserInfoImplCopyWithImpl(
    _$RefreshUserInfoImpl _value,
    $Res Function(_$RefreshUserInfoImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RefreshUserInfoImpl implements RefreshUserInfo {
  const _$RefreshUserInfoImpl();

  @override
  String toString() {
    return 'UserEvent.refresh()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RefreshUserInfoImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadCalendar,
  }) {
    return refresh();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadCalendar,
  }) {
    return refresh?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadCalendar,
    required TResult orElse(),
  }) {
    if (refresh != null) {
      return refresh();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadUserInfo value) load,
    required TResult Function(RefreshUserInfo value) refresh,
    required TResult Function(LoadCalendar value) loadCalendar,
  }) {
    return refresh(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadUserInfo value)? load,
    TResult? Function(RefreshUserInfo value)? refresh,
    TResult? Function(LoadCalendar value)? loadCalendar,
  }) {
    return refresh?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadUserInfo value)? load,
    TResult Function(RefreshUserInfo value)? refresh,
    TResult Function(LoadCalendar value)? loadCalendar,
    required TResult orElse(),
  }) {
    if (refresh != null) {
      return refresh(this);
    }
    return orElse();
  }
}

abstract class RefreshUserInfo implements UserEvent {
  const factory RefreshUserInfo() = _$RefreshUserInfoImpl;
}

/// @nodoc
abstract class _$$LoadCalendarImplCopyWith<$Res> {
  factory _$$LoadCalendarImplCopyWith(
    _$LoadCalendarImpl value,
    $Res Function(_$LoadCalendarImpl) then,
  ) = __$$LoadCalendarImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$LoadCalendarImplCopyWithImpl<$Res>
    extends _$UserEventCopyWithImpl<$Res, _$LoadCalendarImpl>
    implements _$$LoadCalendarImplCopyWith<$Res> {
  __$$LoadCalendarImplCopyWithImpl(
    _$LoadCalendarImpl _value,
    $Res Function(_$LoadCalendarImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$LoadCalendarImpl implements LoadCalendar {
  const _$LoadCalendarImpl();

  @override
  String toString() {
    return 'UserEvent.loadCalendar()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$LoadCalendarImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadCalendar,
  }) {
    return loadCalendar();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadCalendar,
  }) {
    return loadCalendar?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadCalendar,
    required TResult orElse(),
  }) {
    if (loadCalendar != null) {
      return loadCalendar();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(LoadUserInfo value) load,
    required TResult Function(RefreshUserInfo value) refresh,
    required TResult Function(LoadCalendar value) loadCalendar,
  }) {
    return loadCalendar(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(LoadUserInfo value)? load,
    TResult? Function(RefreshUserInfo value)? refresh,
    TResult? Function(LoadCalendar value)? loadCalendar,
  }) {
    return loadCalendar?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(LoadUserInfo value)? load,
    TResult Function(RefreshUserInfo value)? refresh,
    TResult Function(LoadCalendar value)? loadCalendar,
    required TResult orElse(),
  }) {
    if (loadCalendar != null) {
      return loadCalendar(this);
    }
    return orElse();
  }
}

abstract class LoadCalendar implements UserEvent {
  const factory LoadCalendar() = _$LoadCalendarImpl;
}
