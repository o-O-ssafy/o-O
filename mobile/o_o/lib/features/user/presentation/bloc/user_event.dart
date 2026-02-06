import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_event.freezed.dart';

/// User BLoC Event
@freezed
class UserEvent with _$UserEvent {
  const factory UserEvent.load() = LoadUserInfo;
  const factory UserEvent.refresh() = RefreshUserInfo;
  const factory UserEvent.loadCalendar() = LoadCalendar;
}
