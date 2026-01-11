class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  final DateTime sentAt;
  final DateTime? readAt;
  final String? firebaseMessageId;
  
  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    this.data,
    required this.sentAt,
    this.readAt,
    this.firebaseMessageId,
  });
  
  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'],
      body: json['body'],
      data: json['data'] as Map<String, dynamic>?,
      sentAt: DateTime.parse(json['sent_at']),
      readAt: json['read_at'] != null ? DateTime.parse(json['read_at']) : null,
      firebaseMessageId: json['firebase_message_id'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'body': body,
      'data': data,
      'sent_at': sentAt.toIso8601String(),
      'read_at': readAt?.toIso8601String(),
      'firebase_message_id': firebaseMessageId,
    };
  }
  
  bool get isRead => readAt != null;
}
