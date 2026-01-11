# Implementation Instructions

This document provides a comprehensive guide for implementing the notifications system using Firebase and Supabase.

## Overview

This project demonstrates a complete notification system with:
- **Backend**: Node.js/Express API for managing notifications
- **Database**: Supabase for storing notification data
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Frontend**: Flutter mobile application

## Architecture

```
┌─────────────────┐
│  Flutter App    │
│  (FCM Client)   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌────────────────┐  ┌──────────────┐
│  Firebase FCM  │  │   Supabase   │
│  (Push Notify) │  │  (Database)  │
└────────┬───────┘  └───────┬──────┘
         │                  │
         └──────┬───────────┘
                ▼
        ┌───────────────┐
        │ Backend API   │
        │ (Node.js)     │
        └───────────────┘
```

## Step-by-Step Implementation

### Phase 1: Firebase Setup

#### 1.1 Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Messaging

#### 1.2 Add Android App
1. Register Android app with package name
2. Download `google-services.json`
3. Place in `flutter_app/android/app/`
4. Configure `build.gradle` files

#### 1.3 Add iOS App
1. Register iOS app with bundle ID
2. Download `GoogleService-Info.plist`
3. Add to Xcode project
4. Enable Push Notifications capability
5. Upload APNs certificate/key

#### 1.4 Get Service Account
1. Go to Project Settings → Service Accounts
2. Generate new private key
3. Save JSON file securely
4. Extract credentials for `.env` file

**Detailed instructions**: [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)

### Phase 2: Supabase Setup

#### 2.1 Create Supabase Project
1. Visit [Supabase Dashboard](https://app.supabase.com/)
2. Create new project
3. Note Project URL and API keys

#### 2.2 Setup Database Schema
1. Open SQL Editor in Supabase
2. Run the SQL from `supabase/schema.sql`
3. Verify tables are created:
   - `user_tokens`
   - `notifications`

#### 2.3 Configure Row Level Security
The schema includes RLS policies:
- Users can only access their own data
- Service role bypasses RLS for admin operations

#### 2.4 Enable Realtime
1. Go to Database → Replication
2. Enable Realtime for `notifications` table
3. This allows real-time updates in the Flutter app

**Detailed instructions**: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

### Phase 3: Backend API Setup

#### 3.1 Install Dependencies
```bash
npm install
```

This installs:
- `express`: Web framework
- `@supabase/supabase-js`: Supabase client
- `firebase-admin`: Firebase Admin SDK
- `cors`, `body-parser`, `dotenv`: Utilities

#### 3.2 Configure Environment
Create `.env` file from `.env.example`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

PORT=3000
```

#### 3.3 Start Server
```bash
npm start           # Production
npm run dev         # Development with auto-reload
```

#### 3.4 Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Register token
curl -X POST http://localhost:3000/api/register-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","fcmToken":"test-token"}'
```

### Phase 4: Flutter App Setup

#### 4.1 Install Flutter Dependencies
```bash
cd flutter_app
flutter pub get
```

This installs:
- `firebase_core`, `firebase_messaging`: Firebase
- `supabase_flutter`: Supabase client
- `provider`: State management
- `flutter_local_notifications`: Local notifications
- `http`: HTTP client

#### 4.2 Configure Firebase
```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase
flutterfire configure
```

This generates `lib/firebase_options.dart` with platform-specific configs.

#### 4.3 Configure Supabase
Edit `lib/main.dart` and update:
```dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);
```

#### 4.4 Update Service URL
Edit `lib/services/notification_service.dart`:
```dart
Uri.parse('http://YOUR_SERVER_IP:3000/api/register-token')
```

For local testing:
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Physical Device: `http://YOUR_COMPUTER_IP:3000`

#### 4.5 Run the App
```bash
flutter run
```

### Phase 5: Testing the Complete Flow

#### 5.1 Register FCM Token
1. Launch Flutter app
2. Grant notification permissions
3. Check console for FCM token
4. Token is auto-registered with backend

#### 5.2 Send Test Notification
Using backend API:
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Test Notification",
    "body": "Hello from backend!"
  }'
```

Using Firebase Console:
1. Go to Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Click "Send test message"
5. Enter FCM token from Flutter console

#### 5.3 Verify Notification Flow
1. **App in Foreground**: Local notification appears
2. **App in Background**: System notification appears
3. **App Terminated**: System notification appears
4. **Tap Notification**: App opens to notification list
5. **Check Supabase**: Verify notification is stored

#### 5.4 Test Real-time Updates
1. Open Flutter app
2. Send notification via backend
3. Verify it appears immediately in the list
4. No need to refresh

#### 5.5 Test Notification States
1. View notifications list
2. Tap notification to mark as read
3. Verify color change and badge update
4. Pull to refresh to reload

### Phase 6: Production Deployment

#### 6.1 Backend Deployment
Deploy to services like:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS/GCP

Update environment variables in hosting platform.

#### 6.2 Update Flutter App
Replace server URL with production URL:
```dart
Uri.parse('https://your-production-api.com/api/register-token')
```

#### 6.3 Build Release App
```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

#### 6.4 Configure Firebase for Production
1. Remove debug signing certificates
2. Add production signing certificates
3. Update APNs with production certificate
4. Test thoroughly before release

## Key Features Implementation Details

### 1. FCM Token Management
- **Registration**: Token stored in Supabase on first app launch
- **Updates**: Token refreshed automatically and re-registered
- **Persistence**: Tokens linked to user IDs for targeting

### 2. Notification Delivery
- **Targeted**: Send to specific user via user_id
- **Broadcast**: Send to all registered users
- **Data Payload**: Include custom data with notifications
- **Priority**: High priority for important notifications

### 3. Notification Storage
- **History**: All notifications stored in Supabase
- **Read Status**: Track which notifications are read
- **Metadata**: Store send time, Firebase message ID
- **Queries**: Efficient queries with indexes

### 4. Real-time Subscriptions
- **WebSocket**: Supabase Realtime uses WebSocket
- **Auto-update**: New notifications appear instantly
- **Filtering**: Subscribe only to current user's notifications
- **Reconnection**: Automatic reconnection on network issues

### 5. State Management
- **Provider**: Used for notification state
- **Reactive UI**: UI updates automatically on state changes
- **Loading States**: Show loading indicators
- **Error Handling**: Graceful error handling

## Security Considerations

### Backend
- ✅ Use service_role key (never expose in client)
- ✅ Validate all inputs
- ✅ Rate limiting for API endpoints
- ✅ HTTPS only in production
- ✅ CORS configuration

### Database
- ✅ Row Level Security enabled
- ✅ Users can't access others' data
- ✅ Policies for each operation
- ✅ Secure password for database
- ✅ Regular backups

### Firebase
- ✅ Keep service account JSON secure
- ✅ Never commit to version control
- ✅ Use environment variables
- ✅ Restrict API keys if possible
- ✅ Monitor usage for abuse

### Flutter App
- ✅ Use anon key (not service_role)
- ✅ Validate notification data
- ✅ Handle permissions properly
- ✅ Secure storage for tokens
- ✅ HTTPS for API calls

## Common Issues and Solutions

### Issue: FCM Token Not Received
**Solution:**
- Check Google Play Services on Android
- Verify app is registered in Firebase Console
- Check permissions are granted
- Review logs for error messages

### Issue: Notifications Not Appearing
**Solution:**
- Verify FCM token is registered in database
- Check Firebase Console for delivery status
- Test with Firebase Console first
- Review notification channel configuration

### Issue: Real-time Updates Not Working
**Solution:**
- Verify Realtime is enabled for table
- Check subscription filter matches data
- Verify network connectivity
- Check for WebSocket connection errors

### Issue: Database Permission Errors
**Solution:**
- Review RLS policies
- Verify user authentication
- Use service_role key for admin operations
- Check policy conditions match data

## Performance Optimization

### Backend
- Use connection pooling for Supabase
- Implement caching for frequent queries
- Batch notifications for broadcasts
- Use async/await properly
- Monitor server resources

### Database
- Indexes already created in schema
- Use pagination for large result sets
- Clean up old notifications periodically
- Monitor query performance
- Use database functions for complex operations

### Flutter App
- Lazy load notification list
- Use pagination for older notifications
- Cache notification data locally
- Optimize image loading if used
- Profile app performance

## Monitoring and Maintenance

### Firebase
- Monitor delivery rates
- Check for failed deliveries
- Review usage quotas
- Set up alerts for issues

### Supabase
- Monitor database size
- Check query performance
- Review API usage
- Set up database backups
- Monitor Realtime connections

### Backend
- Log all errors
- Monitor API response times
- Set up health checks
- Monitor server resources
- Implement error tracking (e.g., Sentry)

## Next Steps

After basic implementation, consider:

1. **User Authentication**: Integrate Supabase Auth
2. **Notification Categories**: Add different notification types
3. **Rich Notifications**: Images, actions, sounds
4. **Scheduling**: Schedule notifications for later
5. **Analytics**: Track notification engagement
6. **Localization**: Multi-language support
7. **Push Preferences**: Let users control notification types
8. **Notification Groups**: Group related notifications

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Flutter Documentation](https://flutter.dev/docs)
- [Provider Package](https://pub.dev/packages/provider)
- [FlutterFire Documentation](https://firebase.flutter.dev/)
