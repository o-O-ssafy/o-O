import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/utils/app_logger.dart';
import '../models/workspace_calendar_model.dart';
import '../models/workspace_response_model.dart';

/// Workspace API Data Source
abstract class WorkspaceApiDataSource {
  /// Get workspaces with pagination
  Future<WorkspaceResponseModel> getWorkspaces({int? cursor});

  /// Get daily activity keywords
  Future<WorkspaceCalendarModel> getDailyActivity({
    required String date,
  });

  /// Upload workspace thumbnail
  Future<void> uploadWorkspaceThumbnail({
    required int workspaceId,
    required Uint8List imageBytes,
  });
}

/// Workspace API Data Source Implementation
class WorkspaceApiDataSourceImpl implements WorkspaceApiDataSource {
  final Dio dio;

  WorkspaceApiDataSourceImpl({required this.dio});

  @override
  Future<WorkspaceResponseModel> getWorkspaces({int? cursor}) async {
    try {
      logger.i('📡 Fetching workspaces from ${ApiConstants.getWorkspaces} with cursor: $cursor');

      final response = await dio.get(
        ApiConstants.getWorkspaces,
        queryParameters: {
          'category': 'recent',
          if (cursor != null) 'cursor': cursor,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        logger.d('📦 Raw API response: $data');

        final workspaceResponse = WorkspaceResponseModel.fromJson(data);

        logger.i('✅ Fetched ${workspaceResponse.workspaces.length} workspaces, hasNext: ${workspaceResponse.hasNext}, nextCursor: ${workspaceResponse.nextCursor}');

        // 각 워크스페이스 상세 로깅
        for (var i = 0; i < workspaceResponse.workspaces.length; i++) {
          final workspace = workspaceResponse.workspaces[i];
          logger.d('  [$i] id: ${workspace.id}, title: "${workspace.title}", thumbnail: ${workspace.thumbnail ?? "null"}');
        }

        return workspaceResponse;
      } else {
        logger.e('❌ Failed to fetch workspaces: ${response.statusCode}');
        throw ServerException('Failed to fetch workspaces: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      throw ServerException('Failed to fetch workspaces: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch workspaces: $e');
    }
  }

  @override
  Future<WorkspaceCalendarModel> getDailyActivity({
    required String date,
  }) async {
    try {
      logger.i('📡 Fetching daily activity from ${ApiConstants.getDailyActivity} (date: $date)');

      final response = await dio.get(
        ApiConstants.getDailyActivity,
        queryParameters: {
          'date': date,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        logger.d('📦 Raw API response: $data');

        final activity = WorkspaceCalendarModel.fromJson(data);

        logger.i('✅ Fetched ${activity.keywords.length} keywords');
        for (var i = 0; i < activity.keywords.length; i++) {
          logger.d('  [$i] keyword: "${activity.keywords[i]}"');
        }

        return activity;
      } else {
        logger.e('❌ Failed to fetch daily activity: ${response.statusCode}');
        throw ServerException('Failed to fetch daily activity: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      throw ServerException('Failed to fetch daily activity: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to fetch daily activity: $e');
    }
  }

  @override
  Future<void> uploadWorkspaceThumbnail({
    required int workspaceId,
    required Uint8List imageBytes,
  }) async {
    try {
      final url = ApiConstants.uploadWorkspaceThumbnail(workspaceId);
      logger.i('📡 Uploading thumbnail to $url (${imageBytes.length} bytes)');

      // Uint8List → MultipartFile 변환
      final multipartFile = MultipartFile.fromBytes(
        imageBytes,
        filename: 'thumbnail.png',
        contentType: MediaType('image', 'png'),
      );

      // FormData 생성
      final formData = FormData.fromMap({
        'file': multipartFile,
      });

      // POST 요청
      final response = await dio.post(
        url,
        data: formData,
      );

      if (response.statusCode == 204) {
        logger.i('✅ Thumbnail uploaded successfully');
      } else {
        logger.w('⚠️ Unexpected status code: ${response.statusCode}');
        throw ServerException('Unexpected status code: ${response.statusCode}');
      }
    } on DioException catch (e) {
      logger.e('❌ DioException: ${e.message}');
      logger.e('📍 Response data: ${e.response?.data}');
      throw ServerException('Failed to upload thumbnail: ${e.message}');
    } catch (e) {
      logger.e('❌ Unexpected error: $e');
      throw ServerException('Failed to upload thumbnail: $e');
    }
  }
}
