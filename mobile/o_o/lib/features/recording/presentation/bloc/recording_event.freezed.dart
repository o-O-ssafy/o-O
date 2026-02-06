// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recording_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$RecordingEvent {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) => throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecordingEventCopyWith<$Res> {
  factory $RecordingEventCopyWith(
    RecordingEvent value,
    $Res Function(RecordingEvent) then,
  ) = _$RecordingEventCopyWithImpl<$Res, RecordingEvent>;
}

/// @nodoc
class _$RecordingEventCopyWithImpl<$Res, $Val extends RecordingEvent>
    implements $RecordingEventCopyWith<$Res> {
  _$RecordingEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$RecordingStartImplCopyWith<$Res> {
  factory _$$RecordingStartImplCopyWith(
    _$RecordingStartImpl value,
    $Res Function(_$RecordingStartImpl) then,
  ) = __$$RecordingStartImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingStartImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingStartImpl>
    implements _$$RecordingStartImplCopyWith<$Res> {
  __$$RecordingStartImplCopyWithImpl(
    _$RecordingStartImpl _value,
    $Res Function(_$RecordingStartImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingStartImpl implements RecordingStart {
  const _$RecordingStartImpl();

  @override
  String toString() {
    return 'RecordingEvent.start()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingStartImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) {
    return start();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) {
    return start?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) {
    if (start != null) {
      return start();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) {
    return start(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) {
    return start?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) {
    if (start != null) {
      return start(this);
    }
    return orElse();
  }
}

abstract class RecordingStart implements RecordingEvent {
  const factory RecordingStart() = _$RecordingStartImpl;
}

/// @nodoc
abstract class _$$RecordingPauseImplCopyWith<$Res> {
  factory _$$RecordingPauseImplCopyWith(
    _$RecordingPauseImpl value,
    $Res Function(_$RecordingPauseImpl) then,
  ) = __$$RecordingPauseImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingPauseImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingPauseImpl>
    implements _$$RecordingPauseImplCopyWith<$Res> {
  __$$RecordingPauseImplCopyWithImpl(
    _$RecordingPauseImpl _value,
    $Res Function(_$RecordingPauseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingPauseImpl implements RecordingPause {
  const _$RecordingPauseImpl();

  @override
  String toString() {
    return 'RecordingEvent.pause()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingPauseImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) {
    return pause();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) {
    return pause?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) {
    if (pause != null) {
      return pause();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) {
    return pause(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) {
    return pause?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) {
    if (pause != null) {
      return pause(this);
    }
    return orElse();
  }
}

abstract class RecordingPause implements RecordingEvent {
  const factory RecordingPause() = _$RecordingPauseImpl;
}

/// @nodoc
abstract class _$$RecordingResumeImplCopyWith<$Res> {
  factory _$$RecordingResumeImplCopyWith(
    _$RecordingResumeImpl value,
    $Res Function(_$RecordingResumeImpl) then,
  ) = __$$RecordingResumeImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingResumeImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingResumeImpl>
    implements _$$RecordingResumeImplCopyWith<$Res> {
  __$$RecordingResumeImplCopyWithImpl(
    _$RecordingResumeImpl _value,
    $Res Function(_$RecordingResumeImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingResumeImpl implements RecordingResume {
  const _$RecordingResumeImpl();

  @override
  String toString() {
    return 'RecordingEvent.resume()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingResumeImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) {
    return resume();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) {
    return resume?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) {
    if (resume != null) {
      return resume();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) {
    return resume(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) {
    return resume?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) {
    if (resume != null) {
      return resume(this);
    }
    return orElse();
  }
}

abstract class RecordingResume implements RecordingEvent {
  const factory RecordingResume() = _$RecordingResumeImpl;
}

/// @nodoc
abstract class _$$RecordingStopImplCopyWith<$Res> {
  factory _$$RecordingStopImplCopyWith(
    _$RecordingStopImpl value,
    $Res Function(_$RecordingStopImpl) then,
  ) = __$$RecordingStopImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingStopImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingStopImpl>
    implements _$$RecordingStopImplCopyWith<$Res> {
  __$$RecordingStopImplCopyWithImpl(
    _$RecordingStopImpl _value,
    $Res Function(_$RecordingStopImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingStopImpl implements RecordingStop {
  const _$RecordingStopImpl();

  @override
  String toString() {
    return 'RecordingEvent.stop()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingStopImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) {
    return stop();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) {
    return stop?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) {
    if (stop != null) {
      return stop();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) {
    return stop(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) {
    return stop?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) {
    if (stop != null) {
      return stop(this);
    }
    return orElse();
  }
}

abstract class RecordingStop implements RecordingEvent {
  const factory RecordingStop() = _$RecordingStopImpl;
}

/// @nodoc
abstract class _$$RecordingToggleImplCopyWith<$Res> {
  factory _$$RecordingToggleImplCopyWith(
    _$RecordingToggleImpl value,
    $Res Function(_$RecordingToggleImpl) then,
  ) = __$$RecordingToggleImplCopyWithImpl<$Res>;
}

/// @nodoc
class __$$RecordingToggleImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingToggleImpl>
    implements _$$RecordingToggleImplCopyWith<$Res> {
  __$$RecordingToggleImplCopyWithImpl(
    _$RecordingToggleImpl _value,
    $Res Function(_$RecordingToggleImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc

class _$RecordingToggleImpl implements RecordingToggle {
  const _$RecordingToggleImpl();

  @override
  String toString() {
    return 'RecordingEvent.toggle()';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType && other is _$RecordingToggleImpl);
  }

  @override
  int get hashCode => runtimeType.hashCode;

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) {
    return toggle();
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) {
    return toggle?.call();
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) {
    if (toggle != null) {
      return toggle();
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) {
    return toggle(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) {
    return toggle?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) {
    if (toggle != null) {
      return toggle(this);
    }
    return orElse();
  }
}

abstract class RecordingToggle implements RecordingEvent {
  const factory RecordingToggle() = _$RecordingToggleImpl;
}

/// @nodoc
abstract class _$$RecordingUpdateTextImplCopyWith<$Res> {
  factory _$$RecordingUpdateTextImplCopyWith(
    _$RecordingUpdateTextImpl value,
    $Res Function(_$RecordingUpdateTextImpl) then,
  ) = __$$RecordingUpdateTextImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String text});
}

/// @nodoc
class __$$RecordingUpdateTextImplCopyWithImpl<$Res>
    extends _$RecordingEventCopyWithImpl<$Res, _$RecordingUpdateTextImpl>
    implements _$$RecordingUpdateTextImplCopyWith<$Res> {
  __$$RecordingUpdateTextImplCopyWithImpl(
    _$RecordingUpdateTextImpl _value,
    $Res Function(_$RecordingUpdateTextImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? text = null}) {
    return _then(
      _$RecordingUpdateTextImpl(
        null == text
            ? _value.text
            : text // ignore: cast_nullable_to_non_nullable
                as String,
      ),
    );
  }
}

/// @nodoc

class _$RecordingUpdateTextImpl implements RecordingUpdateText {
  const _$RecordingUpdateTextImpl(this.text);

  @override
  final String text;

  @override
  String toString() {
    return 'RecordingEvent.updateText(text: $text)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecordingUpdateTextImpl &&
            (identical(other.text, text) || other.text == text));
  }

  @override
  int get hashCode => Object.hash(runtimeType, text);

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecordingUpdateTextImplCopyWith<_$RecordingUpdateTextImpl> get copyWith =>
      __$$RecordingUpdateTextImplCopyWithImpl<_$RecordingUpdateTextImpl>(
        this,
        _$identity,
      );

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function() start,
    required TResult Function() pause,
    required TResult Function() resume,
    required TResult Function() stop,
    required TResult Function() toggle,
    required TResult Function(String text) updateText,
  }) {
    return updateText(text);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function()? start,
    TResult? Function()? pause,
    TResult? Function()? resume,
    TResult? Function()? stop,
    TResult? Function()? toggle,
    TResult? Function(String text)? updateText,
  }) {
    return updateText?.call(text);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function()? start,
    TResult Function()? pause,
    TResult Function()? resume,
    TResult Function()? stop,
    TResult Function()? toggle,
    TResult Function(String text)? updateText,
    required TResult orElse(),
  }) {
    if (updateText != null) {
      return updateText(text);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(RecordingStart value) start,
    required TResult Function(RecordingPause value) pause,
    required TResult Function(RecordingResume value) resume,
    required TResult Function(RecordingStop value) stop,
    required TResult Function(RecordingToggle value) toggle,
    required TResult Function(RecordingUpdateText value) updateText,
  }) {
    return updateText(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(RecordingStart value)? start,
    TResult? Function(RecordingPause value)? pause,
    TResult? Function(RecordingResume value)? resume,
    TResult? Function(RecordingStop value)? stop,
    TResult? Function(RecordingToggle value)? toggle,
    TResult? Function(RecordingUpdateText value)? updateText,
  }) {
    return updateText?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(RecordingStart value)? start,
    TResult Function(RecordingPause value)? pause,
    TResult Function(RecordingResume value)? resume,
    TResult Function(RecordingStop value)? stop,
    TResult Function(RecordingToggle value)? toggle,
    TResult Function(RecordingUpdateText value)? updateText,
    required TResult orElse(),
  }) {
    if (updateText != null) {
      return updateText(this);
    }
    return orElse();
  }
}

abstract class RecordingUpdateText implements RecordingEvent {
  const factory RecordingUpdateText(final String text) =
      _$RecordingUpdateTextImpl;

  String get text;

  /// Create a copy of RecordingEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecordingUpdateTextImplCopyWith<_$RecordingUpdateTextImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
