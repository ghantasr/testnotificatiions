# Notifications Sample Project

A complete sample project demonstrating notifications implementation using **Firebase Cloud Messaging (FCM)** for push notifications and **Supabase** for backend database storage.

## 🏗️ Project Structure

```
notifications-sample-project/
├── server/                    # Node.js backend API
│   └── index.js              # Express server with API endpoints
├── flutter_app/              # Flutter mobile application
│   ├── lib/
│   │   ├── models/          # Data models
│   │   ├── providers/       # State management
│   │   ├── screens/         # UI screens
│   │   ├── services/        # Firebase & Supabase services
│   │   ├── firebase_options.dart
│   │   └── main.dart
│   └── pubspec.yaml
├── supabase/                 # Supabase configuration
│   └── schema.sql           # Database schema
├── docs/                     # Documentation
│   ├── FIREBASE_SETUP.md    # Firebase setup instructions
│   └── SUPABASE_SETUP.md    # Supabase setup instructions
├── .env.example              # Environment variables template
├── .gitignore
└── package.json              # Backend dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Flutter SDK (v3.0 or higher)
- Firebase account
- Supabase account

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd testnotificatiions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Supabase credentials
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will run on `http://localhost:3000`

### Flutter App Setup

1. **Navigate to Flutter app directory**
   ```bash
   cd flutter_app
   ```

2. **Install Flutter dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   - Follow the instructions in [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)
   - Run `flutterfire configure` to generate `firebase_options.dart`

4. **Configure Supabase**
   - Update Supabase URL and anon key in `lib/main.dart`
   - Follow the instructions in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

5. **Run the app**
   ```bash
   flutter run
   ```

## 📱 Features

### Backend API Features
- ✅ Register FCM tokens for users
- ✅ Send notifications to specific users
- ✅ Broadcast notifications to all users
- ✅ Store notification history in Supabase
- ✅ Retrieve user notifications
- ✅ Mark notifications as read

### Flutter App Features
- ✅ Firebase Cloud Messaging integration
- ✅ Local notifications for foreground messages
- ✅ Background & terminated state message handling
- ✅ Supabase real-time subscriptions
- ✅ Notification list with read/unread status
- ✅ Pull-to-refresh functionality
- ✅ Unread notification badge

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Register FCM Token
```http
POST /api/register-token
Content-Type: application/json

{
  "userId": "user123",
  "fcmToken": "fcm_token_here"
}
```

### Send Notification to User
```http
POST /api/send-notification
Content-Type: application/json

{
  "userId": "user123",
  "title": "Hello!",
  "body": "This is a test notification",
  "data": {
    "custom_key": "custom_value"
  }
}
```

### Broadcast Notification
```http
POST /api/broadcast-notification
Content-Type: application/json

{
  "title": "Important Update",
  "body": "This is broadcasted to all users",
  "data": {}
}
```

### Get User Notifications
```http
GET /api/notifications/:userId
```

### Mark Notification as Read
```http
PUT /api/notifications/:notificationId/read
```

## 🗄️ Database Schema

The Supabase database includes two main tables:

### `user_tokens`
Stores FCM tokens for each user
- `id` (UUID): Primary key
- `user_id` (TEXT): Unique user identifier
- `fcm_token` (TEXT): Firebase Cloud Messaging token
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### `notifications`
Stores notification history
- `id` (UUID): Primary key
- `user_id` (TEXT): User identifier
- `title` (TEXT): Notification title
- `body` (TEXT): Notification body
- `data` (JSONB): Custom data payload
- `sent_at` (TIMESTAMP): When notification was sent
- `read_at` (TIMESTAMP): When notification was read (nullable)
- `firebase_message_id` (TEXT): Firebase message ID

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own tokens and notifications
- Service role key used for server-side operations
- Anon key used for client-side operations

## 📚 Documentation

For detailed setup instructions, see:
- [Firebase Setup Guide](docs/FIREBASE_SETUP.md)
- [Supabase Setup Guide](docs/SUPABASE_SETUP.md)

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Supabase JavaScript Client

**Frontend:**
- Flutter
- Firebase Messaging
- Supabase Flutter Client
- Provider (State Management)
- Flutter Local Notifications

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
