import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../../features/auth/data/datasources/auth_api_data_source.dart';
import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../../features/auth/data/datasources/auth_remote_data_source.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/record/data/datasources/record_api_data_source.dart';
import '../../features/record/data/repositories/record_repository_impl.dart';
import '../../features/record/domain/repositories/record_repository.dart';
import '../../features/record/domain/usecases/get_records.dart';
import '../../features/record/presentation/bloc/record_bloc.dart';
import '../../features/recording/data/repositories/recording_repository_impl.dart';
import '../../features/recording/domain/repositories/recording_repository.dart';
import '../../features/recording/domain/usecases/pause_recording.dart';
import '../../features/recording/domain/usecases/resume_recording.dart';
import '../../features/recording/domain/usecases/start_recording.dart';
import '../../features/recording/domain/usecases/stop_recording.dart';
import '../../features/recording/presentation/bloc/recording_bloc.dart';
import '../../features/user/data/datasources/user_api_data_source.dart';
import '../../features/user/data/repositories/user_repository_impl.dart';
import '../../features/user/domain/repositories/user_repository.dart';
import '../../features/user/domain/usecases/get_user_info.dart';
import '../../features/user/presentation/bloc/user_bloc.dart';
import '../../features/workspace/data/datasources/workspace_api_data_source.dart';
import '../../features/workspace/data/repositories/workspace_repository_impl.dart';
import '../../features/workspace/domain/repositories/workspace_repository.dart';
import '../../features/workspace/domain/usecases/get_workspace_calendar.dart';
import '../../features/workspace/domain/usecases/get_workspaces.dart';
import '../../features/workspace/domain/usecases/upload_workspace_thumbnail.dart';
import '../../features/workspace/presentation/bloc/workspace_bloc.dart';
import '../../features/mindmap/data/datasources/mindmap_api_data_source.dart';
import '../../features/mindmap/data/repositories/mindmap_repository_impl.dart';
import '../../features/mindmap/domain/repositories/mindmap_repository.dart';
import '../../features/mindmap/domain/usecases/create_mindmap_from_text.dart';
import '../../features/mindmap/domain/usecases/get_mindmap_nodes.dart';
import '../../features/mindmap/domain/usecases/update_node_positions.dart';
import '../../features/mindmap/presentation/bloc/mindmap_bloc.dart';
import '../constants/api_constants.dart';
import '../network/auth_interceptor.dart';

final sl = GetIt.instance;

/// Initialize all dependencies
Future<void> init() async {
  //! External
  // FlutterSecureStorage
  const secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );
  sl.registerLazySingleton(() => secureStorage);

  // AuthLocalDataSource (Dio보다 먼저 등록 - 인터셉터에서 사용)
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(secureStorage: sl()),
  );

  // Dio (AuthInterceptor 포함)
  sl.registerLazySingleton(
    () {
      final dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );

      // AuthInterceptor 추가
      dio.interceptors.add(
        AuthInterceptor(
          localDataSource: sl<AuthLocalDataSource>(),
          dio: dio,
        ),
      );

      return dio;
    },
  );

  //! Features - Auth
  // Bloc
  sl.registerFactory(
    () => AuthBloc(
      repository: sl(),
    ),
  );

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      apiDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(),
  );

  sl.registerLazySingleton<AuthApiDataSource>(
    () => AuthApiDataSourceImpl(dio: sl()),
  );

  //! Features - User
  // Bloc
  sl.registerFactory(
    () => UserBloc(
      getUserInfo: sl(),
      getWorkspaceCalendar: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetUserInfo(sl()));

  // Repository
  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(
      apiDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<UserApiDataSource>(
    () => UserApiDataSourceImpl(dio: sl()),
  );

  //! Features - Recording
  // Bloc
  sl.registerFactory(
    () => RecordingBloc(
      startRecording: sl(),
      stopRecording: sl(),
      pauseRecording: sl(),
      resumeRecording: sl(),
      repository: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => StartRecording(sl()));
  sl.registerLazySingleton(() => StopRecording(sl()));
  sl.registerLazySingleton(() => PauseRecording(sl()));
  sl.registerLazySingleton(() => ResumeRecording(sl()));

  // Repository (Real Implementation with STT)
  sl.registerLazySingleton<RecordingRepository>(
    () => RecordingRepositoryImpl(),
  );

  //! Features - Record
  // Bloc
  sl.registerFactory(
    () => RecordBloc(
      getRecords: sl(),
      repository: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetRecords(sl()));

  // Repository
  sl.registerLazySingleton<RecordRepository>(
    () => RecordRepositoryImpl(
      apiDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<RecordApiDataSource>(
    () => RecordApiDataSourceImpl(dio: sl()),
  );

  //! Features - Workspace
  // Bloc
  sl.registerFactory(
    () => WorkspaceBloc(
      getWorkspaces: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetWorkspaces(sl()));
  sl.registerLazySingleton(() => GetWorkspaceCalendar(sl()));
  sl.registerLazySingleton(() => UploadWorkspaceThumbnail(sl()));

  // Repository
  sl.registerLazySingleton<WorkspaceRepository>(
    () => WorkspaceRepositoryImpl(
      apiDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<WorkspaceApiDataSource>(
    () => WorkspaceApiDataSourceImpl(dio: sl()),
  );

  //! Features - Mindmap
  // Bloc
  sl.registerFactory(
    () => MindmapBloc(
      getMindmapNodes: sl(),
      createMindmapFromText: sl(),
      updateNodePositions: sl(),
      uploadWorkspaceThumbnail: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetMindmapNodes(sl()));
  sl.registerLazySingleton(() => CreateMindmapFromText(sl()));
  sl.registerLazySingleton(() => UpdateNodePositions(sl()));

  // Repository
  sl.registerLazySingleton<MindmapRepository>(
    () => MindmapRepositoryImpl(
      apiDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<MindmapApiDataSource>(
    () => MindmapApiDataSourceImpl(dio: sl()),
  );
}
