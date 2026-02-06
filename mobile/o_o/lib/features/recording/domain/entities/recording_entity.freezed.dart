// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recording_entity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordingEntity {
  bool get isRecording => throw _privateConstructorUsedError;
  String? get filePath => throw _privateConstructorUsedError;
  Duration? get duration => throw _privateConstructorUsedError;

  /// Create a copy of RecordingEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecordingEntityCopyWith<RecordingEntity> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordingEntityCopyWith<$Res> {
  factory $RecordingEntityCopyWith(
    RecordingEntity value,
    $Res Function(RecordingEntity) then,
  ) = _$RecordingEntityCopyWithImpl<$Res, RecordingEntity>;
  @useResult
  $Res call({bool isRecording, String? filePath, Duration? duration});
}

/// @nodoc
class _$RecordingEntityCopyWithImpl<$Res, $Val extends RecordingEntity>
    implements $RecordingEntityCopyWith<$Res> {
  _$RecordingEntityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordingEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isRecording = null,
    Object? filePath = freezed,
    Object? duration = freezed,
  }) {
    return _then(
      _value.copyWith(
            isRecording:
                null == isRecording
                    ? _value.isRecording
                    : isRecording // ignore: cast_nullable_to_non_nullable
                        as bool,
            filePath:
                freezed == filePath
                    ? _value.filePath
                    : filePath // ignore: cast_nullable_to_non_nullable
                        as String?,
            duration:
                freezed == duration
                    ? _value.duration
                    : duration // ignore: cast_nullable_to_non_nullable
                        as Duration?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RecordingEntityImplCopyWith<$Res>
    implements $RecordingEntityCopyWith<$Res> {
  factory _$$RecordingEntityImplCopyWith(
    _$RecordingEntityImpl value,
    $Res Function(_$RecordingEntityImpl) then,
  ) = __$$RecordingEntityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool isRecording, String? filePath, Duration? duration});
}

/// @nodoc
class __$$RecordingEntityImplCopyWithImpl<$Res>
    extends _$RecordingEntityCopyWithImpl<$Res, _$RecordingEntityImpl>
    implements _$$RecordingEntityImplCopyWith<$Res> {
  __$$RecordingEntityImplCopyWithImpl(
    _$RecordingEntityImpl _value,
    $Res Function(_$RecordingEntityImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isRecording = null,
    Object? filePath = freezed,
    Object? duration = freezed,
  }) {
    return _then(
      _$RecordingEntityImpl(
        isRecording:
            null == isRecording
                ? _value.isRecording
                : isRecording // ignore: cast_nullable_to_non_nullable
                    as bool,
        filePath:
            freezed == filePath
                ? _value.filePath
                : filePath // ignore: cast_nullable_to_non_nullable
                    as String?,
        duration:
            freezed == duration
                ? _value.duration
                : duration // ignore: cast_nullable_to_non_nullable
                    as Duration?,
      ),
    );
  }
}

/// @nodoc

class _$RecordingEntityImpl implements _RecordingEntity {
  const _$RecordingEntityImpl({
    required this.isRecording,
    this.filePath,
    this.duration,
  });

  @override
  final bool isRecording;
  @override
  final String? filePath;
  @override
  final Duration? duration;

  @override
  String toString() {
    return 'RecordingEntity(isRecording: $isRecording, filePath: $filePath, duration: $duration)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordingEntityImpl &&
            (identical(other.isRecording, isRecording) ||
                other.isRecording == isRecording) &&
            (identical(other.filePath, filePath) ||
                other.filePath == filePath) &&
            (identical(other.duration, duration) ||
                other.duration == duration));
  }

  @override
  int get hashCode => Object.hash(runtimeType, isRecording, filePath, duration);

  /// Create a copy of RecordingEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordingEntityImplCopyWith<_$RecordingEntityImpl> get copyWith =>
      __$$RecordingEntityImplCopyWithImpl<_$RecordingEntityImpl>(
        this,
        _$identity,
      );
}

abstract class _RecordingEntity implements RecordingEntity {
  const factory _RecordingEntity({
    required final bool isRecording,
    final String? filePath,
    final Duration? duration,
  }) = _$RecordingEntityImpl;

  @override
  bool get isRecording;
  @override
  String? get filePath;
  @override
  Duration? get duration;

  /// Create a copy of RecordingEntity
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordingEntityImplCopyWith<_$RecordingEntityImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
