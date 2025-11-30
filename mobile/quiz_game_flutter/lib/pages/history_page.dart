// lib/pages/history_page.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class HistoryPage extends StatefulWidget {
  final UserModel user;

  const HistoryPage({super.key, required this.user});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await ApiService.get("/ketqua", useAuth: false);

      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);

        final userId = widget.user.id.toString();

        final filtered = data.where((e) {
          final u = e['user_id'];
          final id = (u is Map ? u['_id'] : u)?.toString();
          return id == userId;
        }).toList();

        setState(() {
          _items = List<Map<String, dynamic>>.from(filtered);
          _loading = false;
        });
      } else {
        setState(() {
          _error = "Lỗi tải lịch sử: ${res.statusCode}";
          _loading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = "Lỗi kết nối server";
        _loading = false;
      });
    }
  }

  String _formatDate(String? iso) {
    if (iso == null) return "";
    DateTime? d;
    try {
      d = DateTime.parse(iso);
    } catch (_) {
      return iso;
    }
    return "${d.day.toString().padLeft(2, '0')}/"
        "${d.month.toString().padLeft(2, '0')}/${d.year}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Lịch sử - ${widget.user.username}"),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _loadHistory,
              child: const Text("Thử lại"),
            ),
          ],
        ),
      )
          : _items.isEmpty
          ? const Center(child: Text("Chưa có lịch sử làm bài"))
          : RefreshIndicator(
        onRefresh: _loadHistory,
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _items.length,
          separatorBuilder: (_, __) =>
          const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final item = _items[index];
            final topic =
                item['id_chude']?['tenchude']?.toString() ??
                    "Chủ đề";
            final score = item['tong_diem'] ?? 0;
            final dung = item['cau_dung'] ?? 0;
            final sai = item['cau_sai'] ?? 0;
            final tong = item['tong_cau'] ?? 0;
            final time = item['thoigian_lam'] ?? "";
            final date = _formatDate(item['createdAt']);

            return Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      topic,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Ngày: $date • Thời gian: $time",
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Điểm: $score / 100"),
                        Text("Đúng: $dung / $tong (Sai: $sai)"),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
