// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'workspace_calendar_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

WorkspaceCalendarModel _$WorkspaceCalendarModelFromJson(
  Map<String, dynamic> json,
) {
  return _WorkspaceCalendarModel.fromJson(json);
}

/// @nodoc
mixin _$WorkspaceCalendarModel {
  List<String> get keywords => throw _privateConstructorUsedError;

  /// Serializes this WorkspaceCalendarModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WorkspaceCalendarModelCopyWith<WorkspaceCalendarModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WorkspaceCalendarModelCopyWith<$Res> {
  factory $WorkspaceCalendarModelCopyWith(
    WorkspaceCalendarModel value,
    $Res Function(WorkspaceCalendarModel) then,
  ) = _$WorkspaceCalendarModelCopyWithImpl<$Res, WorkspaceCalendarModel>;
  @useResult
  $Res call({List<String> keywords});
}

/// @nodoc
class _$WorkspaceCalendarModelCopyWithImpl<
  $Res,
  $Val extends WorkspaceCalendarModel
>
    implements $WorkspaceCalendarModelCopyWith<$Res> {
  _$WorkspaceCalendarModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? keywords = null}) {
    return _then(
      _value.copyWith(
            keywords:
                null == keywords
                    ? _value.keywords
                    : keywords // ignore: cast_nullable_to_non_nullable
                        as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WorkspaceCalendarModelImplCopyWith<$Res>
    implements $WorkspaceCalendarModelCopyWith<$Res> {
  factory _$$WorkspaceCalendarModelImplCopyWith(
    _$WorkspaceCalendarModelImpl value,
    $Res Function(_$WorkspaceCalendarModelImpl) then,
  ) = __$$WorkspaceCalendarModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<String> keywords});
}

/// @nodoc
class __$$WorkspaceCalendarModelImplCopyWithImpl<$Res>
    extends
        _$WorkspaceCalendarModelCopyWithImpl<$Res, _$WorkspaceCalendarModelImpl>
    implements _$$WorkspaceCalendarModelImplCopyWith<$Res> {
  __$$WorkspaceCalendarModelImplCopyWithImpl(
    _$WorkspaceCalendarModelImpl _value,
    $Res Function(_$WorkspaceCalendarModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? keywords = null}) {
    return _then(
      _$WorkspaceCalendarModelImpl(
        keywords:
            null == keywords
                ? _value._keywords
                : keywords // ignore: cast_nullable_to_non_nullable
                    as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WorkspaceCalendarModelImpl extends _WorkspaceCalendarModel {
  const _$WorkspaceCalendarModelImpl({required final List<String> keywords})
    : _keywords = keywords,
      super._();

  factory _$WorkspaceCalendarModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$WorkspaceCalendarModelImplFromJson(json);

  final List<String> _keywords;
  @override
  List<String> get keywords {
    if (_keywords is EqualUnmodifiableListView) return _keywords;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_keywords);
  }

  @override
  String toString() {
    return 'WorkspaceCalendarModel(keywords: $keywords)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WorkspaceCalendarModelImpl &&
            const DeepCollectionEquality().equals(other._keywords, _keywords));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_keywords));

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WorkspaceCalendarModelImplCopyWith<_$WorkspaceCalendarModelImpl>
  get copyWith =>
      __$$WorkspaceCalendarModelImplCopyWithImpl<_$WorkspaceCalendarModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$WorkspaceCalendarModelImplToJson(this);
  }
}

abstract class _WorkspaceCalendarModel extends WorkspaceCalendarModel {
  const factory _WorkspaceCalendarModel({
    required final List<String> keywords,
  }) = _$WorkspaceCalendarModelImpl;
  const _WorkspaceCalendarModel._() : super._();

  factory _WorkspaceCalendarModel.fromJson(Map<String, dynamic> json) =
      _$WorkspaceCalendarModelImpl.fromJson;

  @override
  List<String> get keywords;

  /// Create a copy of WorkspaceCalendarModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WorkspaceCalendarModelImplCopyWith<_$WorkspaceCalendarModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
