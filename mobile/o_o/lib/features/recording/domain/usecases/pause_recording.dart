import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/recording_repository.dart';

/// 녹음 일시정지 UseCase
class PauseRecording implements UseCase<void, NoParams> {
  final RecordingRepository repository;

  PauseRecording(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) async {
    return await repository.pauseRecording();
  }
}
