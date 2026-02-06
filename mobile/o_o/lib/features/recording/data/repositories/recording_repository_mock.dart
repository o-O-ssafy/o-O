import 'dart:async';

import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/repositories/recording_repository.dart';

/// 녹음 Repository Mock 구현
///
/// 실제 녹음 기능 대신 Mock 데이터를 반환합니다.
class RecordingRepositoryMock implements RecordingRepository {
  bool _isRecording = false;
  final StreamController<String> _textStreamController =
      StreamController<String>.broadcast();
  String _recognizedText = '';

  @override
  Future<Either<Failure, void>> startRecording() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      _isRecording = true;
      logger.i('🎙️ 녹음 시작');
      return const Right(null);
    } catch (e) {
      logger.e('녹음 시작 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, void>> pauseRecording() async {
    await Future.delayed(const Duration(milliseconds: 100));
    logger.i('⏸️ Mock 일시정지');
    return const Right(null);
  }

  @override
  Future<Either<Failure, void>> resumeRecording() async {
    await Future.delayed(const Duration(milliseconds: 100));
    logger.i('▶️ Mock 재개');
    return const Right(null);
  }

  @override
  Future<Either<Failure, String>> stopRecording() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      _isRecording = false;
      logger.i('⏹️ 녹음 종료');
      return const Right('/mock/recording/path.wav');
    } catch (e) {
      logger.e('녹음 종료 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, bool>> checkPermission() async {
    await Future.delayed(const Duration(milliseconds: 100));
    return const Right(true);
  }

  @override
  Future<Either<Failure, bool>> requestPermission() async {
    await Future.delayed(const Duration(milliseconds: 100));
    return const Right(true);
  }

  @override
  Stream<String> getRecognizedTextStream() {
    return _textStreamController.stream;
  }

  @override
  String getCurrentRecognizedText() {
    return _recognizedText;
  }

  void dispose() {
    _textStreamController.close();
  }
}
