import 'dart:typed_data';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/utils/app_logger.dart';
import '../../../workspace/domain/usecases/upload_workspace_thumbnail.dart';
import '../../domain/entities/mindmap.dart';
import '../../domain/usecases/create_mindmap_from_text.dart';
import '../../domain/usecases/get_mindmap_nodes.dart';
import '../../domain/usecases/update_node_positions.dart';
import 'mindmap_event.dart';
import 'mindmap_state.dart';

/// Mindmap BLoC
class MindmapBloc extends Bloc<MindmapEvent, MindmapState> {
  final GetMindmapNodes getMindmapNodes;
  final CreateMindmapFromText createMindmapFromText;
  final UpdateNodePositions updateNodePositions;
  final UploadWorkspaceThumbnail uploadWorkspaceThumbnail;

  MindmapBloc({
    required this.getMindmapNodes,
    required this.createMindmapFromText,
    required this.updateNodePositions,
    required this.uploadWorkspaceThumbnail,
  }) : super(const MindmapState.initial()) {
    logger.i('📦 MindmapBloc initialized');

    on<MindmapEvent>((event, emit) async {
      logger.d('📨 MindmapBloc received event: $event');
      await event.when(
        loadMindmap: (workspaceId) => _onLoadMindmap(workspaceId, emit),
        refreshMindmap: (workspaceId) => _onRefreshMindmap(workspaceId, emit),
        createMindmapFromText: (text) => _onCreateMindmapFromText(text, emit),
      );
    });
  }

  Future<void> _onLoadMindmap(
    int workspaceId,
    Emitter<MindmapState> emit,
  ) async {
    logger.i('🔄 MindmapBloc: Loading mindmap for workspace $workspaceId');
    emit(const MindmapState.loading());

    final result = await getMindmapNodes(workspaceId);

    result.fold(
      (failure) {
        logger.e('❌ MindmapBloc: Failed to load mindmap - ${failure.message}');
        emit(MindmapState.error(message: failure.message));
      },
      (mindmap) {
        logger.i('✅ MindmapBloc: Successfully loaded mindmap');
        logger.d('  📊 Nodes: ${mindmap.nodes.length}, Edges: ${mindmap.edges.length}');

        // 노드 상세 정보 (처음 5개만)
        for (var i = 0; i < mindmap.nodes.length && i < 5; i++) {
          final node = mindmap.nodes[i];
          logger.d('  [$i] "${node.text}" at (${node.position.dx.toStringAsFixed(1)}, ${node.position.dy.toStringAsFixed(1)}), level: ${node.level}');
        }
        if (mindmap.nodes.length > 5) {
          logger.d('  ... and ${mindmap.nodes.length - 5} more nodes');
        }

        emit(MindmapState.loaded(mindmap: mindmap));

        // 백그라운드에서 null 노드 위치 업데이트
        _updateNullNodesToServer(workspaceId, mindmap);
      },
    );
  }

  /// 원래 null이었던 노드들의 위치를 서버에 업데이트 (백그라운드)
  void _updateNullNodesToServer(int workspaceId, Mindmap mindmap) {
    if (mindmap.nullNodeIds.isEmpty) {
      logger.d('🔍 No null nodes to update');
      return;
    }

    // null이었던 노드만 필터링
    final nodesToUpdate = mindmap.nodes.where((node) {
      return mindmap.nullNodeIds.contains(node.id);
    }).toList();

    logger.i('📤 Updating ${nodesToUpdate.length} null nodes to server (background)');

    // 백그라운드에서 실행 (await 하지 않음)
    updateNodePositions(UpdateNodePositionsParams(
      workspaceId: workspaceId,
      nodes: nodesToUpdate,
    )).then((result) {
      result.fold(
        (failure) => logger.w('⚠️ Position update failed: ${failure.message}'),
        (_) => logger.i('✅ Node positions updated to server'),
      );
    });
  }

  Future<void> _onRefreshMindmap(
    int workspaceId,
    Emitter<MindmapState> emit,
  ) async {
    logger.i('🔄 MindmapBloc: Refreshing mindmap for workspace $workspaceId');

    final result = await getMindmapNodes(workspaceId);

    result.fold(
      (failure) {
        logger.e('❌ MindmapBloc: Failed to refresh mindmap - ${failure.message}');
        emit(MindmapState.error(message: failure.message));
      },
      (mindmap) {
        logger.i('✅ MindmapBloc: Successfully refreshed mindmap');
        emit(MindmapState.loaded(mindmap: mindmap));
      },
    );
  }

  Future<void> _onCreateMindmapFromText(
    String text,
    Emitter<MindmapState> emit,
  ) async {
    logger.i('🔄 MindmapBloc: Creating mindmap from text: "$text"');
    emit(const MindmapState.creating());

    final result = await createMindmapFromText(text);

    result.fold(
      (failure) {
        logger.e('❌ MindmapBloc: Failed to create mindmap - ${failure.message}');
        emit(MindmapState.createError(message: failure.message));
      },
      (response) {
        logger.i('✅ MindmapBloc: Successfully created mindmap');
        logger.d('  📊 WorkspaceId: ${response.workspaceId}, NodeId: ${response.nodeId}');
        logger.d('  💬 Message: ${response.message}');
        emit(MindmapState.created(response: response));
      },
    );
  }

  /// 워크스페이스 썸네일 업로드 (공개 메서드)
  ///
  /// MindmapPage에서 캡쳐한 이미지를 업로드할 때 호출합니다.
  Future<void> uploadThumbnail({
    required int workspaceId,
    required Uint8List imageBytes,
  }) async {
    logger.i('📸 MindmapBloc: Uploading thumbnail for workspace $workspaceId');

    final result = await uploadWorkspaceThumbnail(
      UploadWorkspaceThumbnailParams(
        workspaceId: workspaceId,
        imageBytes: imageBytes,
      ),
    );

    result.fold(
      (failure) => logger.w('⚠️ Thumbnail upload failed: ${failure.message}'),
      (_) => logger.i('✅ Thumbnail uploaded successfully'),
    );
  }
}
