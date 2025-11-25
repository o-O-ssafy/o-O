import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/di/injection_container.dart';
import '../../../mindmap/presentation/bloc/mindmap_bloc.dart';
import '../../../mindmap/presentation/bloc/mindmap_event.dart';
import '../../../mindmap/presentation/bloc/mindmap_state.dart';
import '../../../workspace/presentation/bloc/workspace_bloc.dart';
import '../../../workspace/presentation/bloc/workspace_event.dart';

/// 녹음 후 마인드맵 생성 중 로딩 화면
class ProcessingPage extends StatefulWidget {
  /// 녹음된 텍스트
  final String recordingText;

  const ProcessingPage({super.key, required this.recordingText});

  @override
  State<ProcessingPage> createState() => _ProcessingPageState();
}

class _ProcessingPageState extends State<ProcessingPage>
    with TickerProviderStateMixin {
  late AnimationController _rotationController; // fur_zip 회전용
  late AnimationController _floatingController; // popo_loading 왔다갔다용
  late Animation<double> _pulseAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<double> _floatingY;

  int _currentMessageIndex = 0;
  Timer? _messageTimer;
  late DateTime _startTime; // 로딩 시작 시간

  final List<String> _loadingMessages = [
    '아이디어를 구슬에 담는 중...',
    '흩어진 아이디어 구슬을 모으는 중...',
    '아이디어 구슬을 가지런히 놓는 중...',
  ];

  @override
  void initState() {
    super.initState();

    // 로딩 시작 시간 기록
    _startTime = DateTime.now();

    // 회전 애니메이션 컨트롤러 (fur_zip용 - 계속 한 방향으로)
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat(); // 계속 회전

    // 위아래 애니메이션 컨트롤러 (popo_loading용 - 왔다갔다)
    _floatingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true); // 역방향 반복으로 부드럽게 왔다갔다

    // 펄스 애니메이션 (크기 변화)
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _floatingController, curve: Curves.easeInOut),
    );

    // 회전 애니메이션
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_rotationController);

    // 상하 움직임 애니메이션 (위아래로만)
    _floatingY = Tween<double>(begin: -10.0, end: 10.0).animate(
      CurvedAnimation(parent: _floatingController, curve: Curves.easeInOut),
    );

    // 메시지 변경 타이머 (2초마다)
    _messageTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted) {
        setState(() {
          _currentMessageIndex =
              (_currentMessageIndex + 1) % _loadingMessages.length;
        });
      }
    });

    // 마인드맵 생성 API 호출
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MindmapBloc>().add(
            MindmapEvent.createMindmapFromText(text: widget.recordingText),
          );
    });
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _floatingController.dispose();
    _messageTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<MindmapBloc, MindmapState>(
      listener: (context, state) {
        state.when(
          initial: () {},
          loading: () {},
          loaded: (_) {},
          error: (_) {},
          creating: () {
            // 로딩 중 - 아무것도 하지 않음 (애니메이션 계속 표시)
          },
          created: (response) {
            // 마인드맵 생성 완료 - 워크스페이스 목록 새로고침 후 최소 12초 보장하고 이동
            if (mounted) {
              // 홈 화면의 워크스페이스 목록 새로고침 (새로 생성된 마인드맵 반영)
              sl<WorkspaceBloc>().add(const WorkspaceEvent.load());

              final elapsed = DateTime.now().difference(_startTime);
              const minDuration = Duration(seconds: 12);

              if (elapsed < minDuration) {
                // 8초가 안 지났으면 남은 시간만큼 대기
                final remainingTime = minDuration - elapsed;
                Future.delayed(remainingTime, () {
                  if (mounted) {
                    context.pushReplacement('/records');
                  }
                });
              } else {
                // 8초 이상 지났으면 바로 이동
                context.pushReplacement('/records');
              }
            }
          },
          createError: (message) {
            // 에러 발생 - 다이얼로그 표시 후 홈으로 이동
            if (mounted) {
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (context) => AlertDialog(
                  title: const Text('마인드맵 생성 실패'),
                  content: Text(message),
                  actions: [
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        context.go('/');
                      },
                      child: const Text('확인'),
                    ),
                  ],
                ),
              );
            }
          },
        );
      },
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/background.png'),
              fit: BoxFit.cover,
            ),
          ),
          child: SafeArea(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),

                  // Popo 캐릭터 애니메이션 (fur_zip.png 위에 popo_loading.png)
                  SizedBox(
                    width: 350,
                    height: 350,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // 아래 이미지: fur_zip.png - 빙글빙글 회전
                        AnimatedBuilder(
                          animation: _rotationController,
                          builder: (context, child) {
                            return Transform.rotate(
                              angle: _rotationAnimation.value * 2 * pi, // 완전히 회전
                              child: SizedBox(
                                width: 350,
                                height: 350,
                                child: Image.asset(
                                  'assets/images/fur_zip.png',
                                  fit: BoxFit.contain,
                                ),
                              ),
                            );
                          },
                        ),
                        // 위 이미지: popo_loading.png - 위아래로 두둥실 떠다니기
                        AnimatedBuilder(
                          animation: _floatingController,
                          builder: (context, child) {
                            return Transform.translate(
                              offset: Offset(
                                20, // 오른쪽으로 고정
                                _floatingY.value, // 위아래 움직임만
                              ),
                              child: SizedBox(
                                width: 200,
                                height: 200,
                                child: Image.asset(
                                  'assets/images/popo_loading.png',
                                  fit: BoxFit.contain,
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 60),

                  // 로딩 메시지 (애니메이션으로 전환)
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 500),
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0, 0.3),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      );
                    },
                    child: Text(
                      _loadingMessages[_currentMessageIndex],
                      key: ValueKey<int>(_currentMessageIndex),
                      style: AppTextStyles.regular16.copyWith(
                        color: Colors.black.withValues(alpha: 0.6),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                  const Spacer(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
