import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/app_logger.dart';
import '../../../workspace/domain/usecases/get_workspace_calendar.dart';
import '../../domain/usecases/get_user_info.dart';
import 'user_event.dart';
import 'user_state.dart';

/// User BLoC
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserInfo getUserInfo;
  final GetWorkspaceCalendar getWorkspaceCalendar;

  UserBloc({
    required this.getUserInfo,
    required this.getWorkspaceCalendar,
  }) : super(const UserState.initial()) {
    on<LoadUserInfo>(_onLoadUserInfo);
    on<RefreshUserInfo>(_onRefreshUserInfo);
    on<LoadCalendar>(_onLoadCalendar);
  }

  Future<void> _onLoadUserInfo(
    LoadUserInfo event,
    Emitter<UserState> emit,
  ) async {
    emit(const UserState.loading());

    final result = await getUserInfo(NoParams());

    result.fold(
      (failure) => emit(const UserState.error(message: '사용자 정보를 불러올 수 없습니다')),
      (user) => emit(UserState.loaded(user: user)),
    );
  }

  Future<void> _onRefreshUserInfo(
    RefreshUserInfo event,
    Emitter<UserState> emit,
  ) async {
    // Refresh without showing loading state
    final result = await getUserInfo(NoParams());

    result.fold(
      (failure) => emit(const UserState.error(message: '사용자 정보를 불러올 수 없습니다')),
      (user) => emit(UserState.loaded(user: user)),
    );
  }

  Future<void> _onLoadCalendar(
    LoadCalendar event,
    Emitter<UserState> emit,
  ) async {
    logger.i('📅 [UserBloc] LoadCalendar 이벤트 수신');

    // 현재 상태가 loaded가 아니면 return
    final currentState = state;
    logger.i('📊 [UserBloc] 현재 상태: ${currentState.runtimeType}');

    if (currentState is! UserLoaded) {
      logger.w('⚠️ [UserBloc] UserLoaded 상태가 아님 - 캘린더 로드 중단');
      return;
    }

    // 오늘 날짜 가져오기
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    logger.i('📆 [UserBloc] 오늘 날짜: $today');

    // 일일 활동 API 호출 (date: 오늘 날짜)
    logger.i('🌐 [UserBloc] 일일 활동 API 호출 시작 (date: $today)');
    final result = await getWorkspaceCalendar(
      DailyActivityParams(date: today),
    );

    result.fold(
      (failure) {
        logger.e('❌ [UserBloc] 일일 활동 API 실패: ${failure.toString()}');
        // 에러 발생 시 현재 상태 유지 (키워드는 빈 리스트)
        emit(UserState.loaded(
          user: currentState.user,
          keywords: [],
        ));
        logger.i('📤 [UserBloc] 빈 키워드 리스트로 상태 업데이트');
      },
      (activity) {
        logger.i('✅ [UserBloc] 일일 활동 API 성공 - ${activity.keywords.length}개의 키워드');

        logger.i('🔑 [UserBloc] 추출된 키워드: ${activity.keywords.length}개');
        for (var i = 0; i < activity.keywords.length; i++) {
          logger.d('  [$i] keyword: "${activity.keywords[i]}"');
        }

        emit(UserState.loaded(
          user: currentState.user,
          keywords: activity.keywords,
        ));
        logger.i('📤 [UserBloc] 키워드와 함께 상태 업데이트 완료');
      },
    );
  }
}
