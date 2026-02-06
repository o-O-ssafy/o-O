// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'workspace_response_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

WorkspaceResponseModel _$WorkspaceResponseModelFromJson(
  Map<String, dynamic> json,
) {
  return _WorkspaceResponseModel.fromJson(json);
}

/// @nodoc
mixin _$WorkspaceResponseModel {
  List<WorkspaceModel> get workspaces => throw _privateConstructorUsedError;
  int? get nextCursor => throw _privateConstructorUsedError;
  bool get hasNext => throw _privateConstructorUsedError;

  /// Serializes this WorkspaceResponseModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WorkspaceResponseModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WorkspaceResponseModelCopyWith<WorkspaceResponseModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WorkspaceResponseModelCopyWith<$Res> {
  factory $WorkspaceResponseModelCopyWith(
    WorkspaceResponseModel value,
    $Res Function(WorkspaceResponseModel) then,
  ) = _$WorkspaceResponseModelCopyWithImpl<$Res, WorkspaceResponseModel>;
  @useResult
  $Res call({List<WorkspaceModel> workspaces, int? nextCursor, bool hasNext});
}

/// @nodoc
class _$WorkspaceResponseModelCopyWithImpl<
  $Res,
  $Val extends WorkspaceResponseModel
>
    implements $WorkspaceResponseModelCopyWith<$Res> {
  _$WorkspaceResponseModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WorkspaceResponseModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? workspaces = null,
    Object? nextCursor = freezed,
    Object? hasNext = null,
  }) {
    return _then(
      _value.copyWith(
            workspaces:
                null == workspaces
                    ? _value.workspaces
                    : workspaces // ignore: cast_nullable_to_non_nullable
                        as List<WorkspaceModel>,
            nextCursor:
                freezed == nextCursor
                    ? _value.nextCursor
                    : nextCursor // ignore: cast_nullable_to_non_nullable
                        as int?,
            hasNext:
                null == hasNext
                    ? _value.hasNext
                    : hasNext // ignore: cast_nullable_to_non_nullable
                        as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WorkspaceResponseModelImplCopyWith<$Res>
    implements $WorkspaceResponseModelCopyWith<$Res> {
  factory _$$WorkspaceResponseModelImplCopyWith(
    _$WorkspaceResponseModelImpl value,
    $Res Function(_$WorkspaceResponseModelImpl) then,
  ) = __$$WorkspaceResponseModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<WorkspaceModel> workspaces, int? nextCursor, bool hasNext});
}

/// @nodoc
class __$$WorkspaceResponseModelImplCopyWithImpl<$Res>
    extends
        _$WorkspaceResponseModelCopyWithImpl<$Res, _$WorkspaceResponseModelImpl>
    implements _$$WorkspaceResponseModelImplCopyWith<$Res> {
  __$$WorkspaceResponseModelImplCopyWithImpl(
    _$WorkspaceResponseModelImpl _value,
    $Res Function(_$WorkspaceResponseModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceResponseModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? workspaces = null,
    Object? nextCursor = freezed,
    Object? hasNext = null,
  }) {
    return _then(
      _$WorkspaceResponseModelImpl(
        workspaces:
            null == workspaces
                ? _value._workspaces
                : workspaces // ignore: cast_nullable_to_non_nullable
                    as List<WorkspaceModel>,
        nextCursor:
            freezed == nextCursor
                ? _value.nextCursor
                : nextCursor // ignore: cast_nullable_to_non_nullable
                    as int?,
        hasNext:
            null == hasNext
                ? _value.hasNext
                : hasNext // ignore: cast_nullable_to_non_nullable
                    as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WorkspaceResponseModelImpl extends _WorkspaceResponseModel {
  const _$WorkspaceResponseModelImpl({
    required final List<WorkspaceModel> workspaces,
    required this.nextCursor,
    required this.hasNext,
  }) : _workspaces = workspaces,
       super._();

  factory _$WorkspaceResponseModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$WorkspaceResponseModelImplFromJson(json);

  final List<WorkspaceModel> _workspaces;
  @override
  List<WorkspaceModel> get workspaces {
    if (_workspaces is EqualUnmodifiableListView) return _workspaces;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_workspaces);
  }

  @override
  final int? nextCursor;
  @override
  final bool hasNext;

  @override
  String toString() {
    return 'WorkspaceResponseModel(workspaces: $workspaces, nextCursor: $nextCursor, hasNext: $hasNext)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceResponseModelImpl &&
            const DeepCollectionEquality().equals(
              other._workspaces,
              _workspaces,
            ) &&
            (identical(other.nextCursor, nextCursor) ||
                other.nextCursor == nextCursor) &&
            (identical(other.hasNext, hasNext) || other.hasNext == hasNext));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_workspaces),
    nextCursor,
    hasNext,
  );

  /// Create a copy of WorkspaceResponseModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceResponseModelImplCopyWith<_$WorkspaceResponseModelImpl>
  get copyWith =>
      __$$WorkspaceResponseModelImplCopyWithImpl<_$WorkspaceResponseModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$WorkspaceResponseModelImplToJson(this);
  }
}

abstract class _WorkspaceResponseModel extends WorkspaceResponseModel {
  const factory _WorkspaceResponseModel({
    required final List<WorkspaceModel> workspaces,
    required final int? nextCursor,
    required final bool hasNext,
  }) = _$WorkspaceResponseModelImpl;
  const _WorkspaceResponseModel._() : super._();

  factory _WorkspaceResponseModel.fromJson(Map<String, dynamic> json) =
      _$WorkspaceResponseModelImpl.fromJson;

  @override
  List<WorkspaceModel> get workspaces;
  @override
  int? get nextCursor;
  @override
  bool get hasNext;

  /// Create a copy of WorkspaceResponseModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceResponseModelImplCopyWith<_$WorkspaceResponseModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
