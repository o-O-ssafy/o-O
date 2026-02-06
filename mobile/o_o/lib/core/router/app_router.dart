import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/mindmap/presentation/pages/mindmap_page.dart';
import '../../features/record/presentation/pages/record_list_page.dart';
import '../../features/recording/presentation/pages/processing_page.dart';
import '../../features/user/presentation/pages/my_page.dart';

/// GoRouter 설정
///
/// Clean Architecture에서 라우팅은 core 계층에 위치합니다.
/// 각 피처의 페이지를 임포트하여 라우트를 정의합니다.
class AppRouter {
  static GoRouter router(BuildContext context) => GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final authState = context.read<AuthBloc>().state;
      final isGoingToLogin = state.matchedLocation == '/login';

      // 로딩 중이면 현재 위치 유지
      if (authState is AuthLoading) {
        return null;
      }

      // 초기 상태면 로그인 페이지로
      if (authState is AuthInitial) {
        return isGoingToLogin ? null : '/login';
      }

      // 인증되지 않은 상태
      if (authState is AuthUnauthenticated || authState is AuthError) {
        // 로그인 페이지가 아니면 로그인 페이지로 리다이렉트
        return isGoingToLogin ? null : '/login';
      }

      // 인증된 상태
      if (authState is AuthAuthenticated) {
        // 로그인 페이지에 있으면 홈으로 리다이렉트
        return isGoingToLogin ? '/' : null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),

      GoRoute(
        path: '/records',
        name: 'records',
        builder: (context, state) => const RecordListPage(),
      ),
      GoRoute(
        path: '/processing',
        name: 'processing',
        builder: (context, state) {
          final recordingText = state.extra as String? ?? '';
          return ProcessingPage(recordingText: recordingText);
        },
      ),
      GoRoute(
        path: '/mypage',
        name: 'mypage',
        builder: (context, state) => const MyPage(),
      ),
      GoRoute(
        path: '/mindmap',
        name: 'mindmap',
        builder: (context, state) {
          // extra로 전달된 Map 데이터를 파싱
          final data = state.extra as Map<String, dynamic>?;

          // mindmapId를 int로 변환 (String으로 전달된 경우 파싱)
          int? workspaceId;
          final mindmapIdValue = data?['mindmapId'];
          if (mindmapIdValue is int) {
            workspaceId = mindmapIdValue;
          } else if (mindmapIdValue is String) {
            workspaceId = int.tryParse(mindmapIdValue);
          }

          return MindmapPage(
            title: data?['title'] as String? ?? '마인드맵',
            imagePath: data?['imagePath'] as String? ?? '',
            workspaceId: workspaceId,
          );
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
}
