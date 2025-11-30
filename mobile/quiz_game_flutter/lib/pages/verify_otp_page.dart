import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'reset_password_page.dart';

class VerifyOTPPage extends StatefulWidget {
  final String email;
  const VerifyOTPPage({super.key, required this.email});

  @override
  State<VerifyOTPPage> createState() => _VerifyOTPPageState();
}

class _VerifyOTPPageState extends State<VerifyOTPPage> {
  final otp = TextEditingController();
  bool loading = false;

  void verifyOTP() async {
    setState(() => loading = true);

    final res = await ApiService.post(
      "/auth/verify-otp",
      {"email": widget.email, "otp": otp.text.trim()},
    );

    setState(() => loading = false);

    if (res.statusCode == 200) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ResetPasswordPage(email: widget.email),
        ),
      );
    } else {
      final body = jsonDecode(res.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(body["message"] ?? "OTP sai")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Xác thực OTP")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text("OTP đã gửi tới email: ${widget.email}"),
            const SizedBox(height: 20),
            TextField(
              controller: otp,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: "Nhập OTP"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : verifyOTP,
              child: loading
                  ? const CircularProgressIndicator()
                  : const Text("Xác nhận"),
            )
          ],
        ),
      ),
    );
  }
}
