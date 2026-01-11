# Quick Start Guide

Get the notifications sample project running in under 10 minutes!

## Prerequisites
- Node.js (v16+)
- Flutter SDK (v3.0+)
- Firebase account
- Supabase account

## 🚀 5-Minute Backend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project → Enable Cloud Messaging
3. Settings → Service Accounts → Generate new private key
4. Download the JSON file

### 3. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create new project
3. Copy Project URL and API keys from Settings → API

### 4. Setup Database
1. Open SQL Editor in Supabase
2. Paste content from `supabase/schema.sql`
3. Click Run
4. Go to Database → Replication → Enable Realtime for `notifications` table

### 5. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

Example `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

PORT=3000
```

### 6. Start Server
```bash
npm start
```

Test: `curl http://localhost:3000/api/health`

## 📱 5-Minute Flutter Setup

### 1. Install FlutterFire CLI
```bash
dart pub global activate flutterfire_cli
```

### 2. Add Apps to Firebase
**Android:**
- Firebase Console → Add Android app
- Package: `com.example.notifications_sample`
- Download `google-services.json` → Place in `flutter_app/android/app/`

**iOS:**
- Firebase Console → Add iOS app
- Bundle ID: `com.example.notificationsSample`
- Download `GoogleService-Info.plist` → Add via Xcode to `flutter_app/ios/Runner/`

### 3. Configure Firebase
```bash
cd flutter_app
flutterfire configure
```

This auto-generates `lib/firebase_options.dart`

### 4. Update Supabase Config
Edit `flutter_app/lib/main.dart`:
```dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);
```

### 5. Install Dependencies
```bash
flutter pub get
```

### 6. Update Backend URL
Edit `flutter_app/lib/services/notification_service.dart`:

For testing:
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Physical device: `http://YOUR_COMPUTER_IP:3000`

### 7. Run the App
```bash
flutter run
```

## ✅ Test the Complete Flow

### Step 1: Get FCM Token
1. Launch Flutter app
2. Grant notification permissions
3. Check console: `FCM Token: ...`
4. Copy this token

### Step 2: Register Token
```bash
curl -X POST http://localhost:3000/api/register-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "fcmToken": "YOUR_FCM_TOKEN_FROM_STEP_1"
  }'
```

### Step 3: Send Test Notification
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Hello!",
    "body": "Your first notification!"
  }'
```

### Step 4: Verify
- ✅ Notification appears on device
- ✅ Notification shows in Flutter app list
- ✅ Data visible in Supabase dashboard

## 📚 Next Steps

For detailed setup and production deployment:
- [Complete Implementation Guide](IMPLEMENTATION.md)
- [Firebase Setup Details](docs/FIREBASE_SETUP.md)
- [Supabase Setup Details](docs/SUPABASE_SETUP.md)

## 🐛 Troubleshooting

**Backend won't start?**
- Check `.env` file exists and has all values
- Verify Firebase private key has `\n` escaped properly
- Run `npm install` again

**Flutter app errors?**
- Run `flutter pub get`
- Run `flutterfire configure` again
- Check `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) exists
- Clean and rebuild: `flutter clean && flutter pub get`

**No notifications appearing?**
- Check FCM token is registered (check backend logs)
- Verify notification permissions granted
- Test with Firebase Console first
- Check Android notification channel is configured

**Real-time not working?**
- Verify Realtime is enabled in Supabase for `notifications` table
- Check network connectivity
- Review browser/app console for WebSocket errors

## 🎯 API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/register-token` | POST | Register FCM token |
| `/api/send-notification` | POST | Send to specific user |
| `/api/broadcast-notification` | POST | Send to all users |
| `/api/notifications/:userId` | GET | Get user's notifications |
| `/api/notifications/:id/read` | PUT | Mark as read |

## 🔒 Security Checklist

- [ ] Never commit `.env` file
- [ ] Never commit Firebase service account JSON
- [ ] Use `service_role` key only in backend
- [ ] Use `anon` key in Flutter app
- [ ] Enable RLS in Supabase
- [ ] Use HTTPS in production
- [ ] Set up CORS properly

## 💡 Tips

- Use `npm run dev` for auto-reload during development
- Use Flutter hot reload (`r` in terminal) for quick iteration
- Monitor Supabase dashboard to see data in real-time
- Check Firebase Console for notification delivery stats
- Use Postman for easier API testing
