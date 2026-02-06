import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/repositories/record_repository.dart';
import '../../domain/usecases/get_records.dart';
import 'record_event.dart';
import 'record_state.dart';

/// Record BLoC using Freezed events and states
class RecordBloc extends Bloc<RecordEvent, RecordState> {
  final GetRecords getRecords;
  final RecordRepository repository;

  RecordBloc({
    required this.getRecords,
    required this.repository,
  }) : super(const RecordState.initial()) {
    logger.i('📦 RecordBloc initialized');

    on<RecordEvent>((event, emit) async {
      logger.d('📨 RecordBloc received event: $event');
      await event.when(
        getRecords: () => _onGetRecords(emit),
        getRecord: (id) => _onGetRecord(id, emit),
        deleteRecord: (id) => _onDeleteRecord(id, emit),
        refreshRecords: () => _onRefreshRecords(emit),
      );
    });
  }

  Future<void> _onGetRecords(Emitter<RecordState> emit) async {
    logger.i('🔄 RecordBloc: Fetching all records...');
    emit(const RecordState.loading());

    final result = await getRecords(NoParams());

    result.fold(
      (failure) {
        logger.e('❌ RecordBloc: Failed to get records - ${failure.message}');
        emit(RecordState.error(message: failure.message));
      },
      (records) {
        logger.i('✅ RecordBloc: Successfully loaded ${records.length} records');
        for (var i = 0; i < records.length && i < 5; i++) {
          logger.d('  [$i] id: ${records[i].id}, title: "${records[i].title}"');
        }
        if (records.length > 5) {
          logger.d('  ... and ${records.length - 5} more records');
        }
        emit(RecordState.loaded(records: records));
      },
    );
  }

  Future<void> _onGetRecord(int id, Emitter<RecordState> emit) async {
    logger.i('🔄 RecordBloc: Fetching record with id: $id');
    emit(const RecordState.loading());

    final result = await repository.getRecord(id);

    result.fold(
      (failure) {
        logger.e('❌ RecordBloc: Failed to get record $id - ${failure.message}');
        emit(RecordState.error(message: failure.message));
      },
      (record) {
        logger.i('✅ RecordBloc: Successfully loaded record $id');
        final promptPreview = record.startPrompt != null
            ? record.startPrompt!.substring(0, record.startPrompt!.length > 50 ? 50 : record.startPrompt!.length)
            : 'null';
        logger.d('  📝 Record details: title="${record.title}", startPrompt="$promptPreview..."');
        emit(RecordState.detailLoaded(record: record));
      },
    );
  }

  Future<void> _onDeleteRecord(int id, Emitter<RecordState> emit) async {
    logger.i('🗑️ RecordBloc: Deleting record with id: $id');
    emit(const RecordState.loading());

    final result = await repository.deleteRecord(id);

    result.fold(
      (failure) {
        logger.e('❌ RecordBloc: Failed to delete record $id - ${failure.message}');
        emit(RecordState.error(message: failure.message));
      },
      (_) {
        logger.i('✅ RecordBloc: Successfully deleted record $id');
        emit(const RecordState.deleted());
      },
    );
  }

  Future<void> _onRefreshRecords(Emitter<RecordState> emit) async {
    logger.i('🔄 RecordBloc: Refreshing records (without loading state)...');

    final result = await getRecords(NoParams());

    result.fold(
      (failure) {
        logger.e('❌ RecordBloc: Failed to refresh records - ${failure.message}');
        emit(RecordState.error(message: failure.message));
      },
      (records) {
        logger.i('✅ RecordBloc: Successfully refreshed ${records.length} records');
        emit(RecordState.loaded(records: records));
      },
    );
  }
}
