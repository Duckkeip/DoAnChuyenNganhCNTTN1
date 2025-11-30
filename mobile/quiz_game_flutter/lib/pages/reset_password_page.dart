import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'login_page.dart';

class ResetPasswordPage extends StatefulWidget {
  final String email;
  const ResetPasswordPage({super.key, required this.email});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final pass = TextEditingController();
  bool loading = false;

  void resetPassword() async {
    setState(() => loading = true);

    final res = await ApiService.post(
      "/auth/reset-password",
      {
        "email": widget.email,
        "password": pass.text.trim(),
      },
    );

    setState(() => loading = false);

    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Đặt mật khẩu thành công")),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    } else {
      final body = jsonDecode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(body["message"] ?? "Lỗi")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Đặt mật khẩu mới")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: pass,
              obscureText: true,
              decoration:
              const InputDecoration(labelText: "Nhập mật khẩu mới"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : resetPassword,
              child: loading
                  ? const CircularProgressIndicator()
                  : const Text("Cập nhật"),
            )
          ],
        ),
      ),
    );
  }
}
