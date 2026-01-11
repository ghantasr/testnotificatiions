const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register FCM token for a user
app.post('/api/register-token', async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({ error: 'userId and fcmToken are required' });
    }

    // Store FCM token in Supabase
    const { data, error } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userId,
        fcm_token: fcmToken,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;

    res.json({ success: true, message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notification to a specific user
app.post('/api/send-notification', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title, and body are required' });
    }

    // Get user's FCM token from Supabase
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('fcm_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({ error: 'User token not found' });
    }

    // Send notification via Firebase
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token: tokenData.fcm_token,
    };

    const response = await admin.messaging().send(message);

    // Store notification in Supabase
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      data: data || {},
      sent_at: new Date().toISOString(),
      firebase_message_id: response,
    });

    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user notifications
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });

    if (error) throw error;

    res.json({ notifications: data });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Broadcast notification to all users
app.post('/api/broadcast-notification', async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    // Get all FCM tokens from Supabase
    const { data: tokens, error: tokenError } = await supabase
      .from('user_tokens')
      .select('user_id, fcm_token');

    if (tokenError) throw tokenError;

    // Send to all tokens
    const messages = tokens.map(token => ({
      notification: { title, body },
      data: data || {},
      token: token.fcm_token,
    }));

    const response = await admin.messaging().sendEach(messages);

    // Store notifications in Supabase
    const notifications = tokens.map(token => ({
      user_id: token.user_id,
      title,
      body,
      data: data || {},
      sent_at: new Date().toISOString(),
    }));

    await supabase.from('notifications').insert(notifications);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
