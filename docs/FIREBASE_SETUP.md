# Firebase Setup Guide

This guide will walk you through setting up Firebase Cloud Messaging (FCM) for your notifications project.

## Prerequisites

- A Google account
- Flutter development environment set up
- FlutterFire CLI installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "notifications-sample")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**
6. Wait for the project to be created

## Step 2: Add Apps to Your Firebase Project

### For Android:

1. In the Firebase Console, click on the **Android icon** to add an Android app
2. Register your app:
   - **Android package name**: `com.example.notifications_sample` (or your package name)
   - **App nickname** (optional): "Notifications Sample Android"
   - **Debug signing certificate SHA-1** (optional, but recommended for testing)
3. Click **"Register app"**
4. Download the `google-services.json` file
5. Place it in `flutter_app/android/app/` directory

### For iOS:

1. In the Firebase Console, click on the **iOS icon** to add an iOS app
2. Register your app:
   - **iOS bundle ID**: `com.example.notificationsSample` (or your bundle ID)
   - **App nickname** (optional): "Notifications Sample iOS"
3. Click **"Register app"**
4. Download the `GoogleService-Info.plist` file
5. Place it in `flutter_app/ios/Runner/` directory using Xcode

## Step 3: Enable Firebase Cloud Messaging

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to the **Cloud Messaging** tab
3. Note down your **Server Key** and **Sender ID** (you'll need these for backend)

### For iOS (Additional Steps):

1. Upload your APNs Authentication Key or Certificate:
   - Go to **Project Settings** → **Cloud Messaging**
   - Under **iOS app configuration**, upload your APNs key
   - You can create an APNs key in the [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)

## Step 4: Install FlutterFire CLI

```bash
# Install FlutterFire CLI globally
dart pub global activate flutterfire_cli

# Make sure it's in your PATH
export PATH="$PATH":"$HOME/.pub-cache/bin"
```

## Step 5: Configure FlutterFire

```bash
# Navigate to your Flutter app directory
cd flutter_app

# Run FlutterFire configure
flutterfire configure

# Select your Firebase project
# This will automatically:
# - Create firebase_options.dart
# - Configure all platforms
# - Set up Firebase dependencies
```

## Step 6: Update Android Configuration

Edit `flutter_app/android/app/build.gradle`:

```gradle
android {
    ...
    defaultConfig {
        ...
        minSdkVersion 21  // FCM requires minimum SDK 21
    }
}
```

Edit `flutter_app/android/build.gradle`:

```gradle
buildscript {
    dependencies {
        ...
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

Edit `flutter_app/android/app/build.gradle` (add at the bottom):

```gradle
apply plugin: 'com.google.gms.google-services'
```

## Step 7: Update iOS Configuration

1. Open `flutter_app/ios/Runner.xcworkspace` in Xcode
2. Go to **Runner** → **Signing & Capabilities**
3. Click **"+ Capability"** and add:
   - **Push Notifications**
   - **Background Modes** (enable "Remote notifications")

## Step 8: Add Required Permissions

### Android (`flutter_app/android/app/src/main/AndroidManifest.xml`):

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/> <!-- Android 13+ -->
    
    <application ...>
        ...
        <!-- Add this for FCM -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="default_channel" />
    </application>
</manifest>
```

### iOS (`flutter_app/ios/Runner/Info.plist`):

Add the following inside the `<dict>` tag:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

## Step 9: Get Firebase Service Account for Backend

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file (this is your service account key)
4. Extract the following values for your `.env` file:
   - `project_id`
   - `private_key`
   - `client_email`

## Step 10: Update Backend Environment Variables

Update your `.env` file with Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important:** The private key should include `\n` characters for line breaks.

## Step 11: Test Firebase Configuration

### Test Backend:

```bash
# Start your backend server
npm start

# Test health endpoint
curl http://localhost:3000/api/health
```

### Test Flutter App:

```bash
cd flutter_app
flutter run
```

When the app starts, check the console for:
```
User granted permission
FCM Token: <your-fcm-token>
```

## Step 12: Test Sending Notifications

### Using Firebase Console:

1. Go to **Firebase Console** → **Cloud Messaging**
2. Click **"Send your first message"**
3. Enter notification title and text
4. Click **"Send test message"**
5. Enter your FCM token from the Flutter app console
6. Click **"Test"**

### Using Backend API:

```bash
# Register a token
curl -X POST http://localhost:3000/api/register-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "fcmToken": "your-fcm-token-from-flutter-console"
  }'

# Send a notification
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Test Notification",
    "body": "This is a test from the backend!"
  }'
```

## Troubleshooting

### Android Issues:

1. **No FCM token received:**
   - Ensure Google Play Services is installed on your device/emulator
   - Check `google-services.json` is in the correct location
   - Verify minSdkVersion is 21 or higher

2. **Notifications not appearing:**
   - Check notification permissions are granted
   - Verify channel configuration in AndroidManifest.xml

### iOS Issues:

1. **No FCM token received:**
   - Ensure APNs certificate/key is uploaded to Firebase
   - Check that Push Notifications capability is enabled
   - Verify GoogleService-Info.plist is in the correct location

2. **Background notifications not working:**
   - Ensure "Background Modes" → "Remote notifications" is enabled
   - Check Info.plist has UIBackgroundModes configured

### Backend Issues:

1. **"Invalid credentials" error:**
   - Verify your Firebase service account credentials
   - Check that private key has proper `\n` formatting
   - Ensure no extra spaces in environment variables

2. **"Registration token is not valid" error:**
   - The FCM token may have expired
   - Re-register the token from the Flutter app

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FlutterFire Documentation](https://firebase.flutter.dev/)
- [Firebase Console](https://console.firebase.google.com/)
- [FCM HTTP v1 API Reference](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
