import 'dart:async';

import 'package:dartz/dartz.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../../../../core/error/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/repositories/recording_repository.dart';

/// 녹음 Repository 실제 구현
///
/// speech_to_text 패키지를 사용하여 실시간 STT를 구현합니다.
class RecordingRepositoryImpl implements RecordingRepository {
  final stt.SpeechToText _speech;
  final StreamController<String> _textStreamController;
  String _recognizedText = ''; // 전체 누적 텍스트
  String _previousText = ''; // 이전 세션들의 확정된 텍스트
  String _currentText = ''; // 현재 세션의 텍스트
  bool _isListening = false;
  int _restartCount = 0; // 재시작 횟수 카운터

  RecordingRepositoryImpl()
      : _speech = stt.SpeechToText(),
        _textStreamController = StreamController<String>.broadcast();

  @override
  Future<Either<Failure, void>> startRecording() async {
    try {
      // 음성 인식 초기화
      bool available = await _speech.initialize(
        onError: (error) {
          logger.e('🎙️ STT 에러: ${error.errorMsg}');
          // error_no_match는 무시 (음성을 인식하지 못한 경우)
          if (error.errorMsg != 'error_no_match') {
            _textStreamController.addError(error.errorMsg);
          } else {
            logger.w('🎙️ 음성을 인식하지 못했습니다. 다시 말씀해주세요.');
          }
        },
        onStatus: (status) {
          // listening, done 같은 중간 상태는 로그 생략
          if (status == 'notListening' && _isListening) {
            // 현재 세션의 텍스트를 이전 텍스트에 추가 (공백 포함)
            if (_currentText.isNotEmpty) {
              _previousText = '$_previousText$_currentText ';
              logger.i('💾 "$_currentText" 저장 (총 ${_previousText.trim().split(' ').length}단어)');
            }

            // 빠른 재시작으로 끊김 최소화 (200ms 딜레이)
            Future.delayed(const Duration(milliseconds: 200), () {
              if (_isListening && !_speech.isListening) {
                _restartListening();
              }
            });
          }
        },
      );

      if (!available) {
        logger.e('🎙️ 음성 인식을 사용할 수 없습니다');
        return Left(ServerFailure());
      }

      // 텍스트 및 카운터 초기화
      _recognizedText = '';
      _previousText = '';
      _currentText = '';
      _restartCount = 0;

      // 음성 인식 시작 (한국어)
      // 10분 동안 계속 청취 (30초 무음까지 대기)
      await _speech.listen(
        onResult: (result) {
          // 현재 세션의 텍스트 업데이트
          _currentText = result.recognizedWords;
          // 전체 텍스트 = 이전 텍스트 + 현재 텍스트
          _recognizedText = _previousText + _currentText;

          if (_recognizedText.isNotEmpty) {
            _textStreamController.add(_recognizedText);
            // 확정된 결과만 로그 출력 (노이즈 감소)
            if (result.finalResult) {
              logger.i('🎙️ "$_currentText" 확정');
            }
          }
        },
        localeId: 'ko_KR', // 한국어 설정
        listenOptions: stt.SpeechListenOptions(
          listenMode: stt.ListenMode.dictation, // 받아쓰기 모드 (긴 음성에 최적)
          cancelOnError: false, // 에러 발생해도 계속 청취
          partialResults: true, // 부분 결과도 받기
          onDevice: false, // 온라인 인식 사용 (더 정확함)
        ),
        listenFor: const Duration(minutes: 10), // 최대 10분 동안 청취
        pauseFor: const Duration(seconds: 30), // 30초 무음까지 대기
      );

      _isListening = true;
      logger.i('🎙️ STT 녹음 시작');
      return const Right(null);
    } catch (e) {
      logger.e('🎙️ STT 녹음 시작 실패: $e');
      return Left(ServerFailure());
    }
  }

  /// 음성 인식 재시작 (자동)
  Future<void> _restartListening() async {
    try {
      _restartCount++;
      // 재시작 로그 간소화 (5회마다만 출력)
      if (_restartCount % 5 == 0) {
        logger.i('🔄 재시작 #$_restartCount (누적: ${_previousText.trim().split(' ').length}단어)');
      }

      // 현재 세션 텍스트 초기화 (이전 텍스트는 유지)
      _currentText = '';

      await _speech.listen(
        onResult: (result) {
          // 현재 세션의 텍스트 업데이트
          _currentText = result.recognizedWords;
          // 전체 텍스트 = 이전 텍스트 + 현재 텍스트
          _recognizedText = _previousText + _currentText;

          if (_recognizedText.isNotEmpty) {
            _textStreamController.add(_recognizedText);
            // 확정된 결과만 로그 출력 (노이즈 감소)
            if (result.finalResult) {
              logger.i('🎙️ "$_currentText" 확정');
            }
          }
        },
        localeId: 'ko_KR',
        listenOptions: stt.SpeechListenOptions(
          listenMode: stt.ListenMode.dictation,
          cancelOnError: false,
          partialResults: true,
          onDevice: false,
        ),
        listenFor: const Duration(minutes: 10),
        pauseFor: const Duration(seconds: 30),
      );
    } catch (e) {
      logger.e('❌ STT 재시작 실패: $e');
    }
  }

  @override
  Future<Either<Failure, void>> pauseRecording() async {
    try {
      if (_isListening) {
        // 현재 텍스트를 이전 텍스트에 저장
        if (_currentText.isNotEmpty) {
          _previousText = '$_previousText$_currentText ';
          logger.i('⏸️ 일시정지 - "$_currentText" 저장 → 누적: "$_previousText"');
        } else {
          logger.i('⏸️ 일시정지 - 현재 텍스트 없음, 기존 누적: "$_previousText"');
        }

        // STT 중단 및 자동 재시작 방지
        await _speech.stop();
        _isListening = false;
        logger.i('⏸️ STT 일시정지 완료');
      }

      return const Right(null);
    } catch (e) {
      logger.e('⏸️ STT 일시정지 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, void>> resumeRecording() async {
    try {
      if (!_isListening) {
        logger.i('▶️ STT 재개 시작 - 기존 누적: "$_previousText"');

        // 자동 재시작 활성화
        _isListening = true;

        // 현재 세션 텍스트 초기화
        _currentText = '';

        // 전체 텍스트 업데이트 (이전 텍스트 = 전체 텍스트)
        _recognizedText = _previousText;

        // 기존 누적 텍스트를 즉시 스트림에 전송 (UI 업데이트)
        if (_recognizedText.isNotEmpty) {
          _textStreamController.add(_recognizedText);
          logger.i('▶️ 기존 텍스트 복원: "$_recognizedText"');
        }

        // STT 재시작
        await _restartListening();
        logger.i('▶️ STT 재개 완료 - 전체: "$_recognizedText"');
      }

      return const Right(null);
    } catch (e) {
      logger.e('▶️ STT 재개 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, String>> stopRecording() async {
    try {
      if (_isListening) {
        await _speech.stop();
        _isListening = false;
      }

      final finalText = _recognizedText;
      logger.i('🎙️ STT 녹음 종료 - 최종 텍스트: $finalText');

      return Right(finalText);
    } catch (e) {
      logger.e('🎙️ STT 녹음 종료 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, bool>> checkPermission() async {
    try {
      final hasPermission = await _speech.hasPermission;
      logger.i('🎙️ 마이크 권한 확인: $hasPermission');
      return Right(hasPermission);
    } catch (e) {
      logger.e('🎙️ 마이크 권한 확인 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, bool>> requestPermission() async {
    try {
      // speech_to_text의 initialize가 권한 요청도 함께 처리
      final available = await _speech.initialize();
      logger.i('🎙️ 마이크 권한 요청 결과: $available');
      return Right(available);
    } catch (e) {
      logger.e('🎙️ 마이크 권한 요청 실패: $e');
      return Left(ServerFailure());
    }
  }

  @override
  Stream<String> getRecognizedTextStream() {
    return _textStreamController.stream;
  }

  @override
  String getCurrentRecognizedText() {
    return _recognizedText;
  }

  /// Dispose resources
  void dispose() {
    _textStreamController.close();
    _speech.stop();
  }
}
