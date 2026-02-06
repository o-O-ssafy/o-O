import 'package:flutter/material.dart';

/// 점박이 무늬 배경을 그리는 CustomPainter
class DottedBackgroundPainter extends CustomPainter {
  final Color dotColor;
  final double dotRadius;
  final double spacing;

  DottedBackgroundPainter({
    this.dotColor = const Color(0xFFDDDDDD),
    this.dotRadius = 1.5,
    this.spacing = 20.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = dotColor
      ..style = PaintingStyle.fill;

    // 가로/세로로 점 그리기
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), dotRadius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant DottedBackgroundPainter oldDelegate) {
    return oldDelegate.dotColor != dotColor ||
        oldDelegate.dotRadius != dotRadius ||
        oldDelegate.spacing != spacing;
  }
}
