import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

import '../../domain/entities/mindmap_node.dart';

part 'mindmap_node_model.freezed.dart';
part 'mindmap_node_model.g.dart';

/// Mindmap Node Model (API Response)
@freezed
class MindmapNodeModel with _$MindmapNodeModel {
  const factory MindmapNodeModel({
    required String id,
    required int nodeId,
    required int workspaceId,
    int? parentId,
    required String type,
    required String keyword,
    String? memo,
    required String analysisStatus,
    double? x,
    double? y,
    String? color,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _MindmapNodeModel;

  factory MindmapNodeModel.fromJson(Map<String, dynamic> json) =>
      _$MindmapNodeModelFromJson(json);

  const MindmapNodeModel._();

  /// Entity로 변환 (레벨 정보 필요)
  MindmapNode toEntity({
    required int level,
    required Offset position,
  }) {
    final contentType = _parseContentType(type);
    final contentUrl = _extractUrl(keyword, contentType);

    return MindmapNode(
      id: id,
      nodeId: nodeId,
      workspaceId: workspaceId,
      parentId: parentId,
      text: keyword,
      position: position,
      color: _parseColor(color),
      width: 128,
      height: 128,
      level: level,
      contentType: contentType,
      contentUrl: contentUrl,
      description: memo,
      analysisStatus: analysisStatus,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// 랜덤 색상 팔레트
  static const List<Color> _colorPalette = [
    Color(0xFFFFD0EA), // 분홍
    Color(0xFFFFEEAC), // 노랑
    Color(0xFFC2F0F9), // 하늘색
    Color(0xFFEFB39B), // 살구색
    Color(0xFFB9BDFF), // 보라
    Color(0xFFC2DCF9), // 연한 파랑
    Color(0xFFC3F9C2), // 연두
  ];

  /// Color 파싱 (hex → Color)
  Color _parseColor(String? hexColor) {
    try {
      // null이거나 빈 문자열이면 랜덤 색상 반환
      if (hexColor == null || hexColor.isEmpty) {
        final random = math.Random();
        return _colorPalette[random.nextInt(_colorPalette.length)];
      }

      final hex = hexColor.replaceFirst('#', '');
      if (hex.length == 6) {
        return Color(int.parse('0xFF$hex'));
      } else if (hex.length == 8) {
        return Color(int.parse('0x$hex'));
      }

      // 파싱 실패 시 랜덤 색상 반환
      final random = math.Random();
      return _colorPalette[random.nextInt(_colorPalette.length)];
    } catch (e) {
      // 예외 발생 시 랜덤 색상 반환
      final random = math.Random();
      return _colorPalette[random.nextInt(_colorPalette.length)];
    }
  }

  /// ContentType 파싱
  NodeContentType _parseContentType(String type) {
    switch (type.toLowerCase()) {
      case 'video':
        return NodeContentType.video;
      case 'image':
        return NodeContentType.image;
      case 'text':
      default:
        return NodeContentType.text;
    }
  }

  /// keyword에서 URL 추출
  String? _extractUrl(String keyword, NodeContentType type) {
    if (type == NodeContentType.text) return null;

    // URL 패턴 찾기
    final urlPattern = RegExp(
      r'https?://[^\s]+',
      caseSensitive: false,
    );
    final match = urlPattern.firstMatch(keyword);
    return match?.group(0);
  }
}
