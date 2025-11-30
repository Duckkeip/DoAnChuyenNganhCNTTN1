import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final username = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final phone = TextEditingController();
  bool loading = false;

  void register() async {
    setState(() => loading = true);

    final body = {
      "username": username.text.trim(),
      "email": email.text.trim(),
      "password": password.text.trim(),
      "SDT": phone.text.trim(),
    };

    final res = await ApiService.post("/auth/register", body);

    setState(() => loading = false);

    if (res.statusCode == 200) {
      final msg = jsonDecode(res.body)["message"];

      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text("Thành công"),
          content: Text(msg),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context); // quay về login
              },
              child: const Text("OK"),
            )
          ],
        ),
      );
    } else {
      final data = jsonDecode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(data["message"].toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Đăng ký")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: username,
              decoration: const InputDecoration(labelText: "Username"),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: "Email"),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: "Số điện thoại"),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: password,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Mật khẩu"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : register,
              child: loading
                  ? const SizedBox(
                width: 20,
                height: 20,
                child:
                CircularProgressIndicator(strokeWidth: 2),
              )
                  : const Text("Đăng ký"),
            ),
          ],
        ),
      ),
    );
  }
}
