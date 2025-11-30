import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'verify_otp_page.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final email = TextEditingController();
  bool loading = false;

  void sendOTP() async {
    setState(() => loading = true);

    final res = await ApiService.post(
      "/auth/forgot-password",
      {"email": email.text.trim()},
    );

    setState(() => loading = false);

    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Mã OTP đã được gửi đến email")),
      );

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => VerifyOTPPage(email: email.text.trim()),
        ),
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
      appBar: AppBar(title: const Text("Quên mật khẩu")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: email,
              decoration: const InputDecoration(labelText: "Nhập email của bạn"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : sendOTP,
              child: loading
                  ? const CircularProgressIndicator()
                  : const Text("Gửi OTP"),
            )
          ],
        ),
      ),
    );
  }
}
