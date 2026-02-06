import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';

/// 녹음 Repository Interface
///
/// Domain Layer에 위치하며, Data Layer에서 구현됩니다.
abstract class RecordingRepository {
  /// 녹음 시작
  Future<Either<Failure, void>> startRecording();

  /// 녹음 종료 (변환된 텍스트 반환)
  Future<Either<Failure, String>> stopRecording();

  /// 녹음 일시정지
  Future<Either<Failure, void>> pauseRecording();

  /// 녹음 재개
  Future<Either<Failure, void>> resumeRecording();

  /// 녹음 권한 확인
  Future<Either<Failure, bool>> checkPermission();

  /// 녹음 권한 요청
  Future<Either<Failure, bool>> requestPermission();

  /// 실시간으로 인식된 텍스트 스트림
  Stream<String> getRecognizedTextStream();

  /// 현재 인식된 텍스트 가져오기
  String getCurrentRecognizedText();
}
