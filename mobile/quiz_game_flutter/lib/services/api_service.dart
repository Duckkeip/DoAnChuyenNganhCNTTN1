import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = "http://192.168.1.13:5000/api";

  // Lấy token từ local
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("token");
  }

  // ================= GET =================
  static Future<http.Response> get(String path, {bool useAuth = false}) async {
    final url = Uri.parse("$baseUrl$path");
    final Map<String, String> headers = {};

    if (useAuth) {
      final token = await _getToken();
      if (token != null) headers["Authorization"] = "Bearer $token";
    }

    return await http.get(url, headers: headers);
  }

  // ================= POST =================
  static Future<http.Response> post(
      String path,
      Map<String, dynamic> body, {
        bool useAuth = false,
      }) async {
    final url = Uri.parse("$baseUrl$path");
    final Map<String, String> headers = {"Content-Type": "application/json"};

    if (useAuth) {
      final token = await _getToken();
      if (token != null) headers["Authorization"] = "Bearer $token";
    }

    return await http.post(url, headers: headers, body: jsonEncode(body));
  }

  // ================= PUT =================
  static Future<http.Response> put(
      String path,
      Map<String, dynamic> body, {
        bool useAuth = false,
      }) async {
    final url = Uri.parse("$baseUrl$path");
    final Map<String, String> headers = {"Content-Type": "application/json"};

    if (useAuth) {
      final token = await _getToken();
      if (token != null) headers["Authorization"] = "Bearer $token";
    }

    return await http.put(url, headers: headers, body: jsonEncode(body));
  }

  // ================= DELETE =================
  static Future<http.Response> delete(
      String path, {
        bool useAuth = false,
      }) async {
    final url = Uri.parse("$baseUrl$path");
    final Map<String, String> headers = {};

    if (useAuth) {
      final token = await _getToken();
      if (token != null) headers["Authorization"] = "Bearer $token";
    }

    return await http.delete(url, headers: headers);
  }
}
