import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../models/record_model.dart';

/// Record API Data Source
abstract class RecordApiDataSource {
  /// Get recent workspaces (records)
  Future<List<RecordModel>> getRecords();
}

/// Record API Data Source Implementation
class RecordApiDataSourceImpl implements RecordApiDataSource {
  final Dio dio;

  RecordApiDataSourceImpl({required this.dio});

  @override
  Future<List<RecordModel>> getRecords() async {
    try {
      logger.i('📡 Fetching recent workspaces from ${ApiConstants.getRecentWorkspaces}');

      final response = await dio.get(ApiConstants.getRecentWorkspaces);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        logger.d('📦 Raw API response: $data');

        final records = data
            .map((json) => RecordModel.fromJson(json as Map<String, dynamic>))
            .toList();

        logger.i('✅ Fetched ${records.length} records');

        // 각 레코드 상세 로깅
        for (var i = 0; i < records.length; i++) {
          final record = records[i];
          final promptPreview = record.startPrompt != null
              ? record.startPrompt!.substring(0, record.startPrompt!.length > 30 ? 30 : record.startPrompt!.length)
              : 'null';
          logger.d('  [$i] id: ${record.id}, title: "${record.title}", startPrompt: "$promptPreview..."');
        }

        return records;
      } else {
        logger.e('❌ Failed to fetch records: ${response.statusCode}');
        throw ServerException('Failed to fetch records: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      throw ServerException('Failed to fetch records: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch records: $e');
    }
  }
}
