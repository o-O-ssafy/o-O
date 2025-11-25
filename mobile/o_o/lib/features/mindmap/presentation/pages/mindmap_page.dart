import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/mindmap.dart';
import '../bloc/mindmap_bloc.dart';
import '../bloc/mindmap_event.dart';
import '../bloc/mindmap_state.dart';
import '../widgets/mindmap_canvas_widget.dart';

/// 점박이 배경 Painter
class _DottedBackgroundPainter extends CustomPainter {
  final Color dotColor;
  final double dotRadius;
  final double spacing;

  _DottedBackgroundPainter({
    required this.dotColor,
    required this.dotRadius,
    required this.spacing,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = dotColor
      ..style = PaintingStyle.fill;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), dotRadius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DottedBackgroundPainter oldDelegate) {
    return oldDelegate.dotColor != dotColor ||
        oldDelegate.dotRadius != dotRadius ||
        oldDelegate.spacing != spacing;
  }
}

/// 마인드맵 상세 페이지
///
/// 마인드맵을 인터랙티브한 캔버스로 확대/축소하며 볼 수 있는 페이지입니다.
class MindmapPage extends StatefulWidget {
  /// 마인드맵 제목
  final String title;

  /// 마인드맵 이미지 경로 (assets 또는 네트워크 URL)
  final String imagePath;

  /// 워크스페이스 ID (마인드맵 로드용)
  final int? workspaceId;

  const MindmapPage({
    super.key,
    required this.title,
    required this.imagePath,
    this.workspaceId,
  });

  @override
  State<MindmapPage> createState() => _MindmapPageState();
}

class _MindmapPageState extends State<MindmapPage> {
  final TransformationController _transformationController =
      TransformationController();
  final GlobalKey _repaintKey = GlobalKey();
  String? _currentMindmapId;
  bool _hasThumbnailUploaded = false;

  @override
  void initState() {
    super.initState();
    _loadMindmap();
  }

  void _loadMindmap() {
    if (widget.workspaceId != null) {
      context.read<MindmapBloc>().add(
        MindmapEvent.loadMindmap(workspaceId: widget.workspaceId!),
      );
    }
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  void _resetZoom() {
    _transformationController.value = Matrix4.identity();
  }

  /// 초기 위치를 루트 노드가 화면 중앙에 오도록 설정
  /// 마인드맵이 변경될 때마다 실행
  void _setInitialPosition(BuildContext context, Mindmap mindmap) {
    // 같은 마인드맵이면 다시 설정하지 않음
    if (_currentMindmapId == mindmap.id) return;
    _currentMindmapId = mindmap.id;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;

      final screenWidth = MediaQuery.of(context).size.width;
      final screenHeight = MediaQuery.of(context).size.height;

      // 루트 노드 찾기 (레벨 0)
      final rootNode = mindmap.nodes.firstWhere(
        (node) => node.level == 0,
        orElse: () => mindmap.nodes.first,
      );

      // 루트 노드의 좌표를 화면 중앙에 표시
      final rootX = rootNode.position.dx;
      final rootY = rootNode.position.dy;

      logger.i('🎯 Initial view: Centering root node at ($rootX, $rootY)');

      // 화면 중앙에 루트 노드가 오도록 변환 행렬 계산
      final matrix = Matrix4.identity()
        ..translate(
          screenWidth / 2 - rootX,
          screenHeight / 2 - rootY,
        );

      _transformationController.value = matrix;
    });
  }

  /// 마인드맵 캔버스를 이미지로 캡쳐
  ///
  /// 전체 캔버스를 PNG 이미지로 캡쳐하여 Uint8List로 반환합니다.
  /// API로 multipart 전송 시 사용할 수 있습니다.
  ///
  /// Returns: 캡쳐된 이미지의 PNG 바이트 데이터, 실패 시 null
  Future<Uint8List?> captureMindmap() async {
    try {
      logger.i('📸 Starting mindmap canvas capture...');

      // RepaintBoundary의 RenderObject 가져오기
      final boundary = _repaintKey.currentContext?.findRenderObject()
          as RenderRepaintBoundary?;

      if (boundary == null) {
        logger.e('❌ RenderRepaintBoundary not found');
        return null;
      }

      // 이미지 생성 (원본 크기)
      final image = await boundary.toImage(pixelRatio: 1.0);
      logger.d('📐 Image size: ${image.width}x${image.height}');

      // PNG 바이트로 변환
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) {
        logger.e('❌ Failed to convert image to byte data');
        return null;
      }

      final pngBytes = byteData.buffer.asUint8List();
      logger.i('✅ Mindmap captured successfully (${pngBytes.length} bytes)');

      return pngBytes;
    } catch (e, stackTrace) {
      logger.e('❌ Failed to capture mindmap: $e');
      logger.e('📍 StackTrace: $stackTrace');
      return null;
    }
  }

  /// 썸네일이 null일 때 캡쳐하여 업로드
  ///
  /// 워크스페이스의 썸네일이 null이거나 비어있을 때만 캡쳐 후 업로드합니다.
  /// 한 번만 실행되도록 _hasThumbnailUploaded 플래그로 관리합니다.
  void _uploadThumbnailIfNeeded() {
    // 이미 업로드했거나, workspaceId가 없거나, thumbnail이 이미 있으면 스킵
    if (_hasThumbnailUploaded ||
        widget.workspaceId == null ||
        (widget.imagePath.isNotEmpty)) {
      logger.d('🔍 Thumbnail upload skipped (uploaded: $_hasThumbnailUploaded, workspaceId: ${widget.workspaceId}, imagePath: ${widget.imagePath})');
      return;
    }

    logger.i('🚀 Starting thumbnail upload (thumbnail is null)');
    _hasThumbnailUploaded = true;

    // 다음 프레임에서 실행 (위젯 트리가 완전히 빌드된 후)
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      // 약간의 딜레이를 줘서 렌더링이 완료되도록 함
      await Future.delayed(const Duration(milliseconds: 500));

      // 캔버스 캡쳐
      final imageBytes = await captureMindmap();
      if (imageBytes == null) {
        logger.w('⚠️ Failed to capture mindmap for thumbnail');
        return;
      }

      // BLoC를 통해 업로드
      if (mounted) {
        context.read<MindmapBloc>().uploadThumbnail(
          workspaceId: widget.workspaceId!,
          imageBytes: imageBytes,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // 상단 헤더
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 20.0,
                vertical: 16.0,
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // 제목 (중앙)
                  Center(
                    child: Text(
                      widget.title,
                      style: AppTextStyles.semiBold20.copyWith(
                        color: AppColors.semiBlack,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  // X 버튼 (오른쪽)
                  Positioned(
                    right: 0,
                    child: GestureDetector(
                      onTap: () => context.pop(),
                      child: const Icon(
                        Icons.close,
                        size: 24,
                        color: AppColors.semiBlack,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 마인드맵 캔버스 영역 (BLoC State 기반)
            Expanded(
              child: BlocBuilder<MindmapBloc, MindmapState>(
                builder: (context, state) {
                  return state.when(
                    initial: () => const Center(
                      child: Text('마인드맵을 불러오는 중...'),
                    ),
                    loading: () => const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.deepBlue,
                      ),
                    ),
                    loaded: (mindmap) => LayoutBuilder(
                      builder: (context, constraints) {
                        // 마인드맵이 로드되면 초기 위치 설정 (루트 노드 중심)
                        _setInitialPosition(context, mindmap);

                        // 썸네일이 null일 때만 캡쳐 후 업로드
                        _uploadThumbnailIfNeeded();

                        return Stack(
                          children: [
                            // 전체 화면을 덮는 점박이 배경
                            CustomPaint(
                              size: Size(constraints.maxWidth, constraints.maxHeight),
                              painter: _DottedBackgroundPainter(
                                dotColor: Colors.grey.withOpacity(0.3),
                                dotRadius: 1.5,
                                spacing: 20.0,
                              ),
                            ),
                            // InteractiveViewer
                            InteractiveViewer(
                              transformationController: _transformationController,
                              minScale: 0.1,
                              maxScale: 5.0,
                              boundaryMargin: const EdgeInsets.all(80),
                              panEnabled: true,
                              scaleEnabled: true,
                              constrained: false,
                              child: Center(
                                child: MindmapCanvasWidget(
                                  mindmap: mindmap,
                                  repaintKey: _repaintKey,
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                    error: (message) => Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 64,
                            color: AppColors.danger,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            message,
                            style: AppTextStyles.regular16.copyWith(
                              color: AppColors.danger,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: _loadMindmap,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.deepBlue,
                              foregroundColor: AppColors.white,
                            ),
                            child: const Text('다시 시도'),
                          ),
                        ],
                      ),
                    ),
                    // 마인드맵 생성 관련 상태들 (이 페이지에서는 사용하지 않음)
                    creating: () => const Center(
                      child: Text('마인드맵을 불러오는 중...'),
                    ),
                    created: (_) => const Center(
                      child: Text('마인드맵을 불러오는 중...'),
                    ),
                    createError: (_) => const Center(
                      child: Text('마인드맵을 불러오는 중...'),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
