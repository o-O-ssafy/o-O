// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'record_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordState {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordStateCopyWith<$Res> {
  factory $RecordStateCopyWith(
    RecordState value,
    $Res Function(RecordState) then,
  ) = _$RecordStateCopyWithImpl<$Res, RecordState>;
}

/// @nodoc
class _$RecordStateCopyWithImpl<$Res, $Val extends RecordState>
    implements $RecordStateCopyWith<$Res> {
  _$RecordStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$RecordInitialImplCopyWith<$Res> {
  factory _$$RecordInitialImplCopyWith(
    _$RecordInitialImpl value,
    $Res Function(_$RecordInitialImpl) then,
  ) = __$$RecordInitialImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordInitialImplCopyWithImpl<$Res>
    extends _$RecordStateCopyWithImpl<$Res, _$RecordInitialImpl>
    implements _$$RecordInitialImplCopyWith<$Res> {
  __$$RecordInitialImplCopyWithImpl(
    _$RecordInitialImpl _value,
    $Res Function(_$RecordInitialImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordInitialImpl implements RecordInitial {
  const _$RecordInitialImpl();

  @override
  String toString() {
    return 'RecordState.initial()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordInitialImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) {
    return initial();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) {
    return initial?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
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
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) {
    return initial(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) {
    return initial?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) {
    if (initial != null) {
      return initial(this);
    }
    return orElse();
  }
}

abstract class RecordInitial implements RecordState {
  const factory RecordInitial() = _$RecordInitialImpl;
}

/// @nodoc
abstract class _$$RecordLoadingImplCopyWith<$Res> {
  factory _$$RecordLoadingImplCopyWith(
    _$RecordLoadingImpl value,
    $Res Function(_$RecordLoadingImpl) then,
  ) = __$$RecordLoadingImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordLoadingImplCopyWithImpl<$Res>
    extends _$RecordStateCopyWithImpl<$Res, _$RecordLoadingImpl>
    implements _$$RecordLoadingImplCopyWith<$Res> {
  __$$RecordLoadingImplCopyWithImpl(
    _$RecordLoadingImpl _value,
    $Res Function(_$RecordLoadingImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordLoadingImpl implements RecordLoading {
  const _$RecordLoadingImpl();

  @override
  String toString() {
    return 'RecordState.loading()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordLoadingImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) {
    return loading();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) {
    return loading?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
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
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) {
    return loading(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) {
    return loading?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) {
    if (loading != null) {
      return loading(this);
    }
    return orElse();
  }
}

abstract class RecordLoading implements RecordState {
  const factory RecordLoading() = _$RecordLoadingImpl;
}

/// @nodoc
abstract class _$$RecordLoadedImplCopyWith<$Res> {
  factory _$$RecordLoadedImplCopyWith(
    _$RecordLoadedImpl value,
    $Res Function(_$RecordLoadedImpl) then,
  ) = __$$RecordLoadedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({List<RecordEntity> records});
}

/// @nodoc
class __$$RecordLoadedImplCopyWithImpl<$Res>
    extends _$RecordStateCopyWithImpl<$Res, _$RecordLoadedImpl>
    implements _$$RecordLoadedImplCopyWith<$Res> {
  __$$RecordLoadedImplCopyWithImpl(
    _$RecordLoadedImpl _value,
    $Res Function(_$RecordLoadedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? records = null}) {
    return _then(
      _$RecordLoadedImpl(
        records:
            null == records
                ? _value._records
                : records // ignore: cast_nullable_to_non_nullable
                    as List<RecordEntity>,
      ),
    );
  }
}

/// @nodoc

class _$RecordLoadedImpl implements RecordLoaded {
  const _$RecordLoadedImpl({required final List<RecordEntity> records})
    : _records = records;

  final List<RecordEntity> _records;
  @override
  List<RecordEntity> get records {
    if (_records is EqualUnmodifiableListView) return _records;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_records);
  }

  @override
  String toString() {
    return 'RecordState.loaded(records: $records)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordLoadedImpl &&
            const DeepCollectionEquality().equals(other._records, _records));
  }

  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_records));

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordLoadedImplCopyWith<_$RecordLoadedImpl> get copyWith =>
      __$$RecordLoadedImplCopyWithImpl<_$RecordLoadedImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) {
    return loaded(records);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) {
    return loaded?.call(records);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
    required TResult orElse(),
  }) {
    if (loaded != null) {
      return loaded(records);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) {
    return loaded(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) {
    return loaded?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) {
    if (loaded != null) {
      return loaded(this);
    }
    return orElse();
  }
}

abstract class RecordLoaded implements RecordState {
  const factory RecordLoaded({required final List<RecordEntity> records}) =
      _$RecordLoadedImpl;

  List<RecordEntity> get records;

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordLoadedImplCopyWith<_$RecordLoadedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$RecordDetailLoadedImplCopyWith<$Res> {
  factory _$$RecordDetailLoadedImplCopyWith(
    _$RecordDetailLoadedImpl value,
    $Res Function(_$RecordDetailLoadedImpl) then,
  ) = __$$RecordDetailLoadedImplCopyWithImpl<$Res>;
  @useResult
  $Res call({RecordEntity record});

  $RecordEntityCopyWith<$Res> get record;
}

/// @nodoc
class __$$RecordDetailLoadedImplCopyWithImpl<$Res>
    extends _$RecordStateCopyWithImpl<$Res, _$RecordDetailLoadedImpl>
    implements _$$RecordDetailLoadedImplCopyWith<$Res> {
  __$$RecordDetailLoadedImplCopyWithImpl(
    _$RecordDetailLoadedImpl _value,
    $Res Function(_$RecordDetailLoadedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? record = null}) {
    return _then(
      _$RecordDetailLoadedImpl(
        record:
            null == record
                ? _value.record
                : record // ignore: cast_nullable_to_non_nullable
                    as RecordEntity,
      ),
    );
  }

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RecordEntityCopyWith<$Res> get record {
    return $RecordEntityCopyWith<$Res>(_value.record, (value) {
      return _then(_value.copyWith(record: value));
    });
  }
}

/// @nodoc

class _$RecordDetailLoadedImpl implements RecordDetailLoaded {
  const _$RecordDetailLoadedImpl({required this.record});

  @override
  final RecordEntity record;

  @override
  String toString() {
    return 'RecordState.detailLoaded(record: $record)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordDetailLoadedImpl &&
            (identical(other.record, record) || other.record == record));
  }

  @override
  int get hashCode => Object.hash(runtimeType, record);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordDetailLoadedImplCopyWith<_$RecordDetailLoadedImpl> get copyWith =>
      __$$RecordDetailLoadedImplCopyWithImpl<_$RecordDetailLoadedImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) {
    return detailLoaded(record);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) {
    return detailLoaded?.call(record);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
    required TResult orElse(),
  }) {
    if (detailLoaded != null) {
      return detailLoaded(record);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) {
    return detailLoaded(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) {
    return detailLoaded?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) {
    if (detailLoaded != null) {
      return detailLoaded(this);
    }
    return orElse();
  }
}

abstract class RecordDetailLoaded implements RecordState {
  const factory RecordDetailLoaded({required final RecordEntity record}) =
      _$RecordDetailLoadedImpl;

  RecordEntity get record;

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordDetailLoadedImplCopyWith<_$RecordDetailLoadedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$RecordDeletedImplCopyWith<$Res> {
  factory _$$RecordDeletedImplCopyWith(
    _$RecordDeletedImpl value,
    $Res Function(_$RecordDeletedImpl) then,
  ) = __$$RecordDeletedImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordDeletedImplCopyWithImpl<$Res>
    extends _$RecordStateCopyWithImpl<$Res, _$RecordDeletedImpl>
    implements _$$RecordDeletedImplCopyWith<$Res> {
  __$$RecordDeletedImplCopyWithImpl(
    _$RecordDeletedImpl _value,
    $Res Function(_$RecordDeletedImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordDeletedImpl implements RecordDeleted {
  const _$RecordDeletedImpl();

  @override
  String toString() {
    return 'RecordState.deleted()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordDeletedImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) {
    return deleted();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) {
    return deleted?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
    required TResult orElse(),
  }) {
    if (deleted != null) {
      return deleted();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) {
    return deleted(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) {
    return deleted?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) {
    if (deleted != null) {
      return deleted(this);
    }
    return orElse();
  }
}

abstract class RecordDeleted implements RecordState {
  const factory RecordDeleted() = _$RecordDeletedImpl;
}

/// @nodoc
abstract class _$$RecordErrorImplCopyWith<$Res> {
  factory _$$RecordErrorImplCopyWith(
    _$RecordErrorImpl value,
    $Res Function(_$RecordErrorImpl) then,
  ) = __$$RecordErrorImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String message, String? errorCode});
}

/// @nodoc
class __$$RecordErrorImplCopyWithImpl<$Res>
    extends _$RecordStateCopyWithImpl<$Res, _$RecordErrorImpl>
    implements _$$RecordErrorImplCopyWith<$Res> {
  __$$RecordErrorImplCopyWithImpl(
    _$RecordErrorImpl _value,
    $Res Function(_$RecordErrorImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? message = null, Object? errorCode = freezed}) {
    return _then(
      _$RecordErrorImpl(
        message:
            null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                    as String,
        errorCode:
            freezed == errorCode
                ? _value.errorCode
                : errorCode // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc

class _$RecordErrorImpl implements RecordError {
  const _$RecordErrorImpl({required this.message, this.errorCode});

  @override
  final String message;
  @override
  final String? errorCode;

  @override
  String toString() {
    return 'RecordState.error(message: $message, errorCode: $errorCode)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordErrorImpl &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.errorCode, errorCode) ||
                other.errorCode == errorCode));
  }

  @override
  int get hashCode => Object.hash(runtimeType, message, errorCode);

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordErrorImplCopyWith<_$RecordErrorImpl> get copyWith =>
      __$$RecordErrorImplCopyWithImpl<_$RecordErrorImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() initial,
    required TResult Function() loading,
    required TResult Function(List<RecordEntity> records) loaded,
    required TResult Function(RecordEntity record) detailLoaded,
    required TResult Function() deleted,
    required TResult Function(String message, String? errorCode) error,
  }) {
    return error(message, errorCode);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? initial,
    TResult? Function()? loading,
    TResult? Function(List<RecordEntity> records)? loaded,
    TResult? Function(RecordEntity record)? detailLoaded,
    TResult? Function()? deleted,
    TResult? Function(String message, String? errorCode)? error,
  }) {
    return error?.call(message, errorCode);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? initial,
    TResult Function()? loading,
    TResult Function(List<RecordEntity> records)? loaded,
    TResult Function(RecordEntity record)? detailLoaded,
    TResult Function()? deleted,
    TResult Function(String message, String? errorCode)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(message, errorCode);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordInitial value) initial,
    required TResult Function(RecordLoading value) loading,
    required TResult Function(RecordLoaded value) loaded,
    required TResult Function(RecordDetailLoaded value) detailLoaded,
    required TResult Function(RecordDeleted value) deleted,
    required TResult Function(RecordError value) error,
  }) {
    return error(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordInitial value)? initial,
    TResult? Function(RecordLoading value)? loading,
    TResult? Function(RecordLoaded value)? loaded,
    TResult? Function(RecordDetailLoaded value)? detailLoaded,
    TResult? Function(RecordDeleted value)? deleted,
    TResult? Function(RecordError value)? error,
  }) {
    return error?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordInitial value)? initial,
    TResult Function(RecordLoading value)? loading,
    TResult Function(RecordLoaded value)? loaded,
    TResult Function(RecordDetailLoaded value)? detailLoaded,
    TResult Function(RecordDeleted value)? deleted,
    TResult Function(RecordError value)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this);
    }
    return orElse();
  }
}

abstract class RecordError implements RecordState {
  const factory RecordError({
    required final String message,
    final String? errorCode,
  }) = _$RecordErrorImpl;

  String get message;
  String? get errorCode;

  /// Create a copy of RecordState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordErrorImplCopyWith<_$RecordErrorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
