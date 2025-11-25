import 'package:flutter_dotenv/flutter_dotenv.dart';

/// API 관련 상수
class ApiConstants {
  ApiConstants._();

  /// Base URL (환경 변수에서 로드)
  static String get baseUrl => dotenv.env['API_BASE_URL']!;

  /// Auth Endpoints
  static const String googleLogin = '/auth/app/google-login';
  static const String reissue = '/auth/reissue';

  /// Workspace Endpoints
  static const String getWorkspaces = '/workspace/my';
  static const String getWorkspaceCalendar = '/workspace/my/calendar';
  static const String getRecentWorkspaces = '/workspace/my/recent';
  static const String getDailyActivity = '/workspace/my/activity/daily';

  /// 워크스페이스 썸네일 업로드
  static String uploadWorkspaceThumbnail(int workspaceId) => '/workspace/$workspaceId/thumbnail';

  /// User Endpoints
  static const String getUsers = '/users';

  /// Mindmap Endpoints
  static const String mindmap = '/mindmap';

  /// 워크스페이스 ID로 마인드맵 노드 조회
  static String getMindmapNodes(int workspaceId) => '$mindmap/$workspaceId/nodes';

  /// STT 텍스트로 마인드맵 생성
  static const String createMindmapFromStt = '/mindmap/stt-idea';

  /// 워크스페이스 ID로 노드 위치 업데이트
  static String updateNodePositions(int workspaceId) => '$mindmap/$workspaceId/nodes/positions';

  /// 전체 URL 생성
  static String getUrl(String endpoint) => '$baseUrl$endpoint';
}
