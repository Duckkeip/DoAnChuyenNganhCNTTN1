// lib/models/topic.dart

class Topic {
  final String id;
  final String tenchude;
  final String loaichude;
  final String? nganh;
  final String? userId;

  Topic({
    required this.id,
    required this.tenchude,
    required this.loaichude,
    this.nganh,
    this.userId,
  });

  /// Dùng cho UI (PlayPage, HomePage…)
  String get name => tenchude;

  factory Topic.fromJson(Map<String, dynamic> json) {
    final user = json['user_id'];
    return Topic(
      id: json['_id']?.toString() ?? '',
      tenchude: json['tenchude']?.toString() ?? '',
      loaichude: json['loaichude']?.toString() ?? '',
      nganh: json['nganh']?.toString(),
      userId: user is Map ? (user['_id']?.toString()) : user?.toString(),
    );
  }
}
