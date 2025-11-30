// lib/pages/admin_page.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'login_page.dart';

class AdminPage extends StatelessWidget {
  final UserModel user;

  const AdminPage({super.key, required this.user});

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");
    await prefs.remove("user");

    if (!context.mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginPage()),
          (route) => false,
    );
  }

  Widget _buildAdminCard(
      {required IconData icon,
        required String title,
        required String subtitle,
        VoidCallback? onTap}) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, size: 30),
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap ??
                () {},
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Admin - ${user.username}"),
        actions: [
          IconButton(
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Trang quản trị (Admin)",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              "Bạn có thể quản lý chủ đề, câu hỏi và tài khoản người dùng.\n"
                  "Sau này sẽ gắn với API Node.js để CRUD dữ liệu.",
            ),
            const SizedBox(height: 20),
            _buildAdminCard(
              icon: Icons.category,
              title: "Quản lý chủ đề",
              subtitle: "Thêm / sửa / xóa chủ đề quiz",
            ),
            _buildAdminCard(
              icon: Icons.quiz,
              title: "Quản lý câu hỏi",
              subtitle: "Thêm / sửa / xóa câu hỏi theo chủ đề",
            ),
            _buildAdminCard(
              icon: Icons.people,
              title: "Quản lý người dùng",
              subtitle: "Xem danh sách, phân quyền admin/user",
            ),
          ],
        ),
      ),
    );
  }
}
