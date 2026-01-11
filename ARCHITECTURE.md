# Project Architecture

## System Overview

This notification system consists of three main components that work together to deliver push notifications to mobile devices.

## Components

### 1. Flutter Mobile App (Frontend)
**Technology**: Flutter 3.0+, Dart

**Responsibilities**:
- Display notifications to users
- Register and manage FCM tokens
- Subscribe to real-time Supabase updates
- Provide UI for viewing notification history
- Handle notification interactions (tap, dismiss, mark as read)

**Key Features**:
- Firebase Cloud Messaging client
- Supabase real-time subscriptions
- Provider state management
- Local notification display
- Background/foreground message handling

### 2. Node.js Backend API (Middleware)
**Technology**: Node.js, Express

**Responsibilities**:
- Manage FCM token registration
- Send notifications via Firebase Admin SDK
- Store notification history in Supabase
- Provide REST API endpoints for notification operations
- Handle business logic and validation

**Key Features**:
- RESTful API design
- Firebase Admin SDK integration
- Supabase client integration
- CORS and security middleware
- Error handling and logging

### 3. Backend Services

#### Supabase (Database + Real-time)
**Responsibilities**:
- Store user FCM tokens
- Store notification history
- Provide real-time subscriptions
- Enforce Row Level Security (RLS)

**Tables**:
- `user_tokens`: FCM token storage
- `notifications`: Notification history

#### Firebase Cloud Messaging (Push Notifications)
**Responsibilities**:
- Deliver push notifications to devices
- Handle device registration
- Manage notification delivery across platforms (Android/iOS)
- Provide delivery analytics

## Data Flow

### Notification Send Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Client/Admin triggers notification                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Backend API receives request                            │
│     - POST /api/send-notification                           │
│     - Validates userId, title, body                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Backend queries Supabase                                │
│     - SELECT fcm_token FROM user_tokens WHERE user_id=...   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Backend sends to Firebase                               │
│     - admin.messaging().send(message)                       │
│     - Firebase delivers to device via FCM token             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Backend stores in Supabase                              │
│     - INSERT INTO notifications (user_id, title, body...)   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Supabase broadcasts real-time event                     │
│     - WebSocket notification to subscribed clients          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Flutter app receives notification                       │
│     - FCM: Push notification displayed                      │
│     - Supabase: Real-time update in notification list       │
└─────────────────────────────────────────────────────────────┘
```

### FCM Token Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Flutter app initializes                                 │
│     - Firebase.initializeApp()                              │
│     - Request notification permissions                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Get FCM token                                           │
│     - FirebaseMessaging.instance.getToken()                 │
│     - Token unique to device + app instance                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Send to backend                                         │
│     - POST /api/register-token                              │
│     - Body: { userId, fcmToken }                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Backend stores in Supabase                              │
│     - UPSERT into user_tokens                               │
│     - Links user_id with fcm_token                          │
└─────────────────────────────────────────────────────────────┘
```

### Real-time Notification Updates Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Flutter app establishes WebSocket connection            │
│     - Supabase.instance.client.channel()                    │
│     - Subscribe to notifications table for current user     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. New notification inserted into Supabase                 │
│     - Backend INSERT INTO notifications                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Supabase Realtime broadcasts event                      │
│     - Filters by user_id (RLS policy applied)               │
│     - Sends INSERT event via WebSocket                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Flutter app receives event                              │
│     - onPostgresChanges callback triggered                  │
│     - Updates Provider state                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  5. UI auto-updates                                         │
│     - Consumer widgets rebuild                              │
│     - New notification appears in list                      │
│     - Badge count updates                                   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Backend (Node.js)
```
├── Express.js          # Web framework
├── @supabase/supabase-js  # Supabase client
├── firebase-admin      # Firebase Admin SDK
├── cors                # CORS middleware
├── body-parser         # Request parsing
└── dotenv              # Environment variables
```

### Frontend (Flutter)
```
├── firebase_core       # Firebase initialization
├── firebase_messaging  # FCM client
├── supabase_flutter    # Supabase client with realtime
├── provider            # State management
├── flutter_local_notifications  # Local notifications
└── http                # HTTP client
```

### Database (Supabase/PostgreSQL)
```
Tables:
├── user_tokens         # FCM token storage
│   ├── id (uuid)
│   ├── user_id (text)
│   ├── fcm_token (text)
│   ├── created_at (timestamp)
│   └── updated_at (timestamp)
│
└── notifications       # Notification history
    ├── id (uuid)
    ├── user_id (text)
    ├── title (text)
    ├── body (text)
    ├── data (jsonb)
    ├── sent_at (timestamp)
    ├── read_at (timestamp)
    └── firebase_message_id (text)

Indexes:
├── idx_user_tokens_user_id
├── idx_notifications_user_id
├── idx_notifications_sent_at
└── idx_notifications_read_at

Security:
├── Row Level Security (RLS) enabled
├── Policies for SELECT, INSERT, UPDATE
└── auth.uid() based access control
```

## Security Architecture

### Backend Security
- Environment variables for sensitive data
- Firebase service account (private key) never exposed to client
- Supabase service_role key only used server-side
- CORS configured to restrict origins
- Input validation on all API endpoints

### Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data via policies
- Service role bypasses RLS for admin operations
- Policies use `auth.uid()` for user identification
- Indexes optimize query performance

### Client Security
- Only anon key used in Flutter app (not service_role)
- FCM tokens stored securely
- HTTPS for all API communications
- Notification data validated before display
- No sensitive data in notification payloads

## Scalability Considerations

### Database
- Indexed queries for fast lookups
- Connection pooling for high concurrency
- Pagination for large result sets
- Scheduled cleanup of old notifications
- Database backups configured

### Backend
- Stateless API design (horizontal scaling)
- Async operations for non-blocking I/O
- Batch operations for broadcasts
- Rate limiting to prevent abuse
- Caching for frequent queries

### Firebase
- FCM handles delivery at scale
- Auto-scaling based on load
- Global infrastructure
- Delivery prioritization
- Automatic retry logic

### Real-time
- WebSocket connection management
- Automatic reconnection
- Filtered subscriptions (reduce bandwidth)
- Connection pooling
- Presence tracking

## Monitoring & Observability

### Backend Monitoring
- Health check endpoint
- Error logging
- API response times
- Request/response logging
- Resource utilization metrics

### Firebase Monitoring
- Delivery success rate
- Failed deliveries
- Token refresh rate
- Platform-specific metrics
- Quota usage

### Supabase Monitoring
- Query performance
- Database size
- Connection count
- Real-time subscriptions
- API usage

## Development Workflow

```
Development        →    Testing         →    Production
────────────────────────────────────────────────────────
Local environment       Test devices        Production servers
├── localhost:3000      ├── Emulators      ├── Cloud hosting
├── Local Supabase      ├── Test users     ├── Production DB
└── Firebase test       └── Test tokens    └── Production FCM
```

## API Architecture

### REST Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/health` | GET | None | Health check |
| `/api/register-token` | POST | None* | Register FCM token |
| `/api/send-notification` | POST | None* | Send notification |
| `/api/broadcast-notification` | POST | None* | Broadcast to all |
| `/api/notifications/:userId` | GET | None* | Get notifications |
| `/api/notifications/:id/read` | PUT | None* | Mark as read |

\* In production, add authentication middleware

### Request/Response Examples

**Register Token:**
```json
// Request
POST /api/register-token
{
  "userId": "user123",
  "fcmToken": "eKj8s..."
}

// Response
{
  "success": true,
  "message": "Token registered successfully"
}
```

**Send Notification:**
```json
// Request
POST /api/send-notification
{
  "userId": "user123",
  "title": "New Message",
  "body": "You have a new message!",
  "data": {
    "type": "message",
    "messageId": "msg456"
  }
}

// Response
{
  "success": true,
  "messageId": "projects/...messages/..."
}
```

## Future Enhancements

1. **Authentication**: Add JWT-based auth
2. **User Management**: Integrate Supabase Auth
3. **Notification Types**: Categories, priorities
4. **Rich Media**: Images, videos in notifications
5. **Scheduling**: Queue notifications for later
6. **Analytics**: Track engagement metrics
7. **Templates**: Reusable notification templates
8. **Localization**: Multi-language support
9. **Preferences**: User notification settings
10. **Webhooks**: External integrations
