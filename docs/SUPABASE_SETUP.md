# Supabase Setup Guide

This guide will walk you through setting up Supabase as the backend database for your notifications project.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Basic understanding of PostgreSQL

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub or create an account
4. Click **"New project"** in your organization
5. Fill in the project details:
   - **Name**: "notifications-sample" (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free (or choose a paid plan if needed)
6. Click **"Create new project"**
7. Wait 2-3 minutes for your project to be set up

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon)
2. Navigate to **API** section
3. Note down the following (you'll need these):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: This is your public anon key
   - **service_role** key: This is your service role key (keep this secret!)

## Step 3: Set Up Database Schema

### Option 1: Using SQL Editor (Recommended)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the content from `supabase/schema.sql`
4. Click **"Run"** or press `Ctrl+Enter`
5. Verify that tables are created successfully

### Option 2: Using Table Editor

If you prefer a visual approach:

1. Go to **Table Editor** in Supabase dashboard
2. Create the `user_tokens` table:
   - Click **"Create a new table"**
   - Name: `user_tokens`
   - Add columns:
     - `id` (uuid, primary key, default: `gen_random_uuid()`)
     - `user_id` (text, unique, not null)
     - `fcm_token` (text, not null)
     - `created_at` (timestamptz, default: `now()`)
     - `updated_at` (timestamptz, default: `now()`)
   - Enable RLS (Row Level Security)

3. Create the `notifications` table:
   - Click **"Create a new table"**
   - Name: `notifications`
   - Add columns:
     - `id` (uuid, primary key, default: `gen_random_uuid()`)
     - `user_id` (text, not null)
     - `title` (text, not null)
     - `body` (text, not null)
     - `data` (jsonb, nullable)
     - `sent_at` (timestamptz, default: `now()`)
     - `read_at` (timestamptz, nullable)
     - `firebase_message_id` (text, nullable)
   - Enable RLS (Row Level Security)

4. Then run the policies and triggers from SQL Editor using `supabase/schema.sql`

## Step 4: Configure Row Level Security (RLS)

RLS policies are already included in the `schema.sql` file. They ensure:

- Users can only view their own tokens and notifications
- Users can insert and update their own tokens
- Users can update (mark as read) their own notifications

To verify RLS policies:

1. Go to **Authentication** → **Policies**
2. Select `user_tokens` table
3. You should see policies for SELECT, INSERT, and UPDATE
4. Select `notifications` table
5. You should see policies for SELECT and UPDATE

## Step 5: Enable Realtime

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the `notifications` table in the list
3. Toggle **"Enable Realtime"** for the `notifications` table
4. This allows the Flutter app to receive real-time updates when new notifications arrive

## Step 6: Set Up Authentication (Optional but Recommended)

For production use, you should use Supabase authentication:

1. Go to **Authentication** → **Providers**
2. Enable your preferred authentication methods:
   - Email/Password
   - Magic Link
   - OAuth (Google, GitHub, etc.)

### Update RLS Policies for Auth:

The current schema uses `auth.uid()` which assumes Supabase authentication is being used. If you're using custom authentication:

```sql
-- For custom auth, modify policies to match your auth system
-- Example: using a custom claims approach
CREATE POLICY "Users can view their own tokens" ON user_tokens
  FOR SELECT USING (user_id = current_setting('request.jwt.claims')::json->>'user_id');
```

## Step 7: Update Backend Configuration

Update your `.env` file with Supabase credentials:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** 
- Use the **service_role** key for backend (server-side) operations
- Use the **anon** key for Flutter app (client-side) operations

## Step 8: Update Flutter App Configuration

Edit `flutter_app/lib/main.dart` and replace the Supabase initialization:

```dart
await Supabase.initialize(
  url: 'https://xxxxx.supabase.co',  // Your project URL
  anonKey: 'your-anon-key-here',     // Your anon public key
);
```

## Step 9: Test Supabase Connection

### Test Backend Connection:

Create a test file `test-supabase.js`:

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  // Test insert
  const { data, error } = await supabase
    .from('user_tokens')
    .insert({
      user_id: 'test-user',
      fcm_token: 'test-token-123',
    });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
```

Run it:
```bash
node test-supabase.js
```

### Test Flutter Connection:

The Flutter app will automatically test the connection when it starts and tries to fetch notifications.

## Step 10: Monitor Your Database

1. Go to **Table Editor** to view and edit data
2. Go to **SQL Editor** to run custom queries
3. Go to **Database** → **Backups** to manage backups (paid plans)

### Useful Queries:

**View all notifications for a user:**
```sql
SELECT * FROM notifications
WHERE user_id = 'user123'
ORDER BY sent_at DESC;
```

**View unread notifications:**
```sql
SELECT * FROM notifications
WHERE user_id = 'user123' AND read_at IS NULL
ORDER BY sent_at DESC;
```

**Count notifications by user:**
```sql
SELECT user_id, COUNT(*) as total
FROM notifications
GROUP BY user_id;
```

**View all FCM tokens:**
```sql
SELECT user_id, fcm_token, updated_at
FROM user_tokens
ORDER BY updated_at DESC;
```

## Step 11: Set Up Indexes (Already Included)

Indexes are created in `schema.sql` for optimal query performance:

- `idx_user_tokens_user_id` - Fast user token lookups
- `idx_notifications_user_id` - Fast user notification queries
- `idx_notifications_sent_at` - Efficient time-based sorting
- `idx_notifications_read_at` - Quick unread notification queries

## Step 12: Configure Database Webhooks (Optional)

You can set up webhooks to trigger external services when notifications are created:

1. Go to **Database** → **Webhooks**
2. Click **"Create a new webhook"**
3. Configure:
   - **Table**: notifications
   - **Events**: INSERT
   - **Webhook URL**: Your external service endpoint
4. Click **"Create webhook"**

## Advanced Configuration

### Enable Connection Pooling:

1. Go to **Settings** → **Database**
2. Note the **Connection pooling** settings
3. Use the pooler URL for high-traffic applications

### Set Up Database Functions:

Create custom functions for complex operations:

```sql
-- Example: Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Troubleshooting

### Connection Issues:

1. **"Invalid API key" error:**
   - Verify you're using the correct anon/service_role key
   - Check for extra spaces or quotes in environment variables
   - Ensure URL includes `https://`

2. **RLS policy violations:**
   - Verify RLS policies are correctly set up
   - Check that `auth.uid()` matches your authentication setup
   - Use service_role key for admin operations

### Performance Issues:

1. **Slow queries:**
   - Check that indexes are created
   - Use EXPLAIN ANALYZE to identify bottlenecks
   - Consider adding more specific indexes

2. **Connection timeouts:**
   - Use connection pooling for high traffic
   - Optimize your queries
   - Consider upgrading to a paid plan

### Realtime Issues:

1. **Not receiving real-time updates:**
   - Verify Realtime is enabled for the table
   - Check that the subscription filter matches your data
   - Ensure proper network connectivity

## Security Best Practices

1. **Never expose service_role key in client-side code**
2. **Always use RLS policies for data access control**
3. **Regularly rotate your database password**
4. **Use environment variables for all credentials**
5. **Enable 2FA on your Supabase account**
6. **Monitor suspicious activity in the dashboard**

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Flutter Documentation](https://supabase.com/docs/reference/dart/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Dashboard](https://app.supabase.com/)
