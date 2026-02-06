import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../domain/repositories/recording_repository.dart';
import '../../domain/usecases/pause_recording.dart';
import '../../domain/usecases/resume_recording.dart';
import '../../domain/usecases/start_recording.dart';
import '../../domain/usecases/stop_recording.dart';
import 'recording_event.dart';
import 'recording_state.dart';

/// 녹음 BLoC
class RecordingBloc extends Bloc<RecordingEvent, RecordingState> {
  final StartRecording startRecording;
  final StopRecording stopRecording;
  final PauseRecording pauseRecording;
  final ResumeRecording resumeRecording;
  final RecordingRepository repository;

  StreamSubscription<String>? _textStreamSubscription;
  String _currentRecognizedText = '';

  RecordingBloc({
    required this.startRecording,
    required this.stopRecording,
    required this.pauseRecording,
    required this.resumeRecording,
    required this.repository,
  }) : super(const RecordingState.initial()) {
    on<RecordingStart>(_onStart);
    on<RecordingPause>(_onPause);
    on<RecordingResume>(_onResume);
    on<RecordingStop>(_onStop);
    on<RecordingToggle>(_onToggle);
    on<RecordingUpdateText>(_onUpdateText);
  }

  Future<void> _onStart(
    RecordingStart event,
    Emitter<RecordingState> emit,
  ) async {
    // 텍스트 초기화
    _currentRecognizedText = '';

    final result = await startRecording(NoParams());

    result.fold(
      (failure) => emit(RecordingState.error(message: '녹음 시작 실패')),
      (_) {
        emit(const RecordingState.recording(recognizedText: ''));

        // 실시간 텍스트 스트림 구독
        _textStreamSubscription = repository.getRecognizedTextStream().listen(
          (text) {
            _currentRecognizedText = text;
            add(RecordingEvent.updateText(text));
          },
        );
      },
    );
  }

  Future<void> _onPause(
    RecordingPause event,
    Emitter<RecordingState> emit,
  ) async {
    // 실제 STT 일시정지
    final result = await pauseRecording(NoParams());

    result.fold(
      (failure) => emit(RecordingState.error(message: '일시정지 실패')),
      (_) => emit(RecordingState.paused(recognizedText: _currentRecognizedText)),
    );
  }

  Future<void> _onResume(
    RecordingResume event,
    Emitter<RecordingState> emit,
  ) async {
    // 실제 STT 재개
    final result = await resumeRecording(NoParams());

    result.fold(
      (failure) => emit(RecordingState.error(message: '재개 실패')),
      (_) => emit(RecordingState.recording(recognizedText: _currentRecognizedText)),
    );
  }

  Future<void> _onStop(
    RecordingStop event,
    Emitter<RecordingState> emit,
  ) async {
    // 텍스트 스트림 구독 취소
    await _textStreamSubscription?.cancel();
    _textStreamSubscription = null;

    final result = await stopRecording(NoParams());

    result.fold(
      (failure) => emit(RecordingState.error(message: '녹음 종료 실패')),
      (recognizedText) =>
          emit(RecordingState.stopped(recognizedText: recognizedText)),
    );
  }

  Future<void> _onToggle(
    RecordingToggle event,
    Emitter<RecordingState> emit,
  ) async {
    state.when(
      initial: () => add(const RecordingEvent.start()),
      recording: (_) => add(const RecordingEvent.stop()),
      paused: (_) => add(const RecordingEvent.stop()),
      stopped: (_) => add(const RecordingEvent.start()),
      error: (_) => add(const RecordingEvent.start()),
    );
  }

  Future<void> _onUpdateText(
    RecordingUpdateText event,
    Emitter<RecordingState> emit,
  ) async {
    // 현재 상태에 따라 텍스트 업데이트
    state.when(
      initial: () {},
      recording: (_) => emit(RecordingState.recording(recognizedText: event.text)),
      paused: (_) => emit(RecordingState.paused(recognizedText: event.text)),
      stopped: (_) {},
      error: (_) {},
    );
  }

  @override
  Future<void> close() {
    _textStreamSubscription?.cancel();
    return super.close();
  }
}
