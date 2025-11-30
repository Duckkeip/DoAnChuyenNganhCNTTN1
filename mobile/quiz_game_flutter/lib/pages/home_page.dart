// lib/pages/home_page.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/topic.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import 'play_page.dart';
import 'history_page.dart';
import 'profile_page.dart';

class HomePage extends StatefulWidget {
  final UserModel user;

  const HomePage({super.key, required this.user});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _loading = true;
  List<Topic> _topics = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTopics();
  }

  Future<void> _loadTopics() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await ApiService.get("/chude", useAuth: false);

      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        setState(() {
          _topics = data.map((e) => Topic.fromJson(e)).toList();
          _loading = false;
        });
      } else {
        setState(() {
          _error = "Lỗi tải chủ đề: ${res.statusCode}";
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

  @override
  Widget build(BuildContext context) {
    final user = widget.user;

    return Scaffold(
      appBar: AppBar(
        title: Text("Xin chào, ${user.username}"),
        actions: [
          IconButton(
            tooltip: "Lịch sử làm bài",
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => HistoryPage(user: user),
                ),
              );
            },
          ),
          IconButton(
            tooltip: "Hồ sơ",
            icon: const Icon(Icons.person),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ProfilePage(user: user),
                ),
              );
            },
          ),
        ],
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
              onPressed: _loadTopics,
              child: const Text("Thử lại"),
            )
          ],
        ),
      )
          : _topics.isEmpty
          ? const Center(child: Text("Chưa có chủ đề nào."))
          : RefreshIndicator(
        onRefresh: _loadTopics,
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _topics.length,
          separatorBuilder: (_, __) =>
          const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final topic = _topics[index];
            return _buildTopicCard(topic);
          },
        ),
      ),
    );
  }

  Widget _buildTopicCard(Topic topic) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PlayPage(
                user: widget.user,
                topic: topic,
              ),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.blue.withOpacity(0.1),
                ),
                child: const Icon(Icons.quiz, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      topic.tenchude,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Loại: ${topic.loaichude} • Ngành: ${topic.nganh ?? "—"}",
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}
