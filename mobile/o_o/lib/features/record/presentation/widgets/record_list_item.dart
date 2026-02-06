import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../domain/entities/record_entity.dart';

/// 녹음 기록 리스트 아이템
class RecordListItem extends StatefulWidget {
  final RecordEntity record;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const RecordListItem({
    super.key,
    required this.record,
    required this.onTap,
    required this.onDelete,
  });

  @override
  State<RecordListItem> createState() => _RecordListItemState();
}

class _RecordListItemState extends State<RecordListItem> {
  bool _isExpanded = false;

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggleExpanded,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.14),
              blurRadius: 7.1,
              offset: const Offset(0, 3),
              spreadRadius: 0,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 날짜/시간
            Text(
              widget.record.formattedDate,
              style: AppTextStyles.bold18.copyWith(
                color: AppColors.deepBlue,
              ),
            ),
            // 내용 (startPrompt가 있을 때만 표시)
            if (widget.record.startPrompt != null) ...[
              const SizedBox(height: 8),
              AnimatedCrossFade(
                firstChild: Text(
                  widget.record.startPrompt!,
                  style: AppTextStyles.medium14.copyWith(
                    color: AppColors.semiBlack,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                secondChild: Text(
                  widget.record.startPrompt!,
                  style: AppTextStyles.medium14.copyWith(
                    color: AppColors.semiBlack,
                  ),
                ),
                crossFadeState: _isExpanded
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 300),
              ),
            ],
            // 버튼 (확장되었을 때만 표시)
            if (_isExpanded) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: widget.onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.deepBlue,
                    foregroundColor: AppColors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    '생성된 마인드맵 확인',
                    style: AppTextStyles.semiBold16.copyWith(
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
