import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/recording_repository.dart';

/// 녹음 시작 UseCase
class StartRecording implements UseCase<void, NoParams> {
  final RecordingRepository repository;

  StartRecording(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) async {
    return await repository.startRecording();
  }
}
