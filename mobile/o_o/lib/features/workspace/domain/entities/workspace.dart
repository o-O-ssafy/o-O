import 'package:equatable/equatable.dart';

/// Workspace Entity
class Workspace extends Equatable {
  final int id;
  final String title;
  final String visibility;
  final DateTime createdAt;
  final String? thumbnail;
  final String? startPrompt;

  const Workspace({
    required this.id,
    required this.title,
    required this.visibility,
    required this.createdAt,
    this.thumbnail,
    this.startPrompt,
  });

  @override
  List<Object?> get props => [id, title, visibility, createdAt, thumbnail, startPrompt];
}
