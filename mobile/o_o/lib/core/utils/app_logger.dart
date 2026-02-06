import 'package:logger/logger.dart';

/// 앱 전역 Logger 인스턴스
///
/// 사용법:
/// ```dart
/// import 'package:o_o/core/utils/app_logger.dart';
///
/// logger.d('Debug message');
/// logger.i('Info message');
/// logger.w('Warning message');
/// logger.e('Error message');
/// ```
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 0, // 스택 트레이스 줄 수
    errorMethodCount: 5, // 에러 시 스택 트레이스 줄 수
    lineLength: 80, // 출력 라인 길이
    colors: true, // 컬러 출력
    printEmojis: true, // 이모지 출력
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart, // 시간 포맷
  ),
);

/// 프로덕션용 간단한 Logger
final productionLogger = Logger(
  printer: SimplePrinter(colors: false),
  level: Level.warning, // 프로덕션에서는 warning 이상만 로그
);
