import 'dart:math';
import 'package:flutter/material.dart';

/// 색상 유틸리티
///
/// WCAG 2.0 기준으로 배경색에 따라 가독성 좋은 텍스트 색상을 계산합니다.
class ColorUtils {
  ColorUtils._();

  /// RGB 값을 상대 휘도(relative luminance)로 변환
  /// WCAG 2.0 기준
  static double _getLuminance(int r, int g, int b) {
    final rs = _getChannelLuminance(r);
    final gs = _getChannelLuminance(g);
    final bs = _getChannelLuminance(b);
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /// 색상 채널의 휘도 계산
  static double _getChannelLuminance(int channel) {
    final val = channel / 255;
    return val <= 0.03928 ? val / 12.92 : pow((val + 0.055) / 1.055, 2.4).toDouble();
  }

  /// 두 색상 간의 대비 비율 계산 (WCAG 기준)
  static double _getContrastRatio(double lum1, double lum2) {
    final lighter = max(lum1, lum2);
    final darker = min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /// 배경색에 따라 가독성이 좋은 텍스트 색상(검정 또는 흰색) 반환
  /// WCAG AA 기준 (최소 4.5:1 대비 비율)
  ///
  /// @param backgroundColor - 배경색 (Color 객체)
  /// @returns 최적의 텍스트 색상 (검정 또는 흰색)
  ///
  /// @example
  /// ```dart
  /// final bgColor = Color(0xFF263A6B); // 어두운 배경
  /// final textColor = ColorUtils.getContrastTextColor(bgColor); // Colors.white
  ///
  /// final lightBgColor = Color(0xFFFFB3BA); // 밝은 배경
  /// final textColor2 = ColorUtils.getContrastTextColor(lightBgColor); // Colors.black
  /// ```
  static Color getContrastTextColor(Color backgroundColor) {
    final bgLuminance = _getLuminance(
      backgroundColor.red,
      backgroundColor.green,
      backgroundColor.blue,
    );

    const whiteLuminance = 1.0; // 흰색의 휘도
    const blackLuminance = 0.0; // 검은색의 휘도

    final contrastWithWhite = _getContrastRatio(bgLuminance, whiteLuminance);
    final contrastWithBlack = _getContrastRatio(bgLuminance, blackLuminance);

    // 대비가 더 큰 쪽 선택
    return contrastWithWhite > contrastWithBlack
        ? Colors.white
        : Colors.black;
  }

  /// 배경색에 따라 반투명 텍스트 색상 반환
  ///
  /// @param backgroundColor - 배경색
  /// @param opacity - 투명도 (0.0 ~ 1.0)
  /// @returns 최적의 텍스트 색상 (반투명)
  static Color getContrastTextColorWithOpacity(
    Color backgroundColor,
    double opacity,
  ) {
    final baseColor = getContrastTextColor(backgroundColor);
    return baseColor.withOpacity(opacity);
  }
}
