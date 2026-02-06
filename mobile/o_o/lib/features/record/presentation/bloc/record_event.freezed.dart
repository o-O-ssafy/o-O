// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'record_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() getRecords,
    required TResult Function(int id) getRecord,
    required TResult Function(int id) deleteRecord,
    required TResult Function() refreshRecords,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? getRecords,
    TResult? Function(int id)? getRecord,
    TResult? Function(int id)? deleteRecord,
    TResult? Function()? refreshRecords,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? getRecords,
    TResult Function(int id)? getRecord,
    TResult Function(int id)? deleteRecord,
    TResult Function()? refreshRecords,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetRecordsEvent value) getRecords,
    required TResult Function(GetRecordEvent value) getRecord,
    required TResult Function(DeleteRecordEvent value) deleteRecord,
    required TResult Function(RefreshRecordsEvent value) refreshRecords,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetRecordsEvent value)? getRecords,
    TResult? Function(GetRecordEvent value)? getRecord,
    TResult? Function(DeleteRecordEvent value)? deleteRecord,
    TResult? Function(RefreshRecordsEvent value)? refreshRecords,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetRecordsEvent value)? getRecords,
    TResult Function(GetRecordEvent value)? getRecord,
    TResult Function(DeleteRecordEvent value)? deleteRecord,
    TResult Function(RefreshRecordsEvent value)? refreshRecords,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordEventCopyWith<$Res> {
  factory $RecordEventCopyWith(
    RecordEvent value,
    $Res Function(RecordEvent) then,
  ) = _$RecordEventCopyWithImpl<$Res, RecordEvent>;
}

/// @nodoc
class _$RecordEventCopyWithImpl<$Res, $Val extends RecordEvent>
    implements $RecordEventCopyWith<$Res> {
  _$RecordEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$GetRecordsEventImplCopyWith<$Res> {
  factory _$$GetRecordsEventImplCopyWith(
    _$GetRecordsEventImpl value,
    $Res Function(_$GetRecordsEventImpl) then,
  ) = __$$GetRecordsEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$GetRecordsEventImplCopyWithImpl<$Res>
    extends _$RecordEventCopyWithImpl<$Res, _$GetRecordsEventImpl>
    implements _$$GetRecordsEventImplCopyWith<$Res> {
  __$$GetRecordsEventImplCopyWithImpl(
    _$GetRecordsEventImpl _value,
    $Res Function(_$GetRecordsEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$GetRecordsEventImpl implements GetRecordsEvent {
  const _$GetRecordsEventImpl();

  @override
  String toString() {
    return 'RecordEvent.getRecords()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$GetRecordsEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() getRecords,
    required TResult Function(int id) getRecord,
    required TResult Function(int id) deleteRecord,
    required TResult Function() refreshRecords,
  }) {
    return getRecords();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? getRecords,
    TResult? Function(int id)? getRecord,
    TResult? Function(int id)? deleteRecord,
    TResult? Function()? refreshRecords,
  }) {
    return getRecords?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? getRecords,
    TResult Function(int id)? getRecord,
    TResult Function(int id)? deleteRecord,
    TResult Function()? refreshRecords,
    required TResult orElse(),
  }) {
    if (getRecords != null) {
      return getRecords();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetRecordsEvent value) getRecords,
    required TResult Function(GetRecordEvent value) getRecord,
    required TResult Function(DeleteRecordEvent value) deleteRecord,
    required TResult Function(RefreshRecordsEvent value) refreshRecords,
  }) {
    return getRecords(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetRecordsEvent value)? getRecords,
    TResult? Function(GetRecordEvent value)? getRecord,
    TResult? Function(DeleteRecordEvent value)? deleteRecord,
    TResult? Function(RefreshRecordsEvent value)? refreshRecords,
  }) {
    return getRecords?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetRecordsEvent value)? getRecords,
    TResult Function(GetRecordEvent value)? getRecord,
    TResult Function(DeleteRecordEvent value)? deleteRecord,
    TResult Function(RefreshRecordsEvent value)? refreshRecords,
    required TResult orElse(),
  }) {
    if (getRecords != null) {
      return getRecords(this);
    }
    return orElse();
  }
}

abstract class GetRecordsEvent implements RecordEvent {
  const factory GetRecordsEvent() = _$GetRecordsEventImpl;
}

/// @nodoc
abstract class _$$GetRecordEventImplCopyWith<$Res> {
  factory _$$GetRecordEventImplCopyWith(
    _$GetRecordEventImpl value,
    $Res Function(_$GetRecordEventImpl) then,
  ) = __$$GetRecordEventImplCopyWithImpl<$Res>;
  @useResult
  $Res call({int id});
}

/// @nodoc
class __$$GetRecordEventImplCopyWithImpl<$Res>
    extends _$RecordEventCopyWithImpl<$Res, _$GetRecordEventImpl>
    implements _$$GetRecordEventImplCopyWith<$Res> {
  __$$GetRecordEventImplCopyWithImpl(
    _$GetRecordEventImpl _value,
    $Res Function(_$GetRecordEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null}) {
    return _then(
      _$GetRecordEventImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as int,
      ),
    );
  }
}

/// @nodoc

class _$GetRecordEventImpl implements GetRecordEvent {
  const _$GetRecordEventImpl({required this.id});

  @override
  final int id;

  @override
  String toString() {
    return 'RecordEvent.getRecord(id: $id)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GetRecordEventImpl &&
            (identical(other.id, id) || other.id == id));
  }

  @override
  int get hashCode => Object.hash(runtimeType, id);

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GetRecordEventImplCopyWith<_$GetRecordEventImpl> get copyWith =>
      __$$GetRecordEventImplCopyWithImpl<_$GetRecordEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() getRecords,
    required TResult Function(int id) getRecord,
    required TResult Function(int id) deleteRecord,
    required TResult Function() refreshRecords,
  }) {
    return getRecord(id);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? getRecords,
    TResult? Function(int id)? getRecord,
    TResult? Function(int id)? deleteRecord,
    TResult? Function()? refreshRecords,
  }) {
    return getRecord?.call(id);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? getRecords,
    TResult Function(int id)? getRecord,
    TResult Function(int id)? deleteRecord,
    TResult Function()? refreshRecords,
    required TResult orElse(),
  }) {
    if (getRecord != null) {
      return getRecord(id);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetRecordsEvent value) getRecords,
    required TResult Function(GetRecordEvent value) getRecord,
    required TResult Function(DeleteRecordEvent value) deleteRecord,
    required TResult Function(RefreshRecordsEvent value) refreshRecords,
  }) {
    return getRecord(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetRecordsEvent value)? getRecords,
    TResult? Function(GetRecordEvent value)? getRecord,
    TResult? Function(DeleteRecordEvent value)? deleteRecord,
    TResult? Function(RefreshRecordsEvent value)? refreshRecords,
  }) {
    return getRecord?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetRecordsEvent value)? getRecords,
    TResult Function(GetRecordEvent value)? getRecord,
    TResult Function(DeleteRecordEvent value)? deleteRecord,
    TResult Function(RefreshRecordsEvent value)? refreshRecords,
    required TResult orElse(),
  }) {
    if (getRecord != null) {
      return getRecord(this);
    }
    return orElse();
  }
}

abstract class GetRecordEvent implements RecordEvent {
  const factory GetRecordEvent({required final int id}) = _$GetRecordEventImpl;

  int get id;

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GetRecordEventImplCopyWith<_$GetRecordEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$DeleteRecordEventImplCopyWith<$Res> {
  factory _$$DeleteRecordEventImplCopyWith(
    _$DeleteRecordEventImpl value,
    $Res Function(_$DeleteRecordEventImpl) then,
  ) = __$$DeleteRecordEventImplCopyWithImpl<$Res>;
  @useResult
  $Res call({int id});
}

/// @nodoc
class __$$DeleteRecordEventImplCopyWithImpl<$Res>
    extends _$RecordEventCopyWithImpl<$Res, _$DeleteRecordEventImpl>
    implements _$$DeleteRecordEventImplCopyWith<$Res> {
  __$$DeleteRecordEventImplCopyWithImpl(
    _$DeleteRecordEventImpl _value,
    $Res Function(_$DeleteRecordEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null}) {
    return _then(
      _$DeleteRecordEventImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as int,
      ),
    );
  }
}

/// @nodoc

class _$DeleteRecordEventImpl implements DeleteRecordEvent {
  const _$DeleteRecordEventImpl({required this.id});

  @override
  final int id;

  @override
  String toString() {
    return 'RecordEvent.deleteRecord(id: $id)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DeleteRecordEventImpl &&
            (identical(other.id, id) || other.id == id));
  }

  @override
  int get hashCode => Object.hash(runtimeType, id);

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DeleteRecordEventImplCopyWith<_$DeleteRecordEventImpl> get copyWith =>
      __$$DeleteRecordEventImplCopyWithImpl<_$DeleteRecordEventImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() getRecords,
    required TResult Function(int id) getRecord,
    required TResult Function(int id) deleteRecord,
    required TResult Function() refreshRecords,
  }) {
    return deleteRecord(id);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? getRecords,
    TResult? Function(int id)? getRecord,
    TResult? Function(int id)? deleteRecord,
    TResult? Function()? refreshRecords,
  }) {
    return deleteRecord?.call(id);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? getRecords,
    TResult Function(int id)? getRecord,
    TResult Function(int id)? deleteRecord,
    TResult Function()? refreshRecords,
    required TResult orElse(),
  }) {
    if (deleteRecord != null) {
      return deleteRecord(id);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetRecordsEvent value) getRecords,
    required TResult Function(GetRecordEvent value) getRecord,
    required TResult Function(DeleteRecordEvent value) deleteRecord,
    required TResult Function(RefreshRecordsEvent value) refreshRecords,
  }) {
    return deleteRecord(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetRecordsEvent value)? getRecords,
    TResult? Function(GetRecordEvent value)? getRecord,
    TResult? Function(DeleteRecordEvent value)? deleteRecord,
    TResult? Function(RefreshRecordsEvent value)? refreshRecords,
  }) {
    return deleteRecord?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetRecordsEvent value)? getRecords,
    TResult Function(GetRecordEvent value)? getRecord,
    TResult Function(DeleteRecordEvent value)? deleteRecord,
    TResult Function(RefreshRecordsEvent value)? refreshRecords,
    required TResult orElse(),
  }) {
    if (deleteRecord != null) {
      return deleteRecord(this);
    }
    return orElse();
  }
}

abstract class DeleteRecordEvent implements RecordEvent {
  const factory DeleteRecordEvent({required final int id}) =
      _$DeleteRecordEventImpl;

  int get id;

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DeleteRecordEventImplCopyWith<_$DeleteRecordEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$RefreshRecordsEventImplCopyWith<$Res> {
  factory _$$RefreshRecordsEventImplCopyWith(
    _$RefreshRecordsEventImpl value,
    $Res Function(_$RefreshRecordsEventImpl) then,
  ) = __$$RefreshRecordsEventImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RefreshRecordsEventImplCopyWithImpl<$Res>
    extends _$RecordEventCopyWithImpl<$Res, _$RefreshRecordsEventImpl>
    implements _$$RefreshRecordsEventImplCopyWith<$Res> {
  __$$RefreshRecordsEventImplCopyWithImpl(
    _$RefreshRecordsEventImpl _value,
    $Res Function(_$RefreshRecordsEventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RefreshRecordsEventImpl implements RefreshRecordsEvent {
  const _$RefreshRecordsEventImpl();

  @override
  String toString() {
    return 'RecordEvent.refreshRecords()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RefreshRecordsEventImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() getRecords,
    required TResult Function(int id) getRecord,
    required TResult Function(int id) deleteRecord,
    required TResult Function() refreshRecords,
  }) {
    return refreshRecords();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? getRecords,
    TResult? Function(int id)? getRecord,
    TResult? Function(int id)? deleteRecord,
    TResult? Function()? refreshRecords,
  }) {
    return refreshRecords?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? getRecords,
    TResult Function(int id)? getRecord,
    TResult Function(int id)? deleteRecord,
    TResult Function()? refreshRecords,
    required TResult orElse(),
  }) {
    if (refreshRecords != null) {
      return refreshRecords();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(GetRecordsEvent value) getRecords,
    required TResult Function(GetRecordEvent value) getRecord,
    required TResult Function(DeleteRecordEvent value) deleteRecord,
    required TResult Function(RefreshRecordsEvent value) refreshRecords,
  }) {
    return refreshRecords(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(GetRecordsEvent value)? getRecords,
    TResult? Function(GetRecordEvent value)? getRecord,
    TResult? Function(DeleteRecordEvent value)? deleteRecord,
    TResult? Function(RefreshRecordsEvent value)? refreshRecords,
  }) {
    return refreshRecords?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(GetRecordsEvent value)? getRecords,
    TResult Function(GetRecordEvent value)? getRecord,
    TResult Function(DeleteRecordEvent value)? deleteRecord,
    TResult Function(RefreshRecordsEvent value)? refreshRecords,
    required TResult orElse(),
  }) {
    if (refreshRecords != null) {
      return refreshRecords(this);
    }
    return orElse();
  }
}

abstract class RefreshRecordsEvent implements RecordEvent {
  const factory RefreshRecordsEvent() = _$RefreshRecordsEventImpl;
}
