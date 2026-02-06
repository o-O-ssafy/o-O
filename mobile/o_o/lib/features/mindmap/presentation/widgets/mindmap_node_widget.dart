import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/color_utils.dart';
import '../../domain/entities/mindmap_node.dart';

/// 마인드맵 노드 위젯
class MindmapNodeWidget extends StatefulWidget {
  final MindmapNode node;
  final VoidCallback? onTap;
  final ValueChanged<bool>? onExpansionChanged;

  const MindmapNodeWidget({
    super.key,
    required this.node,
    this.onTap,
    this.onExpansionChanged,
  });

  @override
  State<MindmapNodeWidget> createState() => _MindmapNodeWidgetState();
}

class _MindmapNodeWidgetState extends State<MindmapNodeWidget> {
  YoutubePlayerController? _youtubeController;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _initializeYoutubePlayer();
  }

  @override
  void dispose() {
    _youtubeController?.dispose();
    super.dispose();
  }

  void _initializeYoutubePlayer() {
    if (widget.node.contentType == NodeContentType.video &&
        widget.node.contentUrl != null) {
      final videoId = YoutubePlayer.convertUrlToId(widget.node.contentUrl!);
      if (videoId != null) {
        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            enableCaption: true,
            controlsVisibleAtStart: true,
            isLive: false,
            forceHD: false,
            useHybridComposition: true,
          ),
        );
      }
    }
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
    });
    // 부모 위젯에 확장 상태 변경 알림
    widget.onExpansionChanged?.call(_isExpanded);
  }

  @override
  Widget build(BuildContext context) {
    switch (widget.node.contentType) {
      case NodeContentType.text:
        return _buildTextNode();
      case NodeContentType.video:
        return _buildYoutubeNodeStack();
      case NodeContentType.image:
        return _buildImageNodeStack();
    }
  }

  /// 텍스트 노드 빌드 (기존 원형 노드)
  Widget _buildTextNode() {
    final size = widget.node.width;
    final glowSize = size * 1.5;

    return Positioned(
      left: widget.node.position.dx - glowSize / 2,
      top: widget.node.position.dy - glowSize / 2,
      child: GestureDetector(
        onTap: widget.onTap,
        child: SizedBox(
          width: glowSize,
          height: glowSize,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Radial gradient (웹과 동일)
              Container(
                width: glowSize,
                height: glowSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      widget.node.color.withOpacity(1.0),   // center
                      widget.node.color.withOpacity(0.5),
                      widget.node.color.withOpacity(0.0),   // edge
                    ],
                    stops: const [0.0, 0.68, 1.0],
                  ),
                ),
              ),
              // 실제 노드
              Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      widget.node.color.withOpacity(0.8),   // center
                      widget.node.color.withOpacity(0.0),
                    ],
                    stops: const [0.0, 1.0],
                  ),
                ),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text(
                      widget.node.text,
                      style: _getTextStyle(widget.node.level),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// YouTube 노드 빌드 (Stack 사용)
  Widget _buildYoutubeNodeStack() {
    // 노드의 기본 크기 (원형)
    final nodeSize = widget.node.width;
    final glowSize = nodeSize * 1.5;

    // 확장된 컨텐츠 크기
    const expandedWidth = 280.0;
    const expandedHeight = 350.0;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // 원형 노드 (고정 위치)
        Positioned(
          left: widget.node.position.dx - glowSize / 2,
          top: widget.node.position.dy - glowSize / 2,
          child: GestureDetector(
            onTap: _toggleExpanded,
            child: SizedBox(
              width: glowSize,
              height: glowSize,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Radial gradient (웹과 동일)
                  Container(
                    width: glowSize,
                    height: glowSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          widget.node.color.withOpacity(1.0),   // center
                          widget.node.color.withOpacity(0.5),
                          widget.node.color.withOpacity(0.0),   // edge
                        ],
                        stops: const [0.0, 0.68, 1.0],
                      ),
                    ),
                  ),
                  // 실제 노드
                  Container(
                    width: nodeSize,
                    height: nodeSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          widget.node.color.withOpacity(0.8),   // center
                          widget.node.color.withOpacity(0.0),
                        ],
                        stops: const [0.0, 1.0],
                      ),
                    ),
                    child: Center(
                      child: Image.asset(
                        'assets/images/youtube.png',
                        height: nodeSize * 0.5,
                        width: nodeSize * 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // 확장된 컨텐츠 (노드 아래 고정 위치)
        if (_isExpanded)
          Positioned(
            left: widget.node.position.dx - expandedWidth / 2,
            top: widget.node.position.dy + glowSize / 2 + 8,
            child: Container(
              width: expandedWidth,
              height: expandedHeight,
              decoration: BoxDecoration(
                color: widget.node.color,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: widget.node.color.withOpacity(0.3),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Column(
                  children: [
                    // YouTube 플레이어
                    if (_youtubeController != null)
                      SizedBox(
                        height: 160,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 16, top: 16, right: 16, bottom: 0),
                          child: YoutubePlayer(
                            controller: _youtubeController!,
                            showVideoProgressIndicator: true,
                            progressIndicatorColor: Colors.red,
                            progressColors: const ProgressBarColors(
                              playedColor: Colors.red,
                              handleColor: Colors.redAccent,
                            ),
                            onReady: () {
                              debugPrint('YouTube Player Ready');
                            },
                            onEnded: (metaData) {
                              debugPrint('Video Ended');
                            },
                            bottomActions: [
                              const SizedBox(width: 14.0),
                              CurrentPosition(),
                              const SizedBox(width: 8.0),
                              ProgressBar(isExpanded: true),
                              RemainingDuration(),
                              const PlaybackSpeedButton(),
                            ],
                          ),
                        ),
                      )
                    else
                      SizedBox(
                        height: 160,
                        child: Container(
                          color: Colors.black,
                          child: Center(
                            child: Image.asset(
                              'assets/images/youtube.png',
                              height: 48,
                              width: 48,
                            ),
                          ),
                        ),
                      ),
                    Expanded(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        color: widget.node.color,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '🧩 AI 요약 내용',
                              style: AppTextStyles.semiBold14.copyWith(
                                color: ColorUtils.getContrastTextColor(widget.node.color),
                              ),
                            ),
                            const SizedBox(height: 8),
                            // 설명 텍스트
                            Expanded(
                              child: SingleChildScrollView(
                                child: Text(
                                  widget.node.description ?? widget.node.text,
                                  style: AppTextStyles.regular12.copyWith(
                                    color: ColorUtils.getContrastTextColor(widget.node.color),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  /// 이미지 노드 빌드 (Stack 사용)
  Widget _buildImageNodeStack() {
    // 노드의 기본 크기 (원형)
    final nodeSize = widget.node.width;
    final glowSize = nodeSize * 1.5;

    // 확장된 컨텐츠 크기
    const expandedWidth = 250.0;
    const expandedHeight = 350.0;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // 원형 노드 (고정 위치)
        Positioned(
          left: widget.node.position.dx - glowSize / 2,
          top: widget.node.position.dy - glowSize / 2,
          child: GestureDetector(
            onTap: _toggleExpanded,
            child: SizedBox(
              width: glowSize,
              height: glowSize,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Radial gradient (웹과 동일)
                  Container(
                    width: glowSize,
                    height: glowSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          widget.node.color.withOpacity(1.0),   // center
                          widget.node.color.withOpacity(0.5),
                          widget.node.color.withOpacity(0.0),   // edge
                        ],
                        stops: const [0.0, 0.68, 1.0],
                      ),
                    ),
                  ),
                  // 실제 노드
                  Container(
                    width: nodeSize,
                    height: nodeSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          widget.node.color.withOpacity(0.8),   // center
                          widget.node.color.withOpacity(0.0),
                        ],
                        stops: const [0.0, 1.0],
                      ),
                    ),
                    child: Center(
                      child: Image.asset(
                        'assets/images/image.png',
                        width: nodeSize * 0.5,
                        height: nodeSize * 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // 확장된 컨텐츠 (노드 아래 고정 위치)
        if (_isExpanded)
          Positioned(
            left: widget.node.position.dx - expandedWidth / 2,
            top: widget.node.position.dy + glowSize / 2 + 8,
            child: Container(
              width: expandedWidth,
              height: expandedHeight,
              decoration: BoxDecoration(
                color: widget.node.color,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: widget.node.color.withOpacity(0.3),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Column(
                  children: [
                    // 이미지
                    if (widget.node.contentUrl != null)
                      SizedBox(
                        height: 160,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 16, top: 16, right: 16, bottom: 0),
                          child: CachedNetworkImage(
                            imageUrl: widget.node.contentUrl!,
                            fit: BoxFit.cover,
                            height: double.infinity,
                            width: double.infinity,
                            placeholder:
                                (context, url) => const Center(
                                  child: CircularProgressIndicator(),
                                ),
                            errorWidget:
                                (context, url, error) => const Center(
                                  child: Icon(
                                    Icons.broken_image,
                                    size: 48,
                                    color: Colors.grey,
                                  ),
                                ),
                          ),
                        ),
                      )
                    else
                      SizedBox(
                        height: 160,
                        child: Container(
                          color: widget.node.color,
                          child: Center(
                            child: Image.asset(
                              'assets/images/image.png',
                              width: 48,
                              height: 48,
                            ),
                          ),
                        ),
                      ),
                    Expanded(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        color: widget.node.color,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '🧩 AI 요약 내용',
                              style: AppTextStyles.semiBold14.copyWith(
                                color: ColorUtils.getContrastTextColor(widget.node.color),
                              ),
                            ),
                            const SizedBox(height: 8),
                            // 설명 텍스트
                            Expanded(
                              child: SingleChildScrollView(
                                child: Text(
                                  widget.node.description ?? widget.node.text,
                                  style: AppTextStyles.regular12.copyWith(
                                    color: ColorUtils.getContrastTextColor(widget.node.color),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  /// 레벨에 따라 텍스트 스타일 반환
  TextStyle _getTextStyle(int level) {
    // 배경색에 따라 최적의 텍스트 색상 계산 (WCAG 기준)
    final textColor = ColorUtils.getContrastTextColor(widget.node.color);

    switch (level) {
      case 0:
        // 중심 노드
        return AppTextStyles.semiBold18.copyWith(
          color: textColor,
          fontWeight: FontWeight.w700,
        );
      case 1:
        // 1차 노드
        return AppTextStyles.semiBold16.copyWith(color: textColor);
      default:
        // 2차 이상 노드
        return AppTextStyles.medium14.copyWith(color: textColor);
    }
  }
}
