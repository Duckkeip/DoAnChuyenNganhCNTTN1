import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/user.dart';
import 'home_page.dart';
import 'admin_page.dart';
import 'forgot_password_page.dart';
import 'register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final identifier = TextEditingController();
  final password = TextEditingController();
  bool loading = false;

  Future<void> _login() async {
    if (identifier.text.isEmpty || password.text.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Không được để trống")));
      return;
    }

    setState(() => loading = true);

    final res = await ApiService.post("/auth/login", {
      "identifier": identifier.text.trim(), // backend yêu cầu
      "password": password.text.trim(),     // backend yêu cầu
    });

    setState(() => loading = false);

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final user = UserModel.fromJson(data["user"]);

      // Lưu token + user
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString("token", data["token"]);
      await prefs.setString("user", jsonEncode(data["user"]));

      // Điều hướng theo role
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) =>
          user.role == "admin" ? AdminPage(user: user) : HomePage(user: user),
        ),
      );
    } else {
      final body = jsonDecode(res.body);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(body["message"] ?? "Đăng nhập thất bại")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Đăng nhập")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: identifier,
              decoration: const InputDecoration(
                labelText: "Email hoặc Username",
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: password,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: "Mật khẩu",
              ),
            ),
            const SizedBox(height: 20),

            // Nút đăng nhập
            ElevatedButton(
              onPressed: loading ? null : _login,
              child: loading
                  ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
                  : const Text("Đăng nhập"),
            ),

            const SizedBox(height: 10),

            // Quên mật khẩu
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ForgotPasswordPage()),
                );
              },
              child: const Text("Quên mật khẩu?"),
            ),

            // Đăng ký
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const RegisterPage()),
                );
              },
              child: const Text("Chưa có tài khoản? Đăng ký ngay"),
            ),
          ],
        ),
      ),
    );
  }
}
