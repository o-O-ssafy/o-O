import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:o_o/core/constants/app_colors.dart';

import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/di/injection_container.dart';
import '../../../recording/presentation/bloc/recording_bloc.dart';
import '../../../recording/presentation/bloc/recording_event.dart';
import '../../../recording/presentation/bloc/recording_state.dart';
import '../../../workspace/presentation/bloc/workspace_bloc.dart';
import '../../../workspace/presentation/bloc/workspace_event.dart';
import '../../../workspace/presentation/bloc/workspace_state.dart';
import '../widgets/animated_circular_button.dart';
import '../widgets/circular_button.dart';
import '../widgets/mindmap_card.dart';

/// 홈 페이지
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
  late WorkspaceBloc _workspaceBloc;

  @override
  void initState() {
    super.initState();
    _workspaceBloc = sl<WorkspaceBloc>();
    // 초기 로드
    _workspaceBloc.add(const WorkspaceEvent.load());

    // 앱 라이프사이클 옵저버 등록
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    // 앱이 다시 활성화될 때 (다른 페이지에서 돌아올 때 포함)
    if (state == AppLifecycleState.resumed) {
      _workspaceBloc.add(const WorkspaceEvent.load());
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _workspaceBloc.close();
    super.dispose();
  }

  /// 녹음 중단 확인 다이얼로그
  void _showStopRecordingDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withOpacity(0.3),
      builder: (dialogContext) {
        return PopScope(
          onPopInvoked: (didPop) {
            if (didPop) {
              // 다이얼로그가 닫히면 녹음 재개
              context.read<RecordingBloc>().add(
                const RecordingEvent.resume(),
              );
            }
          },
          child: Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 다이얼로그 컨텐츠
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // 메시지
                    Text(
                      '창을 벗어나면',
                      style: AppTextStyles.semiBold20.copyWith(
                        color: AppColors.semiBlack,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    Text(
                      '기록을 되돌릴 수 없어요.',
                      style: AppTextStyles.semiBold20.copyWith(
                        color: AppColors.semiBlack,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    // 홈으로 가기 버튼
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(dialogContext).pop();
                          // 녹음 중단 (HomePage에 그대로 남음)
                          context.read<RecordingBloc>().add(
                            const RecordingEvent.stop(),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.deepBlue,
                          foregroundColor: AppColors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          '홈으로 가기',
                          style: AppTextStyles.semiBold16.copyWith(
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // 기록 계속하기 버튼
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(dialogContext).pop();
                          // 녹음 재개
                          context.read<RecordingBloc>().add(
                            const RecordingEvent.resume(),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gray,
                          foregroundColor: AppColors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          '기록 계속하기',
                          style: AppTextStyles.semiBold16.copyWith(
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _workspaceBloc,
      child: BlocListener<RecordingBloc, RecordingState>(
        listener: (context, state) {
          // 녹음 종료 시 텍스트를 가지고 Processing 페이지로 이동
          if (state is RecordingStopped) {
            context.push('/processing', extra: state.recognizedText);
          }
        },
        child: Scaffold(
          body: Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/background.png'),
                fit: BoxFit.cover,
              ),
            ),
            child: BlocBuilder<RecordingBloc, RecordingState>(
            builder: (context, recordingState) {
              final isRecording = recordingState is RecordingInProgress ||
                  recordingState is RecordingPaused;
              final isPaused = recordingState is RecordingPaused;

            return Stack(
              children: [
                // 상단 헤더
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 16.0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // 로고 - 항상 보임
                        Image.asset('assets/images/logo.png', height: 32),
                        // 오른쪽 아이콘들 - 녹음 중에는 사라짐
                        AnimatedOpacity(
                          opacity: isRecording ? 0.0 : 1.0,
                          duration: const Duration(milliseconds: 300),
                          child: IgnorePointer(
                            ignoring: isRecording,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                CircularButton(
                                  onTap: () => context.push('/records'),
                                  containerSize: 38,
                                  imageSize: 24,
                                  blurRadius: 4,
                                  image: 'assets/images/menu_book.png',
                                ),

                                CircularButton(
                                  onTap: () => context.push('/mypage'),
                                  containerSize: 38,
                                  imageSize: 24,
                                  blurRadius: 4,
                                  image: 'assets/images/popo4.png',
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Popo 캐릭터 (하단에서 2/3 지점)
                SafeArea(
                  child: Align(
                    alignment: const Alignment(0, -0.33),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // 캐릭터 버튼 - AnimatedSwitcher로 부드러운 전환
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          transitionBuilder: (child, animation) {
                            return FadeTransition(
                              opacity: animation,
                              child: child,
                            );
                          },
                          child:
                              isRecording
                                  ? AnimatedCircularButton(
                                    key: const ValueKey('recording'),
                                    onTap: () {
                                      // 녹음 중단 (BlocListener가 자동으로 Processing 페이지로 이동)
                                      context.read<RecordingBloc>().add(
                                        const RecordingEvent.stop(),
                                      );
                                    },
                                    containerSize: 220,
                                    imageSize: 170,
                                    blurRadius: 6,
                                    image: 'assets/images/popo_listen.png',
                                    isPaused: isPaused,
                                  )
                                  : CircularButton(
                                    key: const ValueKey('idle'),
                                    onTap:
                                        () => context.read<RecordingBloc>().add(
                                          const RecordingEvent.start(),
                                        ),
                                    containerSize: 220,
                                    imageSize: 170,
                                    blurRadius: 6,
                                    image: 'assets/images/popo_record.png',
                                    showAura: true,
                                  ),
                        ),
                        // 녹음 중일 때 텍스트 및 X 버튼 표시
                        AnimatedSize(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                          child:
                              isRecording
                                  ? Column(
                                    children: [
                                      const SizedBox(height: 12),
                                      Text(
                                        '지금 떠오르는 아이디어를',
                                        style: AppTextStyles.semiBold20
                                            .copyWith(
                                              color: AppColors.semiBlack,
                                            ),
                                        textAlign: TextAlign.center,
                                      ),
                                      Text(
                                        '말해보세요.',
                                        style: AppTextStyles.semiBold20
                                            .copyWith(
                                              color: AppColors.semiBlack,
                                            ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 24),
                                      // X 버튼 (녹음 일시정지 및 다이얼로그)
                                      GestureDetector(
                                        onTap: () {
                                          // 녹음 일시정지
                                          context.read<RecordingBloc>().add(
                                            const RecordingEvent.pause(),
                                          );
                                          // 다이얼로그 표시
                                          _showStopRecordingDialog(context);
                                        },
                                        child: Container(
                                          width: 56,
                                          height: 56,
                                          decoration: BoxDecoration(
                                            color: AppColors.white,
                                            shape: BoxShape.circle,
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withOpacity(0.15),
                                                blurRadius: 10,
                                                offset: const Offset(0, 4),
                                              ),
                                            ],
                                          ),
                                          child: const Icon(
                                            Icons.close,
                                            color: AppColors.semiBlack,
                                            size: 32,
                                          ),
                                        ),
                                      ),
                                    ],
                                  )
                                  : const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                ),

                // 하단 BottomSheet (DraggableScrollableSheet)
                AnimatedSlide(
                  offset: isRecording ? const Offset(0, 1) : Offset.zero,
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOut,
                  child: DraggableScrollableSheet(
                    initialChildSize: 0.2,
                    minChildSize: 0.2,
                    maxChildSize: 0.9,
                    builder: (context, scrollController) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(50),
                            topRight: Radius.circular(50),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.11),
                              blurRadius: 7.2,
                              offset: const Offset(0, -4),
                              spreadRadius: 0,
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            // 드래그 핸들
                            Container(
                              margin: const EdgeInsets.only(top: 12, bottom: 8),
                              width: 40,
                              height: 4,
                              decoration: BoxDecoration(
                                color: Colors.grey[300],
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            // 컨텐츠
                            Expanded(
                              child: ListView(
                                controller: scrollController,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                ),
                                children: [
                                  const SizedBox(height: 24),
                                  Text(
                                    '최근 마인드맵',
                                    style: AppTextStyles.semiBold20.copyWith(
                                      color: AppColors.semiBlack,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  // 마인드맵 카드 리스트 (API 연동)
                                  BlocBuilder<WorkspaceBloc, WorkspaceState>(
                                    builder: (context, workspaceState) {
                                      return workspaceState.when(
                                        initial: () => const SizedBox.shrink(),
                                        loading: () => const Center(
                                          child: Padding(
                                            padding: EdgeInsets.all(32.0),
                                            child: CircularProgressIndicator(),
                                          ),
                                        ),
                                        loaded: (workspaces, hasNext, nextCursor) {
                                          if (workspaces.isEmpty) {
                                            return Center(
                                              child: Padding(
                                                padding: const EdgeInsets.all(32.0),
                                                child: Text(
                                                  '아직 마인드맵이 없습니다',
                                                  style: AppTextStyles.medium14.copyWith(
                                                    color: AppColors.gray,
                                                  ),
                                                ),
                                              ),
                                            );
                                          }

                                          return NotificationListener<ScrollNotification>(
                                            onNotification: (scrollInfo) {
                                              // 스크롤이 끝에 도달하고 더 불러올 데이터가 있을 때
                                              // loadingMore 상태가 아닐 때만 추가 로드
                                              final currentState = context.read<WorkspaceBloc>().state;
                                              final isLoadingMore = currentState is WorkspaceLoadingMore;

                                              if (!isLoadingMore &&
                                                  scrollInfo.metrics.pixels >= scrollInfo.metrics.maxScrollExtent - 200 &&
                                                  hasNext) {
                                                context.read<WorkspaceBloc>().add(
                                                  const WorkspaceEvent.loadMore(),
                                                );
                                              }
                                              return false;
                                            },
                                            child: Column(
                                              children: [
                                                ...workspaces.map((workspace) {
                                                  return MindmapCard(
                                                    title: workspace.title,
                                                    imagePath: workspace.thumbnail ?? '',
                                                    isNetworkImage: true,
                                                    onTap: () {
                                                      context.push(
                                                        '/mindmap',
                                                        extra: {
                                                          'title': workspace.title,
                                                          'imagePath': workspace.thumbnail ?? '',
                                                          'mindmapId': workspace.id.toString(),
                                                        },
                                                      );
                                                    },
                                                  );
                                                }).toList(),
                                                // hasNext가 true여도 loaded 상태에서는 로딩 인디케이터 표시 안 함
                                                // loadingMore 상태에서만 표시
                                              ],
                                            ),
                                          );
                                        },
                                        loadingMore: (workspaces) {
                                          return Column(
                                            children: [
                                              ...workspaces.map((workspace) {
                                                return MindmapCard(
                                                  title: workspace.title,
                                                  imagePath: workspace.thumbnail ?? '',
                                                  isNetworkImage: true,
                                                  onTap: () {
                                                    context.push(
                                                      '/mindmap',
                                                      extra: {
                                                        'title': workspace.title,
                                                        'imagePath': workspace.thumbnail ?? '',
                                                        'mindmapId': workspace.id.toString(),
                                                      },
                                                    );
                                                  },
                                                );
                                              }).toList(),
                                              const Padding(
                                                padding: EdgeInsets.all(16.0),
                                                child: CircularProgressIndicator(),
                                              ),
                                            ],
                                          );
                                        },
                                        error: (message) => Center(
                                          child: Padding(
                                            padding: const EdgeInsets.all(32.0),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text(
                                                  message,
                                                  style: AppTextStyles.medium14.copyWith(
                                                    color: AppColors.danger,
                                                  ),
                                                  textAlign: TextAlign.center,
                                                ),
                                                const SizedBox(height: 16),
                                                ElevatedButton(
                                                  onPressed: () {
                                                    context.read<WorkspaceBloc>().add(
                                                      const WorkspaceEvent.load(),
                                                    );
                                                  },
                                                  child: const Text('다시 시도'),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                  const SizedBox(height: 50),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
          ),
        ),
      ),
    );
  }
}
