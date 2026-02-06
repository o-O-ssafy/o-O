// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'workspace_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$WorkspaceState {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )
    loaded,
    required TResult Function(List<Workspace> workspaces) loadingMore,
    required TResult Function(String message) error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )?
    loaded,
    TResult? Function(List<Workspace> workspaces)? loadingMore,
    TResult? Function(String message)? error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<Workspace> workspaces, bool hasNext, int? nextCursor)?
    loaded,
    TResult Function(List<Workspace> workspaces)? loadingMore,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceInitial value) initial,
    required TResult Function(WorkspaceLoading value) loading,
    required TResult Function(WorkspaceLoaded value) loaded,
    required TResult Function(WorkspaceLoadingMore value) loadingMore,
    required TResult Function(WorkspaceError value) error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceInitial value)? initial,
    TResult? Function(WorkspaceLoading value)? loading,
    TResult? Function(WorkspaceLoaded value)? loaded,
    TResult? Function(WorkspaceLoadingMore value)? loadingMore,
    TResult? Function(WorkspaceError value)? error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceInitial value)? initial,
    TResult Function(WorkspaceLoading value)? loading,
    TResult Function(WorkspaceLoaded value)? loaded,
    TResult Function(WorkspaceLoadingMore value)? loadingMore,
    TResult Function(WorkspaceError value)? error,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WorkspaceStateCopyWith<$Res> {
  factory $WorkspaceStateCopyWith(
    WorkspaceState value,
    $Res Function(WorkspaceState) then,
  ) = _$WorkspaceStateCopyWithImpl<$Res, WorkspaceState>;
}

/// @nodoc
class _$WorkspaceStateCopyWithImpl<$Res, $Val extends WorkspaceState>
    implements $WorkspaceStateCopyWith<$Res> {
  _$WorkspaceStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$WorkspaceInitialImplCopyWith<$Res> {
  factory _$$WorkspaceInitialImplCopyWith(
    _$WorkspaceInitialImpl value,
    $Res Function(_$WorkspaceInitialImpl) then,
  ) = __$$WorkspaceInitialImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$WorkspaceInitialImplCopyWithImpl<$Res>
    extends _$WorkspaceStateCopyWithImpl<$Res, _$WorkspaceInitialImpl>
    implements _$$WorkspaceInitialImplCopyWith<$Res> {
  __$$WorkspaceInitialImplCopyWithImpl(
    _$WorkspaceInitialImpl _value,
    $Res Function(_$WorkspaceInitialImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$WorkspaceInitialImpl implements WorkspaceInitial {
  const _$WorkspaceInitialImpl();

  @override
  String toString() {
    return 'WorkspaceState.initial()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$WorkspaceInitialImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )
    loaded,
    required TResult Function(List<Workspace> workspaces) loadingMore,
    required TResult Function(String message) error,
  }) {
    return initial();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )?
    loaded,
    TResult? Function(List<Workspace> workspaces)? loadingMore,
    TResult? Function(String message)? error,
  }) {
    return initial?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<Workspace> workspaces, bool hasNext, int? nextCursor)?
    loaded,
    TResult Function(List<Workspace> workspaces)? loadingMore,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (initial != null) {
      return initial();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceInitial value) initial,
    required TResult Function(WorkspaceLoading value) loading,
    required TResult Function(WorkspaceLoaded value) loaded,
    required TResult Function(WorkspaceLoadingMore value) loadingMore,
    required TResult Function(WorkspaceError value) error,
  }) {
    return initial(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceInitial value)? initial,
    TResult? Function(WorkspaceLoading value)? loading,
    TResult? Function(WorkspaceLoaded value)? loaded,
    TResult? Function(WorkspaceLoadingMore value)? loadingMore,
    TResult? Function(WorkspaceError value)? error,
  }) {
    return initial?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceInitial value)? initial,
    TResult Function(WorkspaceLoading value)? loading,
    TResult Function(WorkspaceLoaded value)? loaded,
    TResult Function(WorkspaceLoadingMore value)? loadingMore,
    TResult Function(WorkspaceError value)? error,
    required TResult orElse(),
  }) {
    if (initial != null) {
      return initial(this);
    }
    return orElse();
  }
}

abstract class WorkspaceInitial implements WorkspaceState {
  const factory WorkspaceInitial() = _$WorkspaceInitialImpl;
}

/// @nodoc
abstract class _$$WorkspaceLoadingImplCopyWith<$Res> {
  factory _$$WorkspaceLoadingImplCopyWith(
    _$WorkspaceLoadingImpl value,
    $Res Function(_$WorkspaceLoadingImpl) then,
  ) = __$$WorkspaceLoadingImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$WorkspaceLoadingImplCopyWithImpl<$Res>
    extends _$WorkspaceStateCopyWithImpl<$Res, _$WorkspaceLoadingImpl>
    implements _$$WorkspaceLoadingImplCopyWith<$Res> {
  __$$WorkspaceLoadingImplCopyWithImpl(
    _$WorkspaceLoadingImpl _value,
    $Res Function(_$WorkspaceLoadingImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$WorkspaceLoadingImpl implements WorkspaceLoading {
  const _$WorkspaceLoadingImpl();

  @override
  String toString() {
    return 'WorkspaceState.loading()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$WorkspaceLoadingImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )
    loaded,
    required TResult Function(List<Workspace> workspaces) loadingMore,
    required TResult Function(String message) error,
  }) {
    return loading();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )?
    loaded,
    TResult? Function(List<Workspace> workspaces)? loadingMore,
    TResult? Function(String message)? error,
  }) {
    return loading?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<Workspace> workspaces, bool hasNext, int? nextCursor)?
    loaded,
    TResult Function(List<Workspace> workspaces)? loadingMore,
    TResult Function(String message)? error,
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
    required TResult Function(WorkspaceInitial value) initial,
    required TResult Function(WorkspaceLoading value) loading,
    required TResult Function(WorkspaceLoaded value) loaded,
    required TResult Function(WorkspaceLoadingMore value) loadingMore,
    required TResult Function(WorkspaceError value) error,
  }) {
    return loading(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceInitial value)? initial,
    TResult? Function(WorkspaceLoading value)? loading,
    TResult? Function(WorkspaceLoaded value)? loaded,
    TResult? Function(WorkspaceLoadingMore value)? loadingMore,
    TResult? Function(WorkspaceError value)? error,
  }) {
    return loading?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceInitial value)? initial,
    TResult Function(WorkspaceLoading value)? loading,
    TResult Function(WorkspaceLoaded value)? loaded,
    TResult Function(WorkspaceLoadingMore value)? loadingMore,
    TResult Function(WorkspaceError value)? error,
    required TResult orElse(),
  }) {
    if (loading != null) {
      return loading(this);
    }
    return orElse();
  }
}

abstract class WorkspaceLoading implements WorkspaceState {
  const factory WorkspaceLoading() = _$WorkspaceLoadingImpl;
}

/// @nodoc
abstract class _$$WorkspaceLoadedImplCopyWith<$Res> {
  factory _$$WorkspaceLoadedImplCopyWith(
    _$WorkspaceLoadedImpl value,
    $Res Function(_$WorkspaceLoadedImpl) then,
  ) = __$$WorkspaceLoadedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({List<Workspace> workspaces, bool hasNext, int? nextCursor});
}

/// @nodoc
class __$$WorkspaceLoadedImplCopyWithImpl<$Res>
    extends _$WorkspaceStateCopyWithImpl<$Res, _$WorkspaceLoadedImpl>
    implements _$$WorkspaceLoadedImplCopyWith<$Res> {
  __$$WorkspaceLoadedImplCopyWithImpl(
    _$WorkspaceLoadedImpl _value,
    $Res Function(_$WorkspaceLoadedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? workspaces = null,
    Object? hasNext = null,
    Object? nextCursor = freezed,
  }) {
    return _then(
      _$WorkspaceLoadedImpl(
        workspaces:
            null == workspaces
                ? _value._workspaces
                : workspaces // ignore: cast_nullable_to_non_nullable
                    as List<Workspace>,
        hasNext:
            null == hasNext
                ? _value.hasNext
                : hasNext // ignore: cast_nullable_to_non_nullable
                    as bool,
        nextCursor:
            freezed == nextCursor
                ? _value.nextCursor
                : nextCursor // ignore: cast_nullable_to_non_nullable
                    as int?,
      ),
    );
  }
}

/// @nodoc

class _$WorkspaceLoadedImpl implements WorkspaceLoaded {
  const _$WorkspaceLoadedImpl({
    required final List<Workspace> workspaces,
    required this.hasNext,
    this.nextCursor,
  }) : _workspaces = workspaces;

  final List<Workspace> _workspaces;
  @override
  List<Workspace> get workspaces {
    if (_workspaces is EqualUnmodifiableListView) return _workspaces;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_workspaces);
  }

  @override
  final bool hasNext;
  @override
  final int? nextCursor;

  @override
  String toString() {
    return 'WorkspaceState.loaded(workspaces: $workspaces, hasNext: $hasNext, nextCursor: $nextCursor)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceLoadedImpl &&
            const DeepCollectionEquality().equals(
              other._workspaces,
              _workspaces,
            ) &&
            (identical(other.hasNext, hasNext) || other.hasNext == hasNext) &&
            (identical(other.nextCursor, nextCursor) ||
                other.nextCursor == nextCursor));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_workspaces),
    hasNext,
    nextCursor,
  );

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceLoadedImplCopyWith<_$WorkspaceLoadedImpl> get copyWith =>
      __$$WorkspaceLoadedImplCopyWithImpl<_$WorkspaceLoadedImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )
    loaded,
    required TResult Function(List<Workspace> workspaces) loadingMore,
    required TResult Function(String message) error,
  }) {
    return loaded(workspaces, hasNext, nextCursor);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )?
    loaded,
    TResult? Function(List<Workspace> workspaces)? loadingMore,
    TResult? Function(String message)? error,
  }) {
    return loaded?.call(workspaces, hasNext, nextCursor);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<Workspace> workspaces, bool hasNext, int? nextCursor)?
    loaded,
    TResult Function(List<Workspace> workspaces)? loadingMore,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (loaded != null) {
      return loaded(workspaces, hasNext, nextCursor);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceInitial value) initial,
    required TResult Function(WorkspaceLoading value) loading,
    required TResult Function(WorkspaceLoaded value) loaded,
    required TResult Function(WorkspaceLoadingMore value) loadingMore,
    required TResult Function(WorkspaceError value) error,
  }) {
    return loaded(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceInitial value)? initial,
    TResult? Function(WorkspaceLoading value)? loading,
    TResult? Function(WorkspaceLoaded value)? loaded,
    TResult? Function(WorkspaceLoadingMore value)? loadingMore,
    TResult? Function(WorkspaceError value)? error,
  }) {
    return loaded?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceInitial value)? initial,
    TResult Function(WorkspaceLoading value)? loading,
    TResult Function(WorkspaceLoaded value)? loaded,
    TResult Function(WorkspaceLoadingMore value)? loadingMore,
    TResult Function(WorkspaceError value)? error,
    required TResult orElse(),
  }) {
    if (loaded != null) {
      return loaded(this);
    }
    return orElse();
  }
}

abstract class WorkspaceLoaded implements WorkspaceState {
  const factory WorkspaceLoaded({
    required final List<Workspace> workspaces,
    required final bool hasNext,
    final int? nextCursor,
  }) = _$WorkspaceLoadedImpl;

  List<Workspace> get workspaces;
  bool get hasNext;
  int? get nextCursor;

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceLoadedImplCopyWith<_$WorkspaceLoadedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$WorkspaceLoadingMoreImplCopyWith<$Res> {
  factory _$$WorkspaceLoadingMoreImplCopyWith(
    _$WorkspaceLoadingMoreImpl value,
    $Res Function(_$WorkspaceLoadingMoreImpl) then,
  ) = __$$WorkspaceLoadingMoreImplCopyWithImpl<$Res>;
  @useResult
  $Res call({List<Workspace> workspaces});
}

/// @nodoc
class __$$WorkspaceLoadingMoreImplCopyWithImpl<$Res>
    extends _$WorkspaceStateCopyWithImpl<$Res, _$WorkspaceLoadingMoreImpl>
    implements _$$WorkspaceLoadingMoreImplCopyWith<$Res> {
  __$$WorkspaceLoadingMoreImplCopyWithImpl(
    _$WorkspaceLoadingMoreImpl _value,
    $Res Function(_$WorkspaceLoadingMoreImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? workspaces = null}) {
    return _then(
      _$WorkspaceLoadingMoreImpl(
        workspaces:
            null == workspaces
                ? _value._workspaces
                : workspaces // ignore: cast_nullable_to_non_nullable
                    as List<Workspace>,
      ),
    );
  }
}

/// @nodoc

class _$WorkspaceLoadingMoreImpl implements WorkspaceLoadingMore {
  const _$WorkspaceLoadingMoreImpl({required final List<Workspace> workspaces})
    : _workspaces = workspaces;

  final List<Workspace> _workspaces;
  @override
  List<Workspace> get workspaces {
    if (_workspaces is EqualUnmodifiableListView) return _workspaces;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_workspaces);
  }

  @override
  String toString() {
    return 'WorkspaceState.loadingMore(workspaces: $workspaces)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceLoadingMoreImpl &&
            const DeepCollectionEquality().equals(
              other._workspaces,
              _workspaces,
            ));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_workspaces),
  );

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceLoadingMoreImplCopyWith<_$WorkspaceLoadingMoreImpl>
  get copyWith =>
      __$$WorkspaceLoadingMoreImplCopyWithImpl<_$WorkspaceLoadingMoreImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )
    loaded,
    required TResult Function(List<Workspace> workspaces) loadingMore,
    required TResult Function(String message) error,
  }) {
    return loadingMore(workspaces);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )?
    loaded,
    TResult? Function(List<Workspace> workspaces)? loadingMore,
    TResult? Function(String message)? error,
  }) {
    return loadingMore?.call(workspaces);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<Workspace> workspaces, bool hasNext, int? nextCursor)?
    loaded,
    TResult Function(List<Workspace> workspaces)? loadingMore,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (loadingMore != null) {
      return loadingMore(workspaces);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceInitial value) initial,
    required TResult Function(WorkspaceLoading value) loading,
    required TResult Function(WorkspaceLoaded value) loaded,
    required TResult Function(WorkspaceLoadingMore value) loadingMore,
    required TResult Function(WorkspaceError value) error,
  }) {
    return loadingMore(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceInitial value)? initial,
    TResult? Function(WorkspaceLoading value)? loading,
    TResult? Function(WorkspaceLoaded value)? loaded,
    TResult? Function(WorkspaceLoadingMore value)? loadingMore,
    TResult? Function(WorkspaceError value)? error,
  }) {
    return loadingMore?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceInitial value)? initial,
    TResult Function(WorkspaceLoading value)? loading,
    TResult Function(WorkspaceLoaded value)? loaded,
    TResult Function(WorkspaceLoadingMore value)? loadingMore,
    TResult Function(WorkspaceError value)? error,
    required TResult orElse(),
  }) {
    if (loadingMore != null) {
      return loadingMore(this);
    }
    return orElse();
  }
}

abstract class WorkspaceLoadingMore implements WorkspaceState {
  const factory WorkspaceLoadingMore({
    required final List<Workspace> workspaces,
  }) = _$WorkspaceLoadingMoreImpl;

  List<Workspace> get workspaces;

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceLoadingMoreImplCopyWith<_$WorkspaceLoadingMoreImpl>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$WorkspaceErrorImplCopyWith<$Res> {
  factory _$$WorkspaceErrorImplCopyWith(
    _$WorkspaceErrorImpl value,
    $Res Function(_$WorkspaceErrorImpl) then,
  ) = __$$WorkspaceErrorImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String message});
}

/// @nodoc
class __$$WorkspaceErrorImplCopyWithImpl<$Res>
    extends _$WorkspaceStateCopyWithImpl<$Res, _$WorkspaceErrorImpl>
    implements _$$WorkspaceErrorImplCopyWith<$Res> {
  __$$WorkspaceErrorImplCopyWithImpl(
    _$WorkspaceErrorImpl _value,
    $Res Function(_$WorkspaceErrorImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? message = null}) {
    return _then(
      _$WorkspaceErrorImpl(
        message:
            null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String,
      ),
    );
  }
}

/// @nodoc

class _$WorkspaceErrorImpl implements WorkspaceError {
  const _$WorkspaceErrorImpl({required this.message});

  @override
  final String message;

  @override
  String toString() {
    return 'WorkspaceState.error(message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceErrorImpl &&
            (identical(other.message, message) || other.message == message));
  }

  @override
  int get hashCode => Object.hash(runtimeType, message);

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceErrorImplCopyWith<_$WorkspaceErrorImpl> get copyWith =>
      __$$WorkspaceErrorImplCopyWithImpl<_$WorkspaceErrorImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )
    loaded,
    required TResult Function(List<Workspace> workspaces) loadingMore,
    required TResult Function(String message) error,
  }) {
    return error(message);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(
      List<Workspace> workspaces,
      bool hasNext,
      int? nextCursor,
    )?
    loaded,
    TResult? Function(List<Workspace> workspaces)? loadingMore,
    TResult? Function(String message)? error,
  }) {
    return error?.call(message);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<Workspace> workspaces, bool hasNext, int? nextCursor)?
    loaded,
    TResult Function(List<Workspace> workspaces)? loadingMore,
    TResult Function(String message)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(message);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(WorkspaceInitial value) initial,
    required TResult Function(WorkspaceLoading value) loading,
    required TResult Function(WorkspaceLoaded value) loaded,
    required TResult Function(WorkspaceLoadingMore value) loadingMore,
    required TResult Function(WorkspaceError value) error,
  }) {
    return error(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(WorkspaceInitial value)? initial,
    TResult? Function(WorkspaceLoading value)? loading,
    TResult? Function(WorkspaceLoaded value)? loaded,
    TResult? Function(WorkspaceLoadingMore value)? loadingMore,
    TResult? Function(WorkspaceError value)? error,
  }) {
    return error?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(WorkspaceInitial value)? initial,
    TResult Function(WorkspaceLoading value)? loading,
    TResult Function(WorkspaceLoaded value)? loaded,
    TResult Function(WorkspaceLoadingMore value)? loadingMore,
    TResult Function(WorkspaceError value)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this);
    }
    return orElse();
  }
}

abstract class WorkspaceError implements WorkspaceState {
  const factory WorkspaceError({required final String message}) =
      _$WorkspaceErrorImpl;

  String get message;

  /// Create a copy of WorkspaceState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceErrorImplCopyWith<_$WorkspaceErrorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
