// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mindmap_creation_response.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MindmapCreationResponse _$MindmapCreationResponseFromJson(
  Map<String, dynamic> json,
) {
  return _MindmapCreationResponse.fromJson(json);
}

/// @nodoc
mixin _$MindmapCreationResponse {
  int get workspaceId => throw _privateConstructorUsedError;
  int get nodeId => throw _privateConstructorUsedError;
  String get keyword => throw _privateConstructorUsedError;
  String? get memo => throw _privateConstructorUsedError;
  String get analysisStatus => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;

  /// Serializes this MindmapCreationResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MindmapCreationResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MindmapCreationResponseCopyWith<MindmapCreationResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MindmapCreationResponseCopyWith<$Res> {
  factory $MindmapCreationResponseCopyWith(
    MindmapCreationResponse value,
    $Res Function(MindmapCreationResponse) then,
  ) = _$MindmapCreationResponseCopyWithImpl<$Res, MindmapCreationResponse>;
  @useResult
  $Res call({
    int workspaceId,
    int nodeId,
    String keyword,
    String? memo,
    String analysisStatus,
    String message,
  });
}

/// @nodoc
class _$MindmapCreationResponseCopyWithImpl<
  $Res,
  $Val extends MindmapCreationResponse
>
    implements $MindmapCreationResponseCopyWith<$Res> {
  _$MindmapCreationResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MindmapCreationResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? workspaceId = null,
    Object? nodeId = null,
    Object? keyword = null,
    Object? memo = freezed,
    Object? analysisStatus = null,
    Object? message = null,
  }) {
    return _then(
      _value.copyWith(
            workspaceId:
                null == workspaceId
                    ? _value.workspaceId
                    : workspaceId // ignore: cast_nullable_to_non_nullable
                        as int,
            nodeId:
                null == nodeId
                    ? _value.nodeId
                    : nodeId // ignore: cast_nullable_to_non_nullable
                        as int,
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
            message:
                null == message
                    ? _value.message
                    : message // ignore: cast_nullable_to_non_nullable
                        as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MindmapCreationResponseImplCopyWith<$Res>
    implements $MindmapCreationResponseCopyWith<$Res> {
  factory _$$MindmapCreationResponseImplCopyWith(
    _$MindmapCreationResponseImpl value,
    $Res Function(_$MindmapCreationResponseImpl) then,
  ) = __$$MindmapCreationResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int workspaceId,
    int nodeId,
    String keyword,
    String? memo,
    String analysisStatus,
    String message,
  });
}

/// @nodoc
class __$$MindmapCreationResponseImplCopyWithImpl<$Res>
    extends
        _$MindmapCreationResponseCopyWithImpl<
          $Res,
          _$MindmapCreationResponseImpl
        >
    implements _$$MindmapCreationResponseImplCopyWith<$Res> {
  __$$MindmapCreationResponseImplCopyWithImpl(
    _$MindmapCreationResponseImpl _value,
    $Res Function(_$MindmapCreationResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MindmapCreationResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? workspaceId = null,
    Object? nodeId = null,
    Object? keyword = null,
    Object? memo = freezed,
    Object? analysisStatus = null,
    Object? message = null,
  }) {
    return _then(
      _$MindmapCreationResponseImpl(
        workspaceId:
            null == workspaceId
                ? _value.workspaceId
                : workspaceId // ignore: cast_nullable_to_non_nullable
                    as int,
        nodeId:
            null == nodeId
                ? _value.nodeId
                : nodeId // ignore: cast_nullable_to_non_nullable
                    as int,
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
@JsonSerializable()
class _$MindmapCreationResponseImpl implements _MindmapCreationResponse {
  const _$MindmapCreationResponseImpl({
    required this.workspaceId,
    required this.nodeId,
    required this.keyword,
    this.memo,
    required this.analysisStatus,
    required this.message,
  });

  factory _$MindmapCreationResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$MindmapCreationResponseImplFromJson(json);

  @override
  final int workspaceId;
  @override
  final int nodeId;
  @override
  final String keyword;
  @override
  final String? memo;
  @override
  final String analysisStatus;
  @override
  final String message;

  @override
  String toString() {
    return 'MindmapCreationResponse(workspaceId: $workspaceId, nodeId: $nodeId, keyword: $keyword, memo: $memo, analysisStatus: $analysisStatus, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MindmapCreationResponseImpl &&
            (identical(other.workspaceId, workspaceId) ||
                other.workspaceId == workspaceId) &&
            (identical(other.nodeId, nodeId) || other.nodeId == nodeId) &&
            (identical(other.keyword, keyword) || other.keyword == keyword) &&
            (identical(other.memo, memo) || other.memo == memo) &&
            (identical(other.analysisStatus, analysisStatus) ||
                other.analysisStatus == analysisStatus) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    workspaceId,
    nodeId,
    keyword,
    memo,
    analysisStatus,
    message,
  );

  /// Create a copy of MindmapCreationResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MindmapCreationResponseImplCopyWith<_$MindmapCreationResponseImpl>
  get copyWith => __$$MindmapCreationResponseImplCopyWithImpl<
    _$MindmapCreationResponseImpl
  >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MindmapCreationResponseImplToJson(this);
  }
}

abstract class _MindmapCreationResponse implements MindmapCreationResponse {
  const factory _MindmapCreationResponse({
    required final int workspaceId,
    required final int nodeId,
    required final String keyword,
    final String? memo,
    required final String analysisStatus,
    required final String message,
  }) = _$MindmapCreationResponseImpl;

  factory _MindmapCreationResponse.fromJson(Map<String, dynamic> json) =
      _$MindmapCreationResponseImpl.fromJson;

  @override
  int get workspaceId;
  @override
  int get nodeId;
  @override
  String get keyword;
  @override
  String? get memo;
  @override
  String get analysisStatus;
  @override
  String get message;

  /// Create a copy of MindmapCreationResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MindmapCreationResponseImplCopyWith<_$MindmapCreationResponseImpl>
  get copyWith => throw _privateConstructorUsedError;
}
