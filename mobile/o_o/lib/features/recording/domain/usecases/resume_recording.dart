import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/recording_repository.dart';

/// 녹음 재개 UseCase
class ResumeRecording implements UseCase<void, NoParams> {
  final RecordingRepository repository;

  ResumeRecording(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) async {
    return await repository.resumeRecording();
  }
}
