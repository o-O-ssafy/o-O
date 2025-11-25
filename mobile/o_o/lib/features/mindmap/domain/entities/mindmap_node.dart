import 'package:flutter/material.dart';

/// 노드 콘텐츠 타입
enum NodeContentType {
  text,
  video,  // youtube → video로 변경 (API 스펙에 맞춤)
  image,
}

/// 마인드맵 노드
///
/// 마인드맵의 각 노드를 나타냅니다.
class MindmapNode {
  /// 노드 ID (API id)
  final String id;

  /// 서버 숫자 ID (API nodeId)
  final int? nodeId;

  /// 워크스페이스 ID (API workspaceId)
  final int? workspaceId;

  /// 부모 노드 ID (API parentId)
  final int? parentId;

  /// 노드 텍스트 (API keyword)
  final String text;

  /// 노드 위치 (노드 중심의 캔버스 좌표)
  final Offset position;

  /// 노드 배경 색상 (API color)
  final Color color;

  /// 노드 너비
  final double width;

  /// 노드 높이
  final double height;

  /// 노드 레벨 (0: 중심, 1: 1차 자식, 2: 2차 자식...)
  final int level;

  /// 노드 콘텐츠 타입 (API type)
  final NodeContentType contentType;

  /// 콘텐츠 URL (YouTube URL 또는 이미지 URL - keyword에서 추출)
  final String? contentUrl;

  /// 콘텐츠 설명/메모 (API memo)
  final String? description;

  /// 분석 상태 (API analysisStatus)
  final String? analysisStatus;

  /// 생성일시 (API createdAt)
  final DateTime? createdAt;

  /// 수정일시 (API updatedAt)
  final DateTime? updatedAt;

  const MindmapNode({
    required this.id,
    this.nodeId,
    this.workspaceId,
    this.parentId,
    required this.text,
    required this.position,
    required this.color,
    this.width = 128,
    this.height = 128,
    this.level = 0,
    this.contentType = NodeContentType.text,
    this.contentUrl,
    this.description,
    this.analysisStatus,
    this.createdAt,
    this.updatedAt,
  });

  /// 노드의 중심점을 반환합니다
  /// position이 이미 노드의 중심 좌표입니다
  Offset get center => position;

  MindmapNode copyWith({
    String? id,
    int? nodeId,
    int? workspaceId,
    int? parentId,
    String? text,
    Offset? position,
    Color? color,
    double? width,
    double? height,
    int? level,
    NodeContentType? contentType,
    String? contentUrl,
    String? description,
    String? analysisStatus,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return MindmapNode(
      id: id ?? this.id,
      nodeId: nodeId ?? this.nodeId,
      workspaceId: workspaceId ?? this.workspaceId,
      parentId: parentId ?? this.parentId,
      text: text ?? this.text,
      position: position ?? this.position,
      color: color ?? this.color,
      width: width ?? this.width,
      height: height ?? this.height,
      level: level ?? this.level,
      contentType: contentType ?? this.contentType,
      contentUrl: contentUrl ?? this.contentUrl,
      description: description ?? this.description,
      analysisStatus: analysisStatus ?? this.analysisStatus,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
