import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/notification_model.dart';

class SupabaseService {
  final SupabaseClient _client = Supabase.instance.client;
  
  // Get all notifications for a user
  Future<List<NotificationModel>> getNotifications(String userId) async {
    try {
      final response = await _client
          .from('notifications')
          .select()
          .eq('user_id', userId)
          .order('sent_at', ascending: false);
      
      return (response as List)
          .map((json) => NotificationModel.fromJson(json))
          .toList();
    } catch (e) {
      print('Error fetching notifications: $e');
      return [];
    }
  }
  
  // Mark notification as read
  Future<bool> markAsRead(String notificationId) async {
    try {
      await _client
          .from('notifications')
          .update({'read_at': DateTime.now().toIso8601String()})
          .eq('id', notificationId);
      
      return true;
    } catch (e) {
      print('Error marking notification as read: $e');
      return false;
    }
  }
  
  // Subscribe to real-time notifications
  RealtimeChannel subscribeToNotifications(
    String userId,
    Function(NotificationModel) onNotification,
  ) {
    return _client
        .channel('notifications:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            final notification = NotificationModel.fromJson(payload.newRecord);
            onNotification(notification);
          },
        )
        .subscribe();
  }
}
