import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:o_o/core/constants/app_text_styles.dart';

import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// 로그인 페이지
///
/// 구글 로그인 버튼만 있는 심플한 로그인 화면입니다.
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            state.when(
              initial: () {},
              loading: () {},
              authenticated: (user) {
                // 로그인 성공 시 홈으로 이동
                context.go('/');
              },
              unauthenticated: () {},
              error: (message) {
                // 에러 메시지 표시
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(message),
                    backgroundColor: Colors.red,
                    duration: const Duration(seconds: 5),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            );
          },
          builder: (context, state) {
            final isLoading = state is AuthLoading;

            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Image.asset('assets/images/popo_login.png'),
                    Text(
                      '생각을 정리하고 이어주는',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.regular16.copyWith(
                        color: Colors.black.withOpacity(0.6),
                      ),
                    ),
                    Text(
                      'AI 기획 파트너',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.regular16.copyWith(
                        color: Colors.black.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(height: 80),

                    // 구글 로그인 버튼
                    Center(
                      child: GestureDetector(
                        onTap:
                            isLoading
                                ? null
                                : () {
                                  context.read<AuthBloc>().add(
                                    const AuthEvent.signInWithGoogle(),
                                  );
                                },
                        child: SizedBox(
                          width: 75,
                          height: 75,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // 구글 로그인 버튼 이미지
                              if (!isLoading)
                                Image.asset(
                                  'assets/images/google_login_btn.png',
                                  width: 50,
                                  height: 50,
                                ),
                              // 로딩 인디케이터
                              if (isLoading)
                                const SizedBox(
                                  width: 50,
                                  height: 50,
                                  child: CircularProgressIndicator(),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
