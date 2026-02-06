// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'record_entity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordEntity {
  int get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String? get startPrompt => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  String? get thumbnail => throw _privateConstructorUsedError;
  String? get visibility => throw _privateConstructorUsedError;
  int? get mindmapId => throw _privateConstructorUsedError;

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecordEntityCopyWith<RecordEntity> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordEntityCopyWith<$Res> {
  factory $RecordEntityCopyWith(
    RecordEntity value,
    $Res Function(RecordEntity) then,
  ) = _$RecordEntityCopyWithImpl<$Res, RecordEntity>;
  @useResult
  $Res call({
    int id,
    String title,
    String? startPrompt,
    DateTime createdAt,
    String? thumbnail,
    String? visibility,
    int? mindmapId,
  });
}

/// @nodoc
class _$RecordEntityCopyWithImpl<$Res, $Val extends RecordEntity>
    implements $RecordEntityCopyWith<$Res> {
  _$RecordEntityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? startPrompt = freezed,
    Object? createdAt = null,
    Object? thumbnail = freezed,
    Object? visibility = freezed,
    Object? mindmapId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id:
                null == id
                    ? _value.id
                    : id // ignore: cast_nullable_to_non_nullable
                        as int,
            title:
                null == title
                    ? _value.title
                    : title // ignore: cast_nullable_to_non_nullable
                        as String,
            startPrompt:
                freezed == startPrompt
                    ? _value.startPrompt
                    : startPrompt // ignore: cast_nullable_to_non_nullable
                        as String?,
            createdAt:
                null == createdAt
                    ? _value.createdAt
                    : createdAt // ignore: cast_nullable_to_non_nullable
                        as DateTime,
            thumbnail:
                freezed == thumbnail
                    ? _value.thumbnail
                    : thumbnail // ignore: cast_nullable_to_non_nullable
                        as String?,
            visibility:
                freezed == visibility
                    ? _value.visibility
                    : visibility // ignore: cast_nullable_to_non_nullable
                        as String?,
            mindmapId:
                freezed == mindmapId
                    ? _value.mindmapId
                    : mindmapId // ignore: cast_nullable_to_non_nullable
                        as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RecordEntityImplCopyWith<$Res>
    implements $RecordEntityCopyWith<$Res> {
  factory _$$RecordEntityImplCopyWith(
    _$RecordEntityImpl value,
    $Res Function(_$RecordEntityImpl) then,
  ) = __$$RecordEntityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String title,
    String? startPrompt,
    DateTime createdAt,
    String? thumbnail,
    String? visibility,
    int? mindmapId,
  });
}

/// @nodoc
class __$$RecordEntityImplCopyWithImpl<$Res>
    extends _$RecordEntityCopyWithImpl<$Res, _$RecordEntityImpl>
    implements _$$RecordEntityImplCopyWith<$Res> {
  __$$RecordEntityImplCopyWithImpl(
    _$RecordEntityImpl _value,
    $Res Function(_$RecordEntityImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? startPrompt = freezed,
    Object? createdAt = null,
    Object? thumbnail = freezed,
    Object? visibility = freezed,
    Object? mindmapId = freezed,
  }) {
    return _then(
      _$RecordEntityImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as int,
        title:
            null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                    as String,
        startPrompt:
            freezed == startPrompt
                ? _value.startPrompt
                : startPrompt // ignore: cast_nullable_to_non_nullable
                    as String?,
        createdAt:
            null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                    as DateTime,
        thumbnail:
            freezed == thumbnail
                ? _value.thumbnail
                : thumbnail // ignore: cast_nullable_to_non_nullable
                    as String?,
        visibility:
            freezed == visibility
                ? _value.visibility
                : visibility // ignore: cast_nullable_to_non_nullable
                    as String?,
        mindmapId:
            freezed == mindmapId
                ? _value.mindmapId
                : mindmapId // ignore: cast_nullable_to_non_nullable
                    as int?,
      ),
    );
  }
}

/// @nodoc

class _$RecordEntityImpl extends _RecordEntity {
  const _$RecordEntityImpl({
    required this.id,
    required this.title,
    this.startPrompt,
    required this.createdAt,
    this.thumbnail,
    this.visibility,
    this.mindmapId,
  }) : super._();

  @override
  final int id;
  @override
  final String title;
  @override
  final String? startPrompt;
  @override
  final DateTime createdAt;
  @override
  final String? thumbnail;
  @override
  final String? visibility;
  @override
  final int? mindmapId;

  @override
  String toString() {
    return 'RecordEntity(id: $id, title: $title, startPrompt: $startPrompt, createdAt: $createdAt, thumbnail: $thumbnail, visibility: $visibility, mindmapId: $mindmapId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordEntityImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.startPrompt, startPrompt) ||
                other.startPrompt == startPrompt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.thumbnail, thumbnail) ||
                other.thumbnail == thumbnail) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility) &&
            (identical(other.mindmapId, mindmapId) ||
                other.mindmapId == mindmapId));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    startPrompt,
    createdAt,
    thumbnail,
    visibility,
    mindmapId,
  );

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordEntityImplCopyWith<_$RecordEntityImpl> get copyWith =>
      __$$RecordEntityImplCopyWithImpl<_$RecordEntityImpl>(this, _$identity);
}

abstract class _RecordEntity extends RecordEntity {
  const factory _RecordEntity({
    required final int id,
    required final String title,
    final String? startPrompt,
    required final DateTime createdAt,
    final String? thumbnail,
    final String? visibility,
    final int? mindmapId,
  }) = _$RecordEntityImpl;
  const _RecordEntity._() : super._();

  @override
  int get id;
  @override
  String get title;
  @override
  String? get startPrompt;
  @override
  DateTime get createdAt;
  @override
  String? get thumbnail;
  @override
  String? get visibility;
  @override
  int? get mindmapId;

  /// Create a copy of RecordEntity
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordEntityImplCopyWith<_$RecordEntityImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
