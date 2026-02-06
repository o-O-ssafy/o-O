import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../recording/presentation/bloc/recording_bloc.dart';
import '../../../recording/presentation/bloc/recording_event.dart';
import '../bloc/record_bloc.dart';
import '../bloc/record_event.dart';
import '../bloc/record_state.dart';
import '../widgets/record_list_item.dart';

/// 녹음 기록 리스트 페이지
class RecordListPage extends StatefulWidget {
  const RecordListPage({super.key});

  @override
  State<RecordListPage> createState() => _RecordListPageState();
}

class _RecordListPageState extends State<RecordListPage> {
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    // 페이지 로드 시 기록 조회
    context.read<RecordBloc>().add(const RecordEvent.getRecords());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _searchController.clear();
        _searchQuery = '';
      }
    });
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query.toLowerCase();
    });
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return SizedBox(
            height: _isSearching ? 64 : 62, // 전체 헤더 높이 (검색 시 간격 증가)
            child: Stack(
              children: [
                // 상단 우측 스페이서 (top-right) - 로고 공간 확보 (항상 유지)
                Positioned(
                  top: 0,
                  right: 0,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 60,
                    height: _isSearching ? 12 : 32,
                  ),
                ),
                // 하단 좌측 스페이서 (bottom-left) - 검색바 확장 공간
                Positioned(
                  bottom: 0,
                  left: 0,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: _isSearching ? 0 : 80,
                    height: 44,
                  ),
                ),
                // 검색 버튼 / 검색바 (bottom-right)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                    width: _isSearching ? constraints.maxWidth : 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: Stack(
                        children: [
                          // 검색 아이콘 버튼
                          if (!_isSearching)
                            Center(
                              child: GestureDetector(
                                onTap: _toggleSearch,
                                child: Container(
                                  width: 44,
                                  height: 44,
                                  decoration: const BoxDecoration(
                                    color: Colors.transparent,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.search,
                                    color: AppColors.semiBlack,
                                    size: 24,
                                  ),
                                ),
                              ),
                            ),
                          // 검색바
                          if (_isSearching)
                            AnimatedOpacity(
                              opacity: _isSearching ? 1.0 : 0.0,
                              duration: const Duration(milliseconds: 100),
                              child: LayoutBuilder(
                                builder: (context, searchConstraints) {
                                  // 너비가 충분할 때만 내용물 표시
                                  if (searchConstraints.maxWidth < 100) {
                                    return const SizedBox.shrink();
                                  }
                                  return Row(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      const SizedBox(width: 16),
                                      Icon(
                                        Icons.search,
                                        color: AppColors.deepGray,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: TextField(
                                          controller: _searchController,
                                          autofocus: true,
                                          onChanged: _onSearchChanged,
                                          decoration: InputDecoration(
                                            hintText: '검색어를 입력하세요.',
                                            hintStyle: AppTextStyles.regular16
                                                .copyWith(
                                                  color: AppColors.deepGray,
                                                ),
                                            border: InputBorder.none,
                                            isDense: true,
                                            contentPadding: EdgeInsets.zero,
                                          ),
                                          style: AppTextStyles.regular16
                                              .copyWith(
                                                color: AppColors.semiBlack,
                                              ),
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          Icons.close,
                                          color: AppColors.deepGray,
                                          size: 20,
                                        ),
                                        onPressed: _toggleSearch,
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(
                                          minWidth: 40,
                                          minHeight: 40,
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                // 로고 (top-left) - 마지막에 배치해서 제일 위에 표시
                Positioned(
                  top: 0,
                  left: 0,
                  child: GestureDetector(
                    onTap: () => context.go('/'),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      height: _isSearching ? 12 : 32,
                      child: Image.asset(
                        'assets/images/logo.png',
                        height: _isSearching ? 12 : 32,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: SizedBox(
        width: 80,
        height: 80,
        child: FloatingActionButton(
          onPressed: () {
            // 홈으로 이동
            context.go('/');
            // 페이지 전환 후 녹음 시작
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (context.mounted) {
                context.read<RecordingBloc>().add(
                  const RecordingEvent.toggle(),
                );
              }
            });
          },
          backgroundColor: AppColors.white,
          elevation: 4,
          shape: const CircleBorder(),
          child: Image.asset(
            'assets/images/popo_listen.png',
            width: 64,
            height: 64,
          ),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: BlocConsumer<RecordBloc, RecordState>(
            listener: (context, state) {
              state.maybeWhen(
                error: (message, errorCode) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(message),
                      backgroundColor: AppColors.danger,
                    ),
                  );
                },
                deleted: () {
                  // 삭제 성공 시 리스트 새로고침
                  context.read<RecordBloc>().add(
                    const RecordEvent.getRecords(),
                  );
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('녹음 기록이 삭제되었습니다'),
                      backgroundColor: AppColors.deepBlue,
                    ),
                  );
                },
                orElse: () {},
              );
            },
            builder: (context, state) {
              return state.when(
                initial:
                    () => Column(
                      children: [
                        _buildHeader(),
                        const Expanded(
                          child: Center(child: Text('녹음 기록을 불러오는 중...')),
                        ),
                      ],
                    ),
                loading:
                    () => Column(
                      children: [
                        _buildHeader(),
                        const Expanded(
                          child: Center(
                            child: CircularProgressIndicator(
                              color: AppColors.deepBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                loaded: (records) {
                  // startPrompt가 있는 레코드만 필터링
                  final recordsWithPrompt = records
                      .where((record) => record.startPrompt != null)
                      .toList();

                  // 검색어로 필터링
                  final filteredRecords =
                      _searchQuery.isEmpty
                          ? recordsWithPrompt
                          : recordsWithPrompt.where((record) {
                            final titleLower = record.title.toLowerCase();
                            final promptLower = record.startPrompt!.toLowerCase();
                            return titleLower.contains(_searchQuery) ||
                                promptLower.contains(_searchQuery);
                          }).toList();

                  if (filteredRecords.isEmpty) {
                    // 검색 중일 때는 기존 UI
                    if (_searchQuery.isNotEmpty) {
                      return Column(
                        children: [
                          _buildHeader(),
                          Expanded(
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.search_off,
                                    size: 64,
                                    color: AppColors.gray,
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    '검색 결과가 없습니다',
                                    style: AppTextStyles.regular16.copyWith(
                                      color: AppColors.deepGray,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    }

                    // 데이터가 완전히 비어있을 때 - 새로운 디자인
                    return Scaffold(
                      body: Container(
                        decoration: const BoxDecoration(
                          image: DecorationImage(
                            image: AssetImage('assets/images/background.png'),
                            fit: BoxFit.cover,
                          ),
                        ),
                        child: SafeArea(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 24.0,
                            ),
                            child: Column(
                              children: [
                                const SizedBox(height: 20),
                                // 로고
                                Align(
                                  alignment: Alignment.centerLeft,
                                  child: Image.asset(
                                    'assets/images/logo.png',
                                    height: 32,
                                  ),
                                ),
                                const Spacer(),
                                // 메인 텍스트
                                Text(
                                  '저장된 아이디어가 없습니다.',
                                  style: AppTextStyles.semiBold20.copyWith(
                                    color: AppColors.semiBlack,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 40),
                                // Popo 캐릭터 이미지
                                Image.asset(
                                  'assets/images/popo_listen.png',
                                  width: 200,
                                  height: 200,
                                  fit: BoxFit.contain,
                                ),
                                const SizedBox(height: 40),
                                // 안내 텍스트
                                Text(
                                  '지금 떠오르는 생각을\nPopo에게 말해주세요.',
                                  style: AppTextStyles.semiBold20.copyWith(
                                    color: AppColors.semiBlack,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 32),
                                // 버튼
                                ElevatedButton(
                                  onPressed: () => context.go('/'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.deepBlue,
                                    foregroundColor: AppColors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    elevation: 0,
                                  ),
                                  child: Text(
                                    '아이디어 기록하기',
                                    style: AppTextStyles.semiBold16.copyWith(
                                      color: AppColors.white,
                                    ),
                                  ),
                                ),
                                const Spacer(flex: 2),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }

                  return Column(
                    children: [
                      _buildHeader(),
                      // 리스트
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                          itemCount: filteredRecords.length,
                          separatorBuilder:
                              (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final record = filteredRecords[index];
                            return RecordListItem(
                              record: record,
                              onTap: () {
                                // 마인드맵 ID가 있으면 마인드맵 페이지로 이동
                                if (record.mindmapId != null) {
                                  context.push(
                                    '/mindmap',
                                    extra: {
                                      'title': record.title,
                                      'imagePath': '',
                                      'mindmapId': record.mindmapId,
                                    },
                                  );
                                } else {
                                  // 마인드맵이 없는 경우 안내 메시지
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('아직 마인드맵이 생성되지 않았습니다'),
                                      backgroundColor: AppColors.deepGray,
                                    ),
                                  );
                                }
                              },
                              onDelete: () {
                                _showDeleteDialog(context, record.id);
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  );
                },
                detailLoaded:
                    (record) => Column(
                      children: [
                        _buildHeader(),
                        const Expanded(
                          child: Center(child: Text('상세 페이지는 아직 구현되지 않았습니다')),
                        ),
                      ],
                    ),
                deleted:
                    () => Column(
                      children: [
                        _buildHeader(),
                        const Expanded(
                          child: Center(
                            child: CircularProgressIndicator(
                              color: AppColors.deepBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                error:
                    (message, errorCode) => Column(
                      children: [
                        _buildHeader(),
                        Expanded(
                          child: Center(
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
                                  onPressed: () {
                                    context.read<RecordBloc>().add(
                                      const RecordEvent.getRecords(),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.deepBlue,
                                    foregroundColor: AppColors.white,
                                  ),
                                  child: const Text('다시 시도'),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
              );
            },
          ),
        ),
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, int recordId) {
    showDialog(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: const Text(
              '녹음 기록 삭제',
              style: TextStyle(fontWeight: AppFontWeights.semiBold),
            ),
            content: const Text('이 녹음 기록을 삭제하시겠습니까?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: Text(
                  '취소',
                  style: AppTextStyles.regular16.copyWith(
                    color: AppColors.deepGray,
                  ),
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.of(dialogContext).pop();
                  context.read<RecordBloc>().add(
                    RecordEvent.deleteRecord(id: recordId),
                  );
                },
                child: Text(
                  '삭제',
                  style: AppTextStyles.regular16.copyWith(
                    color: AppColors.danger,
                  ),
                ),
              ),
            ],
          ),
    );
  }
}
