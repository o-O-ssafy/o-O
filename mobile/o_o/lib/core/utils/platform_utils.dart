import 'dart:io';

/// 플랫폼 유틸리티
class PlatformUtils {
  PlatformUtils._();

  /// 현재 플랫폼 문자열 반환
  ///
  /// Returns: "android", "ios", "web", "other"
  static String getPlatform() {
    if (Platform.isAndroid) {
      return 'android';
    } else if (Platform.isIOS) {
      return 'ios';
    } else if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      return 'web'; // 웹으로 취급
    } else {
      return 'other';
    }
  }

  /// Android 여부
  static bool get isAndroid => Platform.isAndroid;

  /// iOS 여부
  static bool get isIOS => Platform.isIOS;

  /// 모바일 여부
  static bool get isMobile => isAndroid || isIOS;
}
