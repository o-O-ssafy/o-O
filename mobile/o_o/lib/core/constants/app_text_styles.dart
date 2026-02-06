import 'package:flutter/material.dart';

/// 앱 전체에서 사용하는 텍스트 스타일 정의
///
/// Paperlogy 폰트 패밀리를 사용합니다.
/// 사용 가능한 폰트 웨이트: 100, 200, 300, 400, 500, 600, 700, 800, 900
class AppTextStyles {
  AppTextStyles._(); // Private constructor to prevent instantiation

  static const String _fontFamily = 'Paperlogy';

  static const TextStyle regular16 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: AppFontWeights.regular,
  );

  static const TextStyle semiBold20 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 20,
    fontWeight: AppFontWeights.semiBold,
  );

  static const TextStyle semiBold18 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 18,
    fontWeight: AppFontWeights.semiBold,
  );

  static const TextStyle semiBold16 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: AppFontWeights.semiBold,
  );

  static const TextStyle semiBold15 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 15,
    fontWeight: AppFontWeights.semiBold,
  );

  static const TextStyle regular15 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 15,
    fontWeight: AppFontWeights.regular,
  );

  static const TextStyle bold16 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: AppFontWeights.bold,
  );

  static const TextStyle bold18 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 18,
    fontWeight: AppFontWeights.bold,
  );

  static const TextStyle medium14 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: AppFontWeights.medium,
  );

  static const TextStyle semiBold14 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: AppFontWeights.semiBold,
  );

  static const TextStyle regular12 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 12,
    fontWeight: AppFontWeights.regular,
  );
}

/// 폰트 웨이트 헬퍼
///
/// Paperlogy 폰트의 웨이트를 쉽게 사용할 수 있도록 정의
class AppFontWeights {
  AppFontWeights._();

  static const FontWeight thin = FontWeight.w100; // Paperlogy-1Thin
  static const FontWeight extraLight = FontWeight.w200; // Paperlogy-2ExtraLight
  static const FontWeight light = FontWeight.w300; // Paperlogy-3Light
  static const FontWeight regular = FontWeight.w400; // Paperlogy-4Regular
  static const FontWeight medium = FontWeight.w500; // Paperlogy-5Medium
  static const FontWeight semiBold = FontWeight.w600; // Paperlogy-6SemiBold
  static const FontWeight bold = FontWeight.w700; // Paperlogy-7Bold
  static const FontWeight extraBold = FontWeight.w800; // Paperlogy-8ExtraBold
  static const FontWeight black = FontWeight.w900; // Paperlogy-9Black
}
