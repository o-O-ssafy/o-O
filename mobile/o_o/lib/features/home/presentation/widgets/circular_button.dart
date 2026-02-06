import 'dart:ui';

import 'package:flutter/material.dart';

/// 원형 버튼 위젯
///
/// 흰색 원형 배경에 이미지가 들어간 버튼
class CircularButton extends StatelessWidget {
  final VoidCallback onTap;
  final double containerSize;
  final double imageSize;
  final double blurRadius;
  final String image;
  final bool showAura;

  const CircularButton({
    super.key,
    required this.onTap,
    required this.containerSize,
    required this.imageSize,
    required this.image,
    this.blurRadius = 6,
    this.showAura = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: containerSize * 1.3,
        height: containerSize * 1.3,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // 파란색 오오라 효과 (선택적)
            if (showAura)
              ClipOval(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 200, sigmaY: 200),
                  child: Container(
                    width: containerSize * 1.3,
                    height: containerSize * 1.3,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          const Color(0xFF365EBF)
                              .withOpacity(0.29), // 중심: 100%
                          const Color(0xFF365EBF).withOpacity(0.29), // 68%: 29%
                          const Color(0xFF365EBF).withOpacity(0.1), // 85%: 10%
                          const Color(0xFF365EBF)
                              .withOpacity(0.0), // 가장자리: 0%
                        ],
                        stops: const [0.0, 0.68, 0.85, 1.0],
                      ),
                    ),
                  ),
                ),
              ),
            // 메인 버튼
            Container(
              width: containerSize,
              height: containerSize,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    offset: const Offset(0, 4),
                    blurRadius: blurRadius,
                    spreadRadius: 0,
                  ),
                ],
              ),
              child: Center(
                child: Image.asset(image, width: imageSize, height: imageSize),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
