# Setup Checklist

Use this checklist to ensure all components are properly configured.

## ✅ Firebase Setup

### Firebase Console
- [ ] Created Firebase project
- [ ] Enabled Cloud Messaging
- [ ] Added Android app (if building for Android)
  - [ ] Downloaded `google-services.json`
  - [ ] Placed in `flutter_app/android/app/`
- [ ] Added iOS app (if building for iOS)
  - [ ] Downloaded `GoogleService-Info.plist`
  - [ ] Added via Xcode to `flutter_app/ios/Runner/`
  - [ ] Uploaded APNs certificate or key
  - [ ] Enabled Push Notifications capability in Xcode
  - [ ] Enabled Background Modes → Remote notifications
- [ ] Generated service account private key
- [ ] Downloaded service account JSON file
- [ ] Extracted project_id, private_key, client_email

### FlutterFire Configuration
- [ ] Installed FlutterFire CLI: `dart pub global activate flutterfire_cli`
- [ ] Ran `flutterfire configure` in flutter_app directory
- [ ] Generated `lib/firebase_options.dart`
- [ ] Verified Firebase initialization in `lib/main.dart`

## ✅ Supabase Setup

### Supabase Console
- [ ] Created Supabase project
- [ ] Noted Project URL
- [ ] Noted anon public key
- [ ] Noted service_role key (keep secret!)
- [ ] Opened SQL Editor
- [ ] Executed SQL from `supabase/schema.sql`
- [ ] Verified `user_tokens` table created
- [ ] Verified `notifications` table created
- [ ] Verified indexes created
- [ ] Verified RLS policies created

### Realtime Configuration
- [ ] Navigated to Database → Replication
- [ ] Enabled Realtime for `notifications` table
- [ ] Verified WebSocket connection works

## ✅ Backend Setup

### Environment Configuration
- [ ] Copied `.env.example` to `.env`
- [ ] Set `SUPABASE_URL`
- [ ] Set `SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `FIREBASE_PROJECT_ID`
- [ ] Set `FIREBASE_PRIVATE_KEY` (with proper `\n` escaping)
- [ ] Set `FIREBASE_CLIENT_EMAIL`
- [ ] Set `PORT` (default: 3000)

### Dependencies & Testing
- [ ] Ran `npm install`
- [ ] Started server: `npm start`
- [ ] Tested health endpoint: `curl http://localhost:3000/api/health`
- [ ] Verified server logs show no errors
- [ ] Verified Supabase connection works
- [ ] Verified Firebase Admin SDK initialized

## ✅ Flutter App Setup

### Dependencies
- [ ] Navigated to `flutter_app` directory
- [ ] Ran `flutter pub get`
- [ ] Verified all dependencies resolved
- [ ] No version conflicts reported

### Configuration Files
- [ ] Updated Supabase URL in `lib/main.dart`
- [ ] Updated Supabase anon key in `lib/main.dart`
- [ ] Updated backend API URL in `lib/services/notification_service.dart`
  - [ ] Set to `http://10.0.2.2:3000` for Android Emulator, or
  - [ ] Set to `http://localhost:3000` for iOS Simulator, or
  - [ ] Set to `http://YOUR_IP:3000` for physical device

### Android Configuration (if applicable)
- [ ] Verified `google-services.json` in `android/app/`
- [ ] Verified `android/build.gradle` has Google services plugin
- [ ] Verified `android/app/build.gradle` applies Google services
- [ ] Verified minSdkVersion is 21 or higher
- [ ] Verified `AndroidManifest.xml` has required permissions
- [ ] Verified notification channel metadata in manifest

### iOS Configuration (if applicable)
- [ ] Verified `GoogleService-Info.plist` in Xcode project
- [ ] Opened `ios/Runner.xcworkspace` in Xcode
- [ ] Added Push Notifications capability
- [ ] Added Background Modes capability
- [ ] Enabled "Remote notifications" in Background Modes
- [ ] Verified `Info.plist` has UIBackgroundModes
- [ ] Verified bundle ID matches Firebase registration

### Running the App
- [ ] Connected device or started emulator/simulator
- [ ] Ran `flutter run`
- [ ] App builds and launches successfully
- [ ] Granted notification permissions when prompted
- [ ] Verified FCM token appears in console logs
- [ ] No errors in console

## ✅ Integration Testing

### FCM Token Registration
- [ ] Flutter app displays FCM token in console
- [ ] Copied FCM token from console
- [ ] Registered token via API:
  ```bash
  curl -X POST http://localhost:3000/api/register-token \
    -H "Content-Type: application/json" \
    -d '{"userId":"test-user","fcmToken":"YOUR_TOKEN"}'
  ```
- [ ] Received success response
- [ ] Verified token stored in Supabase `user_tokens` table

### Notification Sending
- [ ] Sent test notification via API:
  ```bash
  curl -X POST http://localhost:3000/api/send-notification \
    -H "Content-Type: application/json" \
    -d '{"userId":"test-user","title":"Test","body":"Hello!"}'
  ```
- [ ] Received success response from API
- [ ] Push notification appeared on device
- [ ] Notification stored in Supabase `notifications` table

### App Functionality
- [ ] Notification appears in app's notification list
- [ ] Unread notification count badge shows correct number
- [ ] Tapping notification marks it as read
- [ ] Read status updates in real-time
- [ ] Pull-to-refresh works
- [ ] App handles foreground notifications
- [ ] App handles background notifications
- [ ] App handles terminated state notifications
- [ ] Tapping notification opens app

### Real-time Updates
- [ ] Sent notification while app is open
- [ ] Notification appears in list without refresh
- [ ] Badge count updates immediately
- [ ] No delays or errors

## ✅ Firebase Console Testing

### Using Firebase Console
- [ ] Navigated to Cloud Messaging in Firebase Console
- [ ] Clicked "Send your first message"
- [ ] Entered notification title and body
- [ ] Clicked "Send test message"
- [ ] Pasted FCM token
- [ ] Clicked "Test"
- [ ] Notification received on device

## ✅ Security Verification

### Backend Security
- [ ] `.env` file NOT committed to git
- [ ] `.env` in `.gitignore`
- [ ] Firebase service account JSON NOT committed
- [ ] Service role key only used in backend
- [ ] CORS configured (if needed)
- [ ] Input validation on API endpoints

### Database Security
- [ ] RLS enabled on `user_tokens` table
- [ ] RLS enabled on `notifications` table
- [ ] Policies verified for SELECT
- [ ] Policies verified for INSERT
- [ ] Policies verified for UPDATE
- [ ] Tested that users can't access others' data

### Client Security
- [ ] Only anon key used in Flutter app
- [ ] No service_role key in client code
- [ ] API calls use HTTPS in production
- [ ] No sensitive data in notification payloads

## ✅ Production Readiness

### Backend Deployment
- [ ] Chosen hosting platform (Heroku, Railway, etc.)
- [ ] Environment variables configured on platform
- [ ] HTTPS enabled
- [ ] Domain configured (if applicable)
- [ ] Health check endpoint monitored
- [ ] Error logging configured

### Flutter App
- [ ] Updated API URL to production endpoint
- [ ] Tested with production backend
- [ ] Removed debug code
- [ ] Updated app version
- [ ] Built release APK/IPA
- [ ] Tested release build

### Firebase Production
- [ ] Removed debug signing certificates (Android)
- [ ] Added release signing certificate (Android)
- [ ] Uploaded production APNs certificate (iOS)
- [ ] Tested production FCM delivery
- [ ] Configured notification icons and branding

### Monitoring
- [ ] Backend logging configured
- [ ] Error tracking setup (optional: Sentry, etc.)
- [ ] Firebase Analytics enabled (optional)
- [ ] Supabase monitoring dashboard checked
- [ ] Database backups configured

## 📋 Common Issues & Solutions

### Issue: FCM Token Not Received
**Check:**
- [ ] Google Play Services installed (Android)
- [ ] Notification permissions granted
- [ ] Firebase properly initialized
- [ ] `google-services.json` or `GoogleService-Info.plist` exists
- [ ] Internet connection available

### Issue: Notifications Not Appearing
**Check:**
- [ ] FCM token registered in database
- [ ] Notification permissions granted
- [ ] Notification channel configured (Android)
- [ ] Backend sends notification successfully
- [ ] Firebase Console shows delivery

### Issue: Real-time Not Working
**Check:**
- [ ] Realtime enabled for table in Supabase
- [ ] WebSocket connection established
- [ ] Subscription filter matches data
- [ ] Network connectivity stable
- [ ] RLS policies allow access

### Issue: Backend Connection Errors
**Check:**
- [ ] `.env` file exists and has correct values
- [ ] Firebase private key properly escaped
- [ ] Supabase URL and keys correct
- [ ] Server running and accessible
- [ ] CORS configured if needed

## 📝 Notes

**Important URLs:**
- Backend API: `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
- Supabase Dashboard: `https://app.supabase.com`
- Firebase Console: `https://console.firebase.google.com`

**Useful Commands:**
```bash
# Backend
npm install           # Install dependencies
npm start             # Start server
npm run dev           # Start with auto-reload

# Flutter
flutter pub get       # Install dependencies
flutter run           # Run app
flutter clean         # Clean build
flutter build apk     # Build Android APK
flutter build ios     # Build iOS app

# Testing
curl http://localhost:3000/api/health
```

**Documentation:**
- Main README: `README.md`
- Quick Start: `QUICKSTART.md`
- Implementation: `IMPLEMENTATION.md`
- Architecture: `ARCHITECTURE.md`
- Firebase Setup: `docs/FIREBASE_SETUP.md`
- Supabase Setup: `docs/SUPABASE_SETUP.md`

## ✨ Success Criteria

You've successfully set up the notifications system when:
- ✅ Backend API responds to health check
- ✅ Flutter app launches without errors
- ✅ FCM token is generated and registered
- ✅ Test notification received on device
- ✅ Notification appears in app list
- ✅ Real-time updates work
- ✅ Read/unread status updates
- ✅ Data persists in Supabase
- ✅ No errors in logs

Congratulations! 🎉 Your notification system is ready to use!
