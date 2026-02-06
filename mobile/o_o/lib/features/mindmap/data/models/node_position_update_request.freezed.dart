// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'node_position_update_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

NodePositionItem _$NodePositionItemFromJson(Map<String, dynamic> json) {
  return _NodePositionItem.fromJson(json);
}

/// @nodoc
mixin _$NodePositionItem {
  int get nodeId => throw _privateConstructorUsedError;
  double get x => throw _privateConstructorUsedError;
  double get y => throw _privateConstructorUsedError;
  String? get color => throw _privateConstructorUsedError;

  /// Serializes this NodePositionItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NodePositionItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NodePositionItemCopyWith<NodePositionItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NodePositionItemCopyWith<$Res> {
  factory $NodePositionItemCopyWith(
    NodePositionItem value,
    $Res Function(NodePositionItem) then,
  ) = _$NodePositionItemCopyWithImpl<$Res, NodePositionItem>;
  @useResult
  $Res call({int nodeId, double x, double y, String? color});
}

/// @nodoc
class _$NodePositionItemCopyWithImpl<$Res, $Val extends NodePositionItem>
    implements $NodePositionItemCopyWith<$Res> {
  _$NodePositionItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NodePositionItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? nodeId = null,
    Object? x = null,
    Object? y = null,
    Object? color = freezed,
  }) {
    return _then(
      _value.copyWith(
            nodeId:
                null == nodeId
                    ? _value.nodeId
                    : nodeId // ignore: cast_nullable_to_non_nullable
                        as int,
            x:
                null == x
                    ? _value.x
                    : x // ignore: cast_nullable_to_non_nullable
                        as double,
            y:
                null == y
                    ? _value.y
                    : y // ignore: cast_nullable_to_non_nullable
                        as double,
            color:
                freezed == color
                    ? _value.color
                    : color // ignore: cast_nullable_to_non_nullable
                        as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NodePositionItemImplCopyWith<$Res>
    implements $NodePositionItemCopyWith<$Res> {
  factory _$$NodePositionItemImplCopyWith(
    _$NodePositionItemImpl value,
    $Res Function(_$NodePositionItemImpl) then,
  ) = __$$NodePositionItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int nodeId, double x, double y, String? color});
}

/// @nodoc
class __$$NodePositionItemImplCopyWithImpl<$Res>
    extends _$NodePositionItemCopyWithImpl<$Res, _$NodePositionItemImpl>
    implements _$$NodePositionItemImplCopyWith<$Res> {
  __$$NodePositionItemImplCopyWithImpl(
    _$NodePositionItemImpl _value,
    $Res Function(_$NodePositionItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NodePositionItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? nodeId = null,
    Object? x = null,
    Object? y = null,
    Object? color = freezed,
  }) {
    return _then(
      _$NodePositionItemImpl(
        nodeId:
            null == nodeId
                ? _value.nodeId
                : nodeId // ignore: cast_nullable_to_non_nullable
                    as int,
        x:
            null == x
                ? _value.x
                : x // ignore: cast_nullable_to_non_nullable
                    as double,
        y:
            null == y
                ? _value.y
                : y // ignore: cast_nullable_to_non_nullable
                    as double,
        color:
            freezed == color
                ? _value.color
                : color // ignore: cast_nullable_to_non_nullable
                    as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NodePositionItemImpl implements _NodePositionItem {
  const _$NodePositionItemImpl({
    required this.nodeId,
    required this.x,
    required this.y,
    this.color,
  });

  factory _$NodePositionItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$NodePositionItemImplFromJson(json);

  @override
  final int nodeId;
  @override
  final double x;
  @override
  final double y;
  @override
  final String? color;

  @override
  String toString() {
    return 'NodePositionItem(nodeId: $nodeId, x: $x, y: $y, color: $color)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NodePositionItemImpl &&
            (identical(other.nodeId, nodeId) || other.nodeId == nodeId) &&
            (identical(other.x, x) || other.x == x) &&
            (identical(other.y, y) || other.y == y) &&
            (identical(other.color, color) || other.color == color));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, nodeId, x, y, color);

  /// Create a copy of NodePositionItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NodePositionItemImplCopyWith<_$NodePositionItemImpl> get copyWith =>
      __$$NodePositionItemImplCopyWithImpl<_$NodePositionItemImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$NodePositionItemImplToJson(this);
  }
}

abstract class _NodePositionItem implements NodePositionItem {
  const factory _NodePositionItem({
    required final int nodeId,
    required final double x,
    required final double y,
    final String? color,
  }) = _$NodePositionItemImpl;

  factory _NodePositionItem.fromJson(Map<String, dynamic> json) =
      _$NodePositionItemImpl.fromJson;

  @override
  int get nodeId;
  @override
  double get x;
  @override
  double get y;
  @override
  String? get color;

  /// Create a copy of NodePositionItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NodePositionItemImplCopyWith<_$NodePositionItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

NodePositionUpdateRequest _$NodePositionUpdateRequestFromJson(
  Map<String, dynamic> json,
) {
  return _NodePositionUpdateRequest.fromJson(json);
}

/// @nodoc
mixin _$NodePositionUpdateRequest {
  List<NodePositionItem> get positions => throw _privateConstructorUsedError;

  /// Serializes this NodePositionUpdateRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NodePositionUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NodePositionUpdateRequestCopyWith<NodePositionUpdateRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NodePositionUpdateRequestCopyWith<$Res> {
  factory $NodePositionUpdateRequestCopyWith(
    NodePositionUpdateRequest value,
    $Res Function(NodePositionUpdateRequest) then,
  ) = _$NodePositionUpdateRequestCopyWithImpl<$Res, NodePositionUpdateRequest>;
  @useResult
  $Res call({List<NodePositionItem> positions});
}

/// @nodoc
class _$NodePositionUpdateRequestCopyWithImpl<
  $Res,
  $Val extends NodePositionUpdateRequest
>
    implements $NodePositionUpdateRequestCopyWith<$Res> {
  _$NodePositionUpdateRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NodePositionUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? positions = null}) {
    return _then(
      _value.copyWith(
            positions:
                null == positions
                    ? _value.positions
                    : positions // ignore: cast_nullable_to_non_nullable
                        as List<NodePositionItem>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NodePositionUpdateRequestImplCopyWith<$Res>
    implements $NodePositionUpdateRequestCopyWith<$Res> {
  factory _$$NodePositionUpdateRequestImplCopyWith(
    _$NodePositionUpdateRequestImpl value,
    $Res Function(_$NodePositionUpdateRequestImpl) then,
  ) = __$$NodePositionUpdateRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<NodePositionItem> positions});
}

/// @nodoc
class __$$NodePositionUpdateRequestImplCopyWithImpl<$Res>
    extends
        _$NodePositionUpdateRequestCopyWithImpl<
          $Res,
          _$NodePositionUpdateRequestImpl
        >
    implements _$$NodePositionUpdateRequestImplCopyWith<$Res> {
  __$$NodePositionUpdateRequestImplCopyWithImpl(
    _$NodePositionUpdateRequestImpl _value,
    $Res Function(_$NodePositionUpdateRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NodePositionUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? positions = null}) {
    return _then(
      _$NodePositionUpdateRequestImpl(
        positions:
            null == positions
                ? _value._positions
                : positions // ignore: cast_nullable_to_non_nullable
                    as List<NodePositionItem>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NodePositionUpdateRequestImpl implements _NodePositionUpdateRequest {
  const _$NodePositionUpdateRequestImpl({
    required final List<NodePositionItem> positions,
  }) : _positions = positions;

  factory _$NodePositionUpdateRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$NodePositionUpdateRequestImplFromJson(json);

  final List<NodePositionItem> _positions;
  @override
  List<NodePositionItem> get positions {
    if (_positions is EqualUnmodifiableListView) return _positions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_positions);
  }

  @override
  String toString() {
    return 'NodePositionUpdateRequest(positions: $positions)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NodePositionUpdateRequestImpl &&
            const DeepCollectionEquality().equals(
              other._positions,
              _positions,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_positions));

  /// Create a copy of NodePositionUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NodePositionUpdateRequestImplCopyWith<_$NodePositionUpdateRequestImpl>
  get copyWith => __$$NodePositionUpdateRequestImplCopyWithImpl<
    _$NodePositionUpdateRequestImpl
  >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$NodePositionUpdateRequestImplToJson(this);
  }
}

abstract class _NodePositionUpdateRequest implements NodePositionUpdateRequest {
  const factory _NodePositionUpdateRequest({
    required final List<NodePositionItem> positions,
  }) = _$NodePositionUpdateRequestImpl;

  factory _NodePositionUpdateRequest.fromJson(Map<String, dynamic> json) =
      _$NodePositionUpdateRequestImpl.fromJson;

  @override
  List<NodePositionItem> get positions;

  /// Create a copy of NodePositionUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NodePositionUpdateRequestImplCopyWith<_$NodePositionUpdateRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}
