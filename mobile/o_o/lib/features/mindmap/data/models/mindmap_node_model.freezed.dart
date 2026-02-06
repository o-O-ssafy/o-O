// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mindmap_node_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MindmapNodeModel _$MindmapNodeModelFromJson(Map<String, dynamic> json) {
  return _MindmapNodeModel.fromJson(json);
}

/// @nodoc
mixin _$MindmapNodeModel {
  String get id => throw _privateConstructorUsedError;
  int get nodeId => throw _privateConstructorUsedError;
  int get workspaceId => throw _privateConstructorUsedError;
  int? get parentId => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String get keyword => throw _privateConstructorUsedError;
  String? get memo => throw _privateConstructorUsedError;
  String get analysisStatus => throw _privateConstructorUsedError;
  double? get x => throw _privateConstructorUsedError;
  double? get y => throw _privateConstructorUsedError;
  String? get color => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this MindmapNodeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MindmapNodeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MindmapNodeModelCopyWith<MindmapNodeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MindmapNodeModelCopyWith<$Res> {
  factory $MindmapNodeModelCopyWith(
    MindmapNodeModel value,
    $Res Function(MindmapNodeModel) then,
  ) = _$MindmapNodeModelCopyWithImpl<$Res, MindmapNodeModel>;
  @useResult
  $Res call({
    String id,
    int nodeId,
    int workspaceId,
    int? parentId,
    String type,
    String keyword,
    String? memo,
    String analysisStatus,
    double? x,
    double? y,
    String? color,
    DateTime createdAt,
    DateTime updatedAt,
  });
}

/// @nodoc
class _$MindmapNodeModelCopyWithImpl<$Res, $Val extends MindmapNodeModel>
    implements $MindmapNodeModelCopyWith<$Res> {
  _$MindmapNodeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MindmapNodeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nodeId = null,
    Object? workspaceId = null,
    Object? parentId = freezed,
    Object? type = null,
    Object? keyword = null,
    Object? memo = freezed,
    Object? analysisStatus = null,
    Object? x = freezed,
    Object? y = freezed,
    Object? color = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _value.copyWith(
            id:
                null == id
                    ? _value.id
                    : id // ignore: cast_nullable_to_non_nullable
                        as String,
            nodeId:
                null == nodeId
                    ? _value.nodeId
                    : nodeId // ignore: cast_nullable_to_non_nullable
                        as int,
            workspaceId:
                null == workspaceId
                    ? _value.workspaceId
                    : workspaceId // ignore: cast_nullable_to_non_nullable
                        as int,
            parentId:
                freezed == parentId
                    ? _value.parentId
                    : parentId // ignore: cast_nullable_to_non_nullable
                        as int?,
            type:
                null == type
                    ? _value.type
                    : type // ignore: cast_nullable_to_non_nullable
                        as String,
            keyword:
                null == keyword
                    ? _value.keyword
                    : keyword // ignore: cast_nullable_to_non_nullable
                        as String,
            memo:
                freezed == memo
                    ? _value.memo
                    : memo // ignore: cast_nullable_to_non_nullable
                        as String?,
            analysisStatus:
                null == analysisStatus
                    ? _value.analysisStatus
                    : analysisStatus // ignore: cast_nullable_to_non_nullable
                        as String,
            x:
                freezed == x
                    ? _value.x
                    : x // ignore: cast_nullable_to_non_nullable
                        as double?,
            y:
                freezed == y
                    ? _value.y
                    : y // ignore: cast_nullable_to_non_nullable
                        as double?,
            color:
                freezed == color
                    ? _value.color
                    : color // ignore: cast_nullable_to_non_nullable
                        as String?,
            createdAt:
                null == createdAt
                    ? _value.createdAt
                    : createdAt // ignore: cast_nullable_to_non_nullable
                        as DateTime,
            updatedAt:
                null == updatedAt
                    ? _value.updatedAt
                    : updatedAt // ignore: cast_nullable_to_non_nullable
                        as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MindmapNodeModelImplCopyWith<$Res>
    implements $MindmapNodeModelCopyWith<$Res> {
  factory _$$MindmapNodeModelImplCopyWith(
    _$MindmapNodeModelImpl value,
    $Res Function(_$MindmapNodeModelImpl) then,
  ) = __$$MindmapNodeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    int nodeId,
    int workspaceId,
    int? parentId,
    String type,
    String keyword,
    String? memo,
    String analysisStatus,
    double? x,
    double? y,
    String? color,
    DateTime createdAt,
    DateTime updatedAt,
  });
}

/// @nodoc
class __$$MindmapNodeModelImplCopyWithImpl<$Res>
    extends _$MindmapNodeModelCopyWithImpl<$Res, _$MindmapNodeModelImpl>
    implements _$$MindmapNodeModelImplCopyWith<$Res> {
  __$$MindmapNodeModelImplCopyWithImpl(
    _$MindmapNodeModelImpl _value,
    $Res Function(_$MindmapNodeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MindmapNodeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nodeId = null,
    Object? workspaceId = null,
    Object? parentId = freezed,
    Object? type = null,
    Object? keyword = null,
    Object? memo = freezed,
    Object? analysisStatus = null,
    Object? x = freezed,
    Object? y = freezed,
    Object? color = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _$MindmapNodeModelImpl(
        id:
            null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                    as String,
        nodeId:
            null == nodeId
                ? _value.nodeId
                : nodeId // ignore: cast_nullable_to_non_nullable
                    as int,
        workspaceId:
            null == workspaceId
                ? _value.workspaceId
                : workspaceId // ignore: cast_nullable_to_non_nullable
                    as int,
        parentId:
            freezed == parentId
                ? _value.parentId
                : parentId // ignore: cast_nullable_to_non_nullable
                    as int?,
        type:
            null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                    as String,
        keyword:
            null == keyword
                ? _value.keyword
                : keyword // ignore: cast_nullable_to_non_nullable
                    as String,
        memo:
            freezed == memo
                ? _value.memo
                : memo // ignore: cast_nullable_to_non_nullable
                    as String?,
        analysisStatus:
            null == analysisStatus
                ? _value.analysisStatus
                : analysisStatus // ignore: cast_nullable_to_non_nullable
                    as String,
        x:
            freezed == x
                ? _value.x
                : x // ignore: cast_nullable_to_non_nullable
                    as double?,
        y:
            freezed == y
                ? _value.y
                : y // ignore: cast_nullable_to_non_nullable
                    as double?,
        color:
            freezed == color
                ? _value.color
                : color // ignore: cast_nullable_to_non_nullable
                    as String?,
        createdAt:
            null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                    as DateTime,
        updatedAt:
            null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                    as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MindmapNodeModelImpl extends _MindmapNodeModel {
  const _$MindmapNodeModelImpl({
    required this.id,
    required this.nodeId,
    required this.workspaceId,
    this.parentId,
    required this.type,
    required this.keyword,
    this.memo,
    required this.analysisStatus,
    this.x,
    this.y,
    this.color,
    required this.createdAt,
    required this.updatedAt,
  }) : super._();

  factory _$MindmapNodeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$MindmapNodeModelImplFromJson(json);

  @override
  final String id;
  @override
  final int nodeId;
  @override
  final int workspaceId;
  @override
  final int? parentId;
  @override
  final String type;
  @override
  final String keyword;
  @override
  final String? memo;
  @override
  final String analysisStatus;
  @override
  final double? x;
  @override
  final double? y;
  @override
  final String? color;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'MindmapNodeModel(id: $id, nodeId: $nodeId, workspaceId: $workspaceId, parentId: $parentId, type: $type, keyword: $keyword, memo: $memo, analysisStatus: $analysisStatus, x: $x, y: $y, color: $color, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MindmapNodeModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.nodeId, nodeId) || other.nodeId == nodeId) &&
            (identical(other.workspaceId, workspaceId) ||
                other.workspaceId == workspaceId) &&
            (identical(other.parentId, parentId) ||
                other.parentId == parentId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.keyword, keyword) || other.keyword == keyword) &&
            (identical(other.memo, memo) || other.memo == memo) &&
            (identical(other.analysisStatus, analysisStatus) ||
                other.analysisStatus == analysisStatus) &&
            (identical(other.x, x) || other.x == x) &&
            (identical(other.y, y) || other.y == y) &&
            (identical(other.color, color) || other.color == color) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    nodeId,
    workspaceId,
    parentId,
    type,
    keyword,
    memo,
    analysisStatus,
    x,
    y,
    color,
    createdAt,
    updatedAt,
  );

  /// Create a copy of MindmapNodeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MindmapNodeModelImplCopyWith<_$MindmapNodeModelImpl> get copyWith =>
      __$$MindmapNodeModelImplCopyWithImpl<_$MindmapNodeModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$MindmapNodeModelImplToJson(this);
  }
}

abstract class _MindmapNodeModel extends MindmapNodeModel {
  const factory _MindmapNodeModel({
    required final String id,
    required final int nodeId,
    required final int workspaceId,
    final int? parentId,
    required final String type,
    required final String keyword,
    final String? memo,
    required final String analysisStatus,
    final double? x,
    final double? y,
    final String? color,
    required final DateTime createdAt,
    required final DateTime updatedAt,
  }) = _$MindmapNodeModelImpl;
  const _MindmapNodeModel._() : super._();

  factory _MindmapNodeModel.fromJson(Map<String, dynamic> json) =
      _$MindmapNodeModelImpl.fromJson;

  @override
  String get id;
  @override
  int get nodeId;
  @override
  int get workspaceId;
  @override
  int? get parentId;
  @override
  String get type;
  @override
  String get keyword;
  @override
  String? get memo;
  @override
  String get analysisStatus;
  @override
  double? get x;
  @override
  double? get y;
  @override
  String? get color;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of MindmapNodeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MindmapNodeModelImplCopyWith<_$MindmapNodeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
