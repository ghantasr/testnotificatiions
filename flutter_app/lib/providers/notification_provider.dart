import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../services/supabase_service.dart';

class NotificationProvider extends ChangeNotifier {
  final NotificationService _notificationService;
  final SupabaseService _supabaseService = SupabaseService();
  
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  RealtimeChannel? _subscription;
  
  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;
  
  NotificationProvider(this._notificationService);
  
  Future<void> loadNotifications(String userId) async {
    _isLoading = true;
    notifyListeners();
    
    _notifications = await _supabaseService.getNotifications(userId);
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<void> markAsRead(String notificationId) async {
    final success = await _supabaseService.markAsRead(notificationId);
    
    if (success) {
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        _notifications[index] = NotificationModel(
          id: _notifications[index].id,
          userId: _notifications[index].userId,
          title: _notifications[index].title,
          body: _notifications[index].body,
          data: _notifications[index].data,
          sentAt: _notifications[index].sentAt,
          readAt: DateTime.now(),
          firebaseMessageId: _notifications[index].firebaseMessageId,
        );
        notifyListeners();
      }
    }
  }
  
  void subscribeToNotifications(String userId) {
    _subscription = _supabaseService.subscribeToNotifications(
      userId,
      (notification) {
        _notifications.insert(0, notification);
        notifyListeners();
      },
    );
  }
  
  Future<void> registerToken(String userId) async {
    await _notificationService.registerToken(userId);
  }
  
  @override
  void dispose() {
    _subscription?.unsubscribe();
    super.dispose();
  }
}
