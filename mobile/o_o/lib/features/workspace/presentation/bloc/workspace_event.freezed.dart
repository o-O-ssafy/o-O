// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'workspace_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$WorkspaceEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadMore,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadMore,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadMore,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceLoadEvent value) load,
    required TResult Function(WorkspaceRefreshEvent value) refresh,
    required TResult Function(WorkspaceLoadMoreEvent value) loadMore,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceLoadEvent value)? load,
    TResult? Function(WorkspaceRefreshEvent value)? refresh,
    TResult? Function(WorkspaceLoadMoreEvent value)? loadMore,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceLoadEvent value)? load,
    TResult Function(WorkspaceRefreshEvent value)? refresh,
    TResult Function(WorkspaceLoadMoreEvent value)? loadMore,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WorkspaceEventCopyWith<$Res> {
  factory $WorkspaceEventCopyWith(
    WorkspaceEvent value,
    $Res Function(WorkspaceEvent) then,
  ) = _$WorkspaceEventCopyWithImpl<$Res, WorkspaceEvent>;
}

/// @nodoc
class _$WorkspaceEventCopyWithImpl<$Res, $Val extends WorkspaceEvent>
    implements $WorkspaceEventCopyWith<$Res> {
  _$WorkspaceEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WorkspaceEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$WorkspaceLoadEventImplCopyWith<$Res> {
  factory _$$WorkspaceLoadEventImplCopyWith(
    _$WorkspaceLoadEventImpl value,
    $Res Function(_$WorkspaceLoadEventImpl) then,
  ) = __$$WorkspaceLoadEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$WorkspaceLoadEventImplCopyWithImpl<$Res>
    extends _$WorkspaceEventCopyWithImpl<$Res, _$WorkspaceLoadEventImpl>
    implements _$$WorkspaceLoadEventImplCopyWith<$Res> {
  __$$WorkspaceLoadEventImplCopyWithImpl(
    _$WorkspaceLoadEventImpl _value,
    $Res Function(_$WorkspaceLoadEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$WorkspaceLoadEventImpl implements WorkspaceLoadEvent {
  const _$WorkspaceLoadEventImpl();

  @override
  String toString() {
    return 'WorkspaceEvent.load()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$WorkspaceLoadEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadMore,
  }) {
    return load();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadMore,
  }) {
    return load?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadMore,
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
    required TResult Function(WorkspaceLoadEvent value) load,
    required TResult Function(WorkspaceRefreshEvent value) refresh,
    required TResult Function(WorkspaceLoadMoreEvent value) loadMore,
  }) {
    return load(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceLoadEvent value)? load,
    TResult? Function(WorkspaceRefreshEvent value)? refresh,
    TResult? Function(WorkspaceLoadMoreEvent value)? loadMore,
  }) {
    return load?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceLoadEvent value)? load,
    TResult Function(WorkspaceRefreshEvent value)? refresh,
    TResult Function(WorkspaceLoadMoreEvent value)? loadMore,
    required TResult orElse(),
  }) {
    if (load != null) {
      return load(this);
    }
    return orElse();
  }
}

abstract class WorkspaceLoadEvent implements WorkspaceEvent {
  const factory WorkspaceLoadEvent() = _$WorkspaceLoadEventImpl;
}

/// @nodoc
abstract class _$$WorkspaceRefreshEventImplCopyWith<$Res> {
  factory _$$WorkspaceRefreshEventImplCopyWith(
    _$WorkspaceRefreshEventImpl value,
    $Res Function(_$WorkspaceRefreshEventImpl) then,
  ) = __$$WorkspaceRefreshEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$WorkspaceRefreshEventImplCopyWithImpl<$Res>
    extends _$WorkspaceEventCopyWithImpl<$Res, _$WorkspaceRefreshEventImpl>
    implements _$$WorkspaceRefreshEventImplCopyWith<$Res> {
  __$$WorkspaceRefreshEventImplCopyWithImpl(
    _$WorkspaceRefreshEventImpl _value,
    $Res Function(_$WorkspaceRefreshEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$WorkspaceRefreshEventImpl implements WorkspaceRefreshEvent {
  const _$WorkspaceRefreshEventImpl();

  @override
  String toString() {
    return 'WorkspaceEvent.refresh()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceRefreshEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadMore,
  }) {
    return refresh();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadMore,
  }) {
    return refresh?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadMore,
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
    required TResult Function(WorkspaceLoadEvent value) load,
    required TResult Function(WorkspaceRefreshEvent value) refresh,
    required TResult Function(WorkspaceLoadMoreEvent value) loadMore,
  }) {
    return refresh(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceLoadEvent value)? load,
    TResult? Function(WorkspaceRefreshEvent value)? refresh,
    TResult? Function(WorkspaceLoadMoreEvent value)? loadMore,
  }) {
    return refresh?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceLoadEvent value)? load,
    TResult Function(WorkspaceRefreshEvent value)? refresh,
    TResult Function(WorkspaceLoadMoreEvent value)? loadMore,
    required TResult orElse(),
  }) {
    if (refresh != null) {
      return refresh(this);
    }
    return orElse();
  }
}

abstract class WorkspaceRefreshEvent implements WorkspaceEvent {
  const factory WorkspaceRefreshEvent() = _$WorkspaceRefreshEventImpl;
}

/// @nodoc
abstract class _$$WorkspaceLoadMoreEventImplCopyWith<$Res> {
  factory _$$WorkspaceLoadMoreEventImplCopyWith(
    _$WorkspaceLoadMoreEventImpl value,
    $Res Function(_$WorkspaceLoadMoreEventImpl) then,
  ) = __$$WorkspaceLoadMoreEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$WorkspaceLoadMoreEventImplCopyWithImpl<$Res>
    extends _$WorkspaceEventCopyWithImpl<$Res, _$WorkspaceLoadMoreEventImpl>
    implements _$$WorkspaceLoadMoreEventImplCopyWith<$Res> {
  __$$WorkspaceLoadMoreEventImplCopyWithImpl(
    _$WorkspaceLoadMoreEventImpl _value,
    $Res Function(_$WorkspaceLoadMoreEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$WorkspaceLoadMoreEventImpl implements WorkspaceLoadMoreEvent {
  const _$WorkspaceLoadMoreEventImpl();

  @override
  String toString() {
    return 'WorkspaceEvent.loadMore()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceLoadMoreEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() load,
    required TResult Function() refresh,
    required TResult Function() loadMore,
  }) {
    return loadMore();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? load,
    TResult? Function()? refresh,
    TResult? Function()? loadMore,
  }) {
    return loadMore?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? load,
    TResult Function()? refresh,
    TResult Function()? loadMore,
    required TResult orElse(),
  }) {
    if (loadMore != null) {
      return loadMore();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceLoadEvent value) load,
    required TResult Function(WorkspaceRefreshEvent value) refresh,
    required TResult Function(WorkspaceLoadMoreEvent value) loadMore,
  }) {
    return loadMore(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceLoadEvent value)? load,
    TResult? Function(WorkspaceRefreshEvent value)? refresh,
    TResult? Function(WorkspaceLoadMoreEvent value)? loadMore,
  }) {
    return loadMore?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceLoadEvent value)? load,
    TResult Function(WorkspaceRefreshEvent value)? refresh,
    TResult Function(WorkspaceLoadMoreEvent value)? loadMore,
    required TResult orElse(),
  }) {
    if (loadMore != null) {
      return loadMore(this);
    }
    return orElse();
  }
}

abstract class WorkspaceLoadMoreEvent implements WorkspaceEvent {
  const factory WorkspaceLoadMoreEvent() = _$WorkspaceLoadMoreEventImpl;
}
