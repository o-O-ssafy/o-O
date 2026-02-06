import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:flame/game.dart';
import 'package:flame/events.dart';
import 'package:flame_forge2d/flame_forge2d.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../core/utils/app_logger.dart';
import '../../../workspace/domain/entities/workspace_calendar_entity.dart';
import '../bloc/user_bloc.dart';
import '../bloc/user_event.dart';
import '../bloc/user_state.dart';

/// 키워드 구슬 데이터
class KeywordMarble {
  final String keyword;
  final int weight;

  KeywordMarble({
    required this.keyword,
    required this.weight,
  });
}

/// 구슬 물리 컴포넌트
class MarbleComponent extends BodyComponent {
  final String keyword;
  final double radius;
  final Color color;
  final Vector2 initialPosition;
  final ui.Image marbleImage;

  MarbleComponent({
    required this.keyword,
    required this.radius,
    required this.initialPosition,
    required this.marbleImage,
    this.color = Colors.white,
  }) : super(
          priority: 1,
        );

  @override
  Body createBody() {
    final shape = CircleShape()..radius = radius;

    final fixtureDef = FixtureDef(
      shape,
      restitution: 0.2, // 반발력 약간 증가 (살짝 튐)
      density: 3.0, // 밀도 더 높게 (더 무거운 구슬)
      friction: 0.5, // 마찰력 중간 (적당히 미끄러짐)
    );

    final bodyDef = BodyDef(
      position: initialPosition,
      type: BodyType.dynamic,
      angularDamping: 0.8, // 회전 감쇠
      linearDamping: 0.3, // 선형 감쇠
      bullet: true, // CCD 활성화 (빠른 충돌 감지)
      allowSleep: false, // 구슬이 sleep 모드로 전환되지 않도록
    );

    return world.createBody(bodyDef)..createFixture(fixtureDef);
  }

  @override
  void render(Canvas canvas) {
    // marble.png 이미지 그리기
    final size = radius * 2;
    final srcRect = Rect.fromLTWH(
      0,
      0,
      marbleImage.width.toDouble(),
      marbleImage.height.toDouble(),
    );
    final dstRect = Rect.fromLTWH(
      -radius,
      -radius,
      size,
      size,
    );

    // 원본 이미지 사용 (색상 필터 제거)
    final paint = Paint()
      ..filterQuality = FilterQuality.high
      ..isAntiAlias = true;

    canvas.drawImageRect(marbleImage, srcRect, dstRect, paint);

    // 키워드 텍스트
    final textPainter = TextPainter(
      text: TextSpan(
        text: keyword,
        style: TextStyle(
          color: AppColors.semiBlack,
          fontSize: (radius * 0.35).clamp(10, 18),
          fontWeight: FontWeight.bold,
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
      maxLines: 2,
    );

    textPainter.layout(maxWidth: radius * 1.5);
    textPainter.paint(
      canvas,
      Offset(-textPainter.width / 2, -textPainter.height / 2),
    );
  }
}

/// 구슬 물리 게임
class MarblePhysicsGame extends Forge2DGame {
  final List<KeywordMarble> marbles;
  final Size screenSize;

  MarblePhysicsGame({
    required this.marbles,
    required this.screenSize,
  }) : super(
          gravity: Vector2(0, 1000), // 중력 증가 (더 빠르게 떨어지도록)
        );

  @override
  Color backgroundColor() => const Color(0x00000000); // 투명 배경

  @override
  Future<void> onLoad() async {
    await super.onLoad();

    // marble.png 이미지 미리 로드
    final marbleImage = await images.load('marble.png');

    // 카메라 설정 - 픽셀을 월드 좌표로 직접 매핑
    camera.viewfinder.zoom = 1;
    camera.viewfinder.position = Vector2(screenSize.width / 2, screenSize.height / 2);

    final random = Random();
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.pink,
      Colors.teal,
    ];

    // 바닥 생성 (화면 맨 아래)
    _createGround();

    // 벽 생성
    _createWalls();

    // 구슬들 생성
    for (int i = 0; i < marbles.length; i++) {
      final marble = marbles[i];
      final radius = _getMarbleRadius(marble.weight, marbles.length);

      // 화면 중앙에서 랜덤 위치로 떨어뜨림
      final x = screenSize.width * 0.2 + random.nextDouble() * (screenSize.width * 0.6);
      final y = -100 - (i * 120.0); // 구슬이 작아져서 간격 조정

      final marbleComponent = MarbleComponent(
        keyword: marble.keyword,
        radius: radius,
        initialPosition: Vector2(x, y),
        marbleImage: marbleImage,
        color: colors[i % colors.length],
      );

      await add(marbleComponent);
    }
  }

  /// 바닥 생성
  void _createGround() {
    // 화면 맨 아래에서 20픽셀 위
    final groundY = screenSize.height - 20;
    final groundBody = world.createBody(BodyDef(position: Vector2(screenSize.width / 2, groundY)));

    final shape = EdgeShape()
      ..set(Vector2(-screenSize.width, 0), Vector2(screenSize.width, 0));

    groundBody.createFixture(FixtureDef(shape, friction: 0.8));
  }

  /// 벽 생성
  void _createWalls() {
    final centerY = screenSize.height / 2;

    // 왼쪽 벽 (화면 왼쪽 가장자리)
    final leftWall = world.createBody(BodyDef(position: Vector2(20, centerY)));
    final leftShape = EdgeShape()..set(Vector2(0, -screenSize.height), Vector2(0, screenSize.height));
    leftWall.createFixture(FixtureDef(leftShape, friction: 0.3, restitution: 0.2));

    // 오른쪽 벽 (화면 오른쪽 가장자리)
    final rightWall = world.createBody(BodyDef(position: Vector2(screenSize.width - 20, centerY)));
    final rightShape = EdgeShape()..set(Vector2(0, -screenSize.height), Vector2(0, screenSize.height));
    rightWall.createFixture(FixtureDef(rightShape, friction: 0.3, restitution: 0.2));
  }

  /// 가중치에 따른 구슬 반지름 계산 (픽셀 단위)
  double _getMarbleRadius(int weight, int totalMarbles) {
    final baseSize = totalMarbles <= 3 ? 40.0 : (totalMarbles <= 6 ? 35.0 : 30.0);
    final sizeMultiplier = totalMarbles <= 3 ? 6.0 : (totalMarbles <= 6 ? 5.0 : 4.0);

    return baseSize + (weight * sizeMultiplier);
  }
}

/// 마이페이지
class MyPage extends StatelessWidget {
  const MyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<UserBloc>()..add(const UserEvent.load()),
      child: const _MyPageContent(),
    );
  }
}

class _MyPageContent extends StatefulWidget {
  const _MyPageContent();

  @override
  State<_MyPageContent> createState() => _MyPageState();
}

class _MyPageState extends State<_MyPageContent> {
  List<KeywordMarble> marbles = [];
  MarblePhysicsGame? game;
  final Random random = Random();

  @override
  void initState() {
    super.initState();
    logger.i('🔵 [MyPage] initState');
    // 캘린더 API는 BlocListener에서 UserLoaded 상태일 때 호출
  }

  /// API 데이터로 구슬 생성
  List<KeywordMarble> _generateMarblesFromKeywords(List<String> keywords) {
    logger.i('🎨 [MyPage] 구슬 생성 시작 - 키워드 개수: ${keywords.length}');

    if (keywords.isEmpty) {
      logger.w('⚠️ [MyPage] 키워드가 비어있음 - 구슬 생성 안됨');
      return [];
    }

    final marbles = keywords.map((keyword) {
      // 가중치는 1-10 사이 랜덤
      final weight = random.nextInt(10) + 1;
      logger.d('  - 구슬: "$keyword" (weight: $weight)');
      return KeywordMarble(
        keyword: keyword,
        weight: weight,
      );
    }).toList();

    logger.i('✅ [MyPage] 구슬 생성 완료 - 총 ${marbles.length}개');
    return marbles;
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final topPadding = mediaQuery.padding.top;
    final screenSize = mediaQuery.size;

    return BlocListener<UserBloc, UserState>(
      listener: (context, state) {
        logger.i('🔔 [MyPage] BlocListener - 상태 변경: ${state.runtimeType}');

        // UserLoaded 상태일 때
        if (state is UserLoaded) {
          logger.i('📦 [MyPage] UserLoaded 상태 감지 - keywords: ${state.keywords?.length ?? 0}개');

          // keywords가 null이면 캘린더 API 호출
          if (state.keywords == null) {
            logger.i('🚀 [MyPage] keywords가 null - 캘린더 API 호출');
            context.read<UserBloc>().add(const UserEvent.loadCalendar());
            return; // 여기서 종료 (API 완료 후 다시 listener 호출됨)
          }

          // keywords가 있으면 구슬 생성
          if (state.keywords!.isNotEmpty) {
            logger.i('✨ [MyPage] 키워드 데이터 있음 - 구슬 생성 시작');
            setState(() {
              marbles = _generateMarblesFromKeywords(state.keywords!);
              // 게임 재생성 (구슬이 업데이트되었으므로)
              game = MarblePhysicsGame(
                marbles: marbles,
                screenSize: screenSize,
              );
            });
            logger.i('🎮 [MyPage] 게임 재생성 완료');
          } else {
            logger.w('⚠️ [MyPage] 키워드가 비어있음 (빈 리스트)');
          }
        }
      },
      child: _buildScaffold(screenSize, topPadding),
    );
  }

  Widget _buildScaffold(Size screenSize, double topPadding) {
    // 게임 인스턴스가 없으면 생성 (초기 빈 상태)
    game ??= MarblePhysicsGame(
      marbles: marbles,
      screenSize: screenSize,
    );

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: Stack(
          children: [
            // 물리 시뮬레이션 게임 위젯
            Positioned.fill(
              child: GameWidget(game: game!),
            ),
            // 상단 컨텐츠
            Positioned(
              top: topPadding + 16,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  // 헤더 - 로고만
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: GestureDetector(
                        onTap: () => context.go('/'),
                        child: Image.asset(
                          'assets/images/logo.png',
                          height: 32,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  // 프로필 이미지 (API에서 받은 profileImage 사용)
                  BlocBuilder<UserBloc, UserState>(
                    builder: (context, state) {
                      return Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 20,
                              spreadRadius: 5,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: state is UserLoaded && state.user.profileImage.isNotEmpty
                                ? Image.asset(
                                    'assets/images/${state.user.profileImage}.png',
                                    fit: BoxFit.contain,
                                    errorBuilder: (context, error, stackTrace) {
                                      // 이미지 로드 실패 시 빈 상태 표시
                                      logger.e('❌ [MyPage] 프로필 이미지 로드 실패: ${state.user.profileImage}.png');
                                      return const SizedBox.shrink();
                                    },
                                  )
                                : state is UserLoading
                                    ? const Center(child: CircularProgressIndicator())
                                    : const SizedBox.shrink(), // 로딩 전이나 에러 시 빈 상태
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 32),
                  // 사용자 정보 (API 연동)
                  BlocBuilder<UserBloc, UserState>(
                    builder: (context, state) {
                      return state.when(
                        initial: () => const SizedBox.shrink(),
                        loading: () => const CircularProgressIndicator(),
                        loaded: (user, keywords) => Column(
                          children: [
                            // 닉네임
                            Text(
                              user.nickname,
                              style: AppTextStyles.semiBold20.copyWith(
                                color: AppColors.semiBlack,
                              ),
                            ),
                            const SizedBox(height: 8),
                            // 이메일
                            Text(
                              user.email,
                              style: AppTextStyles.regular15.copyWith(
                                color: AppColors.blackGray,
                              ),
                            ),
                          ],
                        ),
                        error: (message) => Text(
                          message,
                          style: AppTextStyles.regular16.copyWith(
                            color: AppColors.danger,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
