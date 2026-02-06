// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mindmap_creation_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MindmapCreationRequest _$MindmapCreationRequestFromJson(
  Map<String, dynamic> json,
) {
  return _MindmapCreationRequest.fromJson(json);
}

/// @nodoc
mixin _$MindmapCreationRequest {
  String get text => throw _privateConstructorUsedError;

  /// Serializes this MindmapCreationRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MindmapCreationRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MindmapCreationRequestCopyWith<MindmapCreationRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MindmapCreationRequestCopyWith<$Res> {
  factory $MindmapCreationRequestCopyWith(
    MindmapCreationRequest value,
    $Res Function(MindmapCreationRequest) then,
  ) = _$MindmapCreationRequestCopyWithImpl<$Res, MindmapCreationRequest>;
  @useResult
  $Res call({String text});
}

/// @nodoc
class _$MindmapCreationRequestCopyWithImpl<
  $Res,
  $Val extends MindmapCreationRequest
>
    implements $MindmapCreationRequestCopyWith<$Res> {
  _$MindmapCreationRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MindmapCreationRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? text = null}) {
    return _then(
      _value.copyWith(
            text:
                null == text
                    ? _value.text
                    : text // ignore: cast_nullable_to_non_nullable
                        as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MindmapCreationRequestImplCopyWith<$Res>
    implements $MindmapCreationRequestCopyWith<$Res> {
  factory _$$MindmapCreationRequestImplCopyWith(
    _$MindmapCreationRequestImpl value,
    $Res Function(_$MindmapCreationRequestImpl) then,
  ) = __$$MindmapCreationRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String text});
}

/// @nodoc
class __$$MindmapCreationRequestImplCopyWithImpl<$Res>
    extends
        _$MindmapCreationRequestCopyWithImpl<$Res, _$MindmapCreationRequestImpl>
    implements _$$MindmapCreationRequestImplCopyWith<$Res> {
  __$$MindmapCreationRequestImplCopyWithImpl(
    _$MindmapCreationRequestImpl _value,
    $Res Function(_$MindmapCreationRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MindmapCreationRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? text = null}) {
    return _then(
      _$MindmapCreationRequestImpl(
        text:
            null == text
                ? _value.text
                : text // ignore: cast_nullable_to_non_nullable
                    as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MindmapCreationRequestImpl implements _MindmapCreationRequest {
  const _$MindmapCreationRequestImpl({required this.text});

  factory _$MindmapCreationRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$MindmapCreationRequestImplFromJson(json);

  @override
  final String text;

  @override
  String toString() {
    return 'MindmapCreationRequest(text: $text)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MindmapCreationRequestImpl &&
            (identical(other.text, text) || other.text == text));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, text);

  /// Create a copy of MindmapCreationRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MindmapCreationRequestImplCopyWith<_$MindmapCreationRequestImpl>
  get copyWith =>
      __$$MindmapCreationRequestImplCopyWithImpl<_$MindmapCreationRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$MindmapCreationRequestImplToJson(this);
  }
}

abstract class _MindmapCreationRequest implements MindmapCreationRequest {
  const factory _MindmapCreationRequest({required final String text}) =
      _$MindmapCreationRequestImpl;

  factory _MindmapCreationRequest.fromJson(Map<String, dynamic> json) =
      _$MindmapCreationRequestImpl.fromJson;

  @override
  String get text;

  /// Create a copy of MindmapCreationRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MindmapCreationRequestImplCopyWith<_$MindmapCreationRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}
