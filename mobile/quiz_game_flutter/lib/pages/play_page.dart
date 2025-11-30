// lib/pages/play_page.dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/topic.dart';
import '../models/question.dart';
import '../services/api_service.dart';
import 'home_page.dart';

class PlayPage extends StatefulWidget {
  final UserModel user;
  final Topic topic;

  const PlayPage({
    super.key,
    required this.user,
    required this.topic,
  });

  @override
  State<PlayPage> createState() => _PlayPageState();
}

class _PlayPageState extends State<PlayPage> {
  List<Question> _questions = [];
  Map<String, int> _answers = {}; // id_cauhoi => index đáp án
  int _currentIndex = 0;
  bool _finished = false;
  bool _submitting = false;

  static const int _totalSeconds = 600;
  int _timeLeft = _totalSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTime(int s) {
    final m = s ~/ 60;
    final sec = s % 60;
    return "${m.toString().padLeft(2, '0')}:${sec.toString().padLeft(2, '0')}";
  }

  Future<void> _loadQuestions() async {
    try {
      final res = await ApiService.get(
        "/cauhoi/${widget.topic.id}",
        useAuth: false,
      );

      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);

        setState(() {
          _questions = data.map((e) => Question.fromJson(e)).toList();
        });

        _startTimer();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Không tải được câu hỏi")),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Lỗi kết nối khi tải câu hỏi")),
        );
      }
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;

      setState(() {
        if (_timeLeft <= 1) {
          timer.cancel();
          _timeLeft = 0;
          _finish();
        } else {
          _timeLeft--;
        }
      });
    });
  }

  void _selectAnswer(String questionId, int index) {
    if (_finished) return;

    setState(() {
      _answers[questionId] = index;
    });
  }

  void _next() {
    if (_currentIndex < _questions.length - 1) {
      setState(() => _currentIndex++);
    }
  }

  void _prev() {
    if (_currentIndex > 0) {
      setState(() => _currentIndex--);
    }
  }

  Future<void> _finish() async {
    if (_finished || _submitting) return;

    _timer?.cancel();
    setState(() => _submitting = true);

    int correct = 0;

    for (final q in _questions) {
      if (_answers[q.id] == q.correctIndex) {
        correct++;
      }
    }

    final total = _questions.length;
    final score = ((correct / total) * 100).round();

    setState(() => _finished = true);

    // Gửi kết quả lên server
    try {
      final payload = {
        "user_id": widget.user.id,
        "id_chude": widget.topic.id,
        "tong_cau": total,
        "cau_dung": correct,
        "cau_sai": total - correct,
        "tong_diem": score,
        "thoigian_lam": _formatTime(_totalSeconds - _timeLeft),
        "dapAnDaChon": _questions.map((q) {
          final ans = _answers[q.id];
          return {
            "id_cauhoi": q.id,
            "dapan_chon": ans ?? -1,
            "dung": ans == q.correctIndex,
          };
        }).toList()
      };

      await ApiService.post("/ketqua", payload, useAuth: false);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Không lưu được kết quả")),
        );
      }
    }

    if (mounted) setState(() => _submitting = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_questions.isEmpty && !_finished) {
      return Scaffold(
        appBar: AppBar(
          title: Text("Quiz - ${widget.topic.name}"),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    // Khi bài làm xong
    if (_finished) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Kết quả"),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("🎉 Hoàn thành!", style: TextStyle(fontSize: 24)),
                const SizedBox(height: 16),
                Text(
                  "Điểm: ${(((_answers.length) / _questions.length) * 100).round()}",
                  style: const TextStyle(fontSize: 18),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                        builder: (_) => HomePage(user: widget.user),
                      ),
                          (route) => false,
                    );
                  },
                  icon: const Icon(Icons.home),
                  label: const Text("Về trang chủ"),
                )
              ],
            ),
          ),
        ),
      );
    }

    final q = _questions[_currentIndex];
    final selected = _answers[q.id];

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.topic.name),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Câu số + thời gian
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Câu ${_currentIndex + 1}/${_questions.length}",
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  "⏱ ${_formatTime(_timeLeft)}",
                  style: const TextStyle(fontSize: 18, color: Colors.red),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Nội dung câu hỏi
            Text(
              q.noidung,
              style: const TextStyle(fontSize: 18),
            ),

            const SizedBox(height: 16),

            // Các đáp án
            Column(
              children: List.generate(q.options.length, (i) {
                return _buildOption(q, i, q.options[i], selected);
              }),
            ),

            const Spacer(),

            // Nút điều hướng
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: _currentIndex > 0 ? _prev : null,
                  child: const Text("⬅ Trước"),
                ),
                _currentIndex < _questions.length - 1
                    ? ElevatedButton(
                  onPressed: _next,
                  child: const Text("Tiếp ➡"),
                )
                    : ElevatedButton(
                  onPressed: _submitting ? null : _finish,
                  child: _submitting
                      ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                    ),
                  )
                      : const Text("Hoàn thành"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOption(
      Question q, int index, String text, int? selected) {
    final isSelected = selected == index;

    return Card(
      child: ListTile(
        onTap: () => _selectAnswer(q.id, index),
        leading: Radio<int>(
          value: index,
          groupValue: selected,
          onChanged: (_) => _selectAnswer(q.id, index),
        ),
        title: Text(text),
        tileColor: isSelected ? Colors.blue.withOpacity(0.1) : null,
      ),
    );
  }
}
