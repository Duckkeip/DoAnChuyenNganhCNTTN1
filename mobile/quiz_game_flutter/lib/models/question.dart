// lib/models/question.dart

class Question {
  final String id;
  final String noidung;
  final List<String> options; // danh sách đáp án sau khi random từ backend
  final int correctIndex;     // index đáp án đúng (0–3)
  final String mucdo;
  final int diem;

  Question({
    required this.id,
    required this.noidung,
    required this.options,
    required this.correctIndex,
    required this.mucdo,
    required this.diem,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    final rawOptions = (json['options'] as List? ?? []);
    return Question(
      id: json['_id']?.toString() ?? '',
      noidung: json['noidung']?.toString() ?? '',
      options: rawOptions
          .map((o) => (o['text'] ?? '').toString())
          .toList(),
      correctIndex: json['correct'] is int ? json['correct'] : 0,
      mucdo: json['mucdo']?.toString() ?? '',
      diem: json['diem'] is int ? json['diem'] : 0,
    );
  }
}
