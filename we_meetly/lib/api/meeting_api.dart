import 'dart:convert';

import 'package:http/http.dart' as http;

import 'package:we_meetly/utils/user.util.dart';

String MEETING_API_URL = "https://wemeetly.onrender.com/api/meeting";
var client = http.Client();

Future<http.Response?> startMeeting() async {
  Map<String, String> requestHeader = {"Content-Type": "application/json"};

  var userId = await loadUserId();

  var response = await client.post(Uri.parse("$MEETING_API_URL/start"),
      headers: requestHeader,
      body: jsonEncode({"hostId": userId, "hostName": ""}));

  if (response.statusCode == 200) {
    return response;
  } else {
    return null;
  }
}

Future<http.Response> joinMeeting(String meetingId) async {
  var response =
      await http.get(Uri.parse("$MEETING_API_URL/join?meetingId=$meetingId"));
  print(response);

  if (response.statusCode >= 200 && response.statusCode < 400) {
    return response;
  }

  throw UnsupportedError("Not a valid meetingId");
}
