// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserOnlineImpl _$$UserOnlineImplFromJson(Map<String, dynamic> json) =>
    _$UserOnlineImpl($type: json['runtimeType'] as String?);

Map<String, dynamic> _$$UserOnlineImplToJson(_$UserOnlineImpl instance) =>
    <String, dynamic>{'runtimeType': instance.$type};

_$UserOfflineImpl _$$UserOfflineImplFromJson(Map<String, dynamic> json) =>
    _$UserOfflineImpl($type: json['runtimeType'] as String?);

Map<String, dynamic> _$$UserOfflineImplToJson(_$UserOfflineImpl instance) =>
    <String, dynamic>{'runtimeType': instance.$type};

_$UserAwayImpl _$$UserAwayImplFromJson(Map<String, dynamic> json) =>
    _$UserAwayImpl(
      since: DateTime.parse(json['since'] as String),
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$$UserAwayImplToJson(_$UserAwayImpl instance) =>
    <String, dynamic>{
      'since': instance.since.toIso8601String(),
      'runtimeType': instance.$type,
    };

_$UserBusyImpl _$$UserBusyImplFromJson(Map<String, dynamic> json) =>
    _$UserBusyImpl(
      customMessage: json['customMessage'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$$UserBusyImplToJson(_$UserBusyImpl instance) =>
    <String, dynamic>{
      'customMessage': instance.customMessage,
      'runtimeType': instance.$type,
    };

_$UserProfileImpl _$$UserProfileImplFromJson(Map<String, dynamic> json) =>
    _$UserProfileImpl(
      userId: json['userId'] as String,
      username: json['username'] as String,
      status: UserStatus.fromJson(json['status'] as Map<String, dynamic>),
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
          const [],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt:
          json['updated_at'] == null
              ? null
              : DateTime.parse(json['updated_at'] as String),
      settings:
          json['settings'] == null
              ? null
              : UserSettings.fromJson(json['settings'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$UserProfileImplToJson(_$UserProfileImpl instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'username': instance.username,
      'status': instance.status,
      'tags': instance.tags,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'settings': instance.settings,
    };

_$UserSettingsImpl _$$UserSettingsImplFromJson(Map<String, dynamic> json) =>
    _$UserSettingsImpl(
      notifications: json['notifications'] as bool? ?? true,
      language: json['language'] as String? ?? 'en',
      theme:
          $enumDecodeNullable(_$ThemeModeEnumMap, json['theme']) ??
          ThemeMode.system,
    );

Map<String, dynamic> _$$UserSettingsImplToJson(_$UserSettingsImpl instance) =>
    <String, dynamic>{
      'notifications': instance.notifications,
      'language': instance.language,
      'theme': _$ThemeModeEnumMap[instance.theme]!,
    };

const _$ThemeModeEnumMap = {
  ThemeMode.light: 'light',
  ThemeMode.dark: 'dark',
  ThemeMode.system: 'system',
};
