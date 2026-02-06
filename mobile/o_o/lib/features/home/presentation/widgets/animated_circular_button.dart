import 'package:flutter/material.dart';

/// 애니메이션이 있는 원형 버튼 위젯
///
/// 오오라가 펄스(pulse) 애니메이션으로 반복됩니다.
class AnimatedCircularButton extends StatefulWidget {
  final VoidCallback onTap;
  final double containerSize;
  final double imageSize;
  final double blurRadius;
  final String image;
  final bool isPaused;

  const AnimatedCircularButton({
    super.key,
    required this.onTap,
    required this.containerSize,
    required this.imageSize,
    required this.image,
    this.blurRadius = 6,
    this.isPaused = false,
  });

  @override
  State<AnimatedCircularButton> createState() => _AnimatedCircularButtonState();
}

class _AnimatedCircularButtonState extends State<AnimatedCircularButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    // 크기 애니메이션: 1.2 → 1.4로 확장
    _scaleAnimation = Tween<double>(begin: 1.2, end: 1.5).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
      ),
    );

    // 투명도 애니메이션: 1.0 → 0.0으로 페이드아웃
    _opacityAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
      ),
    );

    // 일시정지 상태가 아니면 애니메이션 시작
    if (!widget.isPaused) {
      _controller.repeat(reverse: false);
    }
  }

  @override
  void didUpdateWidget(AnimatedCircularButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    // isPaused 상태가 변경되었을 때 애니메이션 제어
    if (oldWidget.isPaused != widget.isPaused) {
      if (widget.isPaused) {
        _controller.stop();
      } else {
        _controller.repeat(reverse: false);
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: SizedBox(
        width: widget.containerSize * 1.5,
        height: widget.containerSize * 1.5,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // 애니메이션 오오라 효과
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Opacity(
                  opacity: _opacityAnimation.value,
                  child: Transform.scale(
                    scale: _scaleAnimation.value,
                    child: Container(
                      width: widget.containerSize,
                      height: widget.containerSize,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            const Color(0xFF365EBF)
                                .withOpacity(0.8), // 중심: 80%
                            const Color(0xFF365EBF)
                                .withOpacity(0.6), // 68%: 60%
                            const Color(0xFF365EBF)
                                .withOpacity(0.0), // 가장자리: 0%
                          ],
                          stops: const [0.0, 0.68, 1.0],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            // 메인 버튼
            Container(
              width: widget.containerSize,
              height: widget.containerSize,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    offset: const Offset(0, 4),
                    blurRadius: widget.blurRadius,
                    spreadRadius: 0,
                  ),
                ],
              ),
              child: Center(
                child: Image.asset(
                  widget.image,
                  width: widget.imageSize,
                  height: widget.imageSize,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
