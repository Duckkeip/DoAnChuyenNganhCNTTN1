// lib/pages/ranking_page.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/topic.dart';
import '../services/api_service.dart';

class RankingPage extends StatefulWidget {
  final UserModel user;
  final Topic topic;

  const RankingPage({
    super.key,
    required this.user,
    required this.topic,
  });

  @override
  State<RankingPage> createState() => _RankingPageState();
}

class _RankingPageState extends State<RankingPage> {
  bool _loading = true;
  List<Map<String, dynamic>> _rankings = [];

  @override
  void initState() {
    super.initState();
    _loadRanking();
  }

  Future<void> _loadRanking() async {
    try {
      final res = await ApiService.get("/rank/xephang", useAuth: true);
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        final topicId = widget.topic.id;

        // lọc theo chủ đề
        final filtered = data.where((x) {
          final idChude = x['id_chude'];
          if (idChude is Map) {
            return (idChude['_id'] ?? '').toString() == topicId;
          }
          return idChude.toString() == topicId;
        }).toList();

        // lấy điểm cao nhất của mỗi user
        final byUser = <String, Map<String, dynamic>>{};
        for (final item in filtered) {
          final userId =
          (item['user_id']?['_id'] ?? item['user_id']?['id'] ?? '')
              .toString();

          final diem = (item['diem'] ?? 0) is num
              ? item['diem']
              : num.tryParse(item['diem'].toString()) ?? 0;

          if (!byUser.containsKey(userId) ||
              diem > (byUser[userId]!['diem'] ?? 0)) {
            byUser[userId] = item;
          }
        }

        // sắp xếp giảm dần theo điểm
        final list = byUser.values.toList();
        list.sort((a, b) {
          final da = (a['diem'] ?? 0) as num;
          final db = (b['diem'] ?? 0) as num;
          return db.compareTo(da);
        });

        setState(() {
          _rankings = List<Map<String, dynamic>>.from(list);
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Xếp hạng - ${widget.topic.name}"),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _rankings.isEmpty
          ? const Center(child: Text("Chưa có dữ liệu xếp hạng"))
          : Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text(
              "Bảng xếp hạng",
              style:
              TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: _rankings.length,
                itemBuilder: (context, index) {
                  final r = _rankings[index];

                  final user = r['user_id'] ?? {};
                  final name =
                      user['username'] ?? user['email'] ?? 'Người chơi';
                  final diem = r['diem'] ?? 0;
                  final dung = r['socaudung'] ?? 0;
                  final tong = r['tongcauhoi'] ?? 0;

                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        child: Text("${index + 1}"),
                      ),
                      title: Text(name),
                      subtitle:
                      Text("Điểm: $diem | Đúng: $dung / $tong"),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
