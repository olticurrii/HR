# 🔔 Notification System Testing Guide

## Overview
The notification system sends real-time notifications for 17 different event types across email, in-app, and push channels.

## How to Test Notifications

### 1. **In-App Notifications (Easiest to Test)**

#### Check the Notification Bell
1. Log in to the application
2. Look for the bell icon (🔔) in the top-right header
3. You'll see a red badge with unread count if you have notifications
4. Click the bell to open the notification dropdown

#### View Your Notification Preferences
1. Go to **Profile** → **Notifications** tab
2. You'll see all notification types with toggles for:
   - 📧 Email
   - 🖥️ In-App
   - 📱 Push
3. Enable/disable specific notification types

---

### 2. **Test Each Notification Type**

#### A. **Task Assignment Notifications**
**How to trigger:**
1. Have another user (or admin) create a task
2. Assign it to you
3. Check the notification bell - you should see "New Task Assigned"

**Or test manually via API:**
```bash
# Get your auth token first by logging in
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing notifications",
    "assignee_id": YOUR_USER_ID,
    "status": "pending"
  }'
```

#### B. **Comment Reply Notifications**
**How to trigger:**
1. Make a comment on a task
2. Have someone reply to your comment
3. You'll get a notification: "X replied to your comment"

#### C. **Chat/Message Notifications**
**How to trigger:**
1. Go to **Chat** page
2. Open a private chat or department chat
3. Send a message
4. Other participants will receive notifications

**Test private messages:**
- Navigate to Chat → Start a new private chat
- Send a message
- The recipient gets a "New Private Message" notification

**Test department messages:**
- Go to your department chat
- Send a message
- All department members get a "New Department Message" notification

**Test company messages:**
- Go to company-wide chat
- Send a message
- All users get a "New Company Message" notification

#### D. **Feedback Notifications**
**How to trigger:**
1. Go to **Feedback** page
2. Send feedback to a specific user
3. They'll receive a "New Feedback Received" notification

**Test public feedback:**
- Send feedback to "Everyone"
- All users will get a "New Public Feedback" notification

**Test feedback replies:**
- Reply to someone's feedback
- They'll get a "Feedback Reply" notification

#### E. **Goal Approval/Rejection**
**How to trigger (as employee):**
1. Go to **Performance** → **My Goals**
2. Create a new goal with "Requires Approval" checked
3. Wait for manager/admin to approve or reject
4. You'll receive "Goal Approved" or "Goal Rejected" notification

**Test as admin:**
1. Go to Performance approvals
2. Approve or reject a goal
3. The employee receives a notification

#### F. **Leave Request Approval/Rejection**
**How to trigger:**
1. Go to **Leave** → **Request Leave**
2. Submit a leave request
3. Have an admin/manager approve or reject it
4. You'll receive "Leave Approved" or "Leave Rejected" notification

#### G. **Performance Review Notifications**
**How to trigger:**
1. Create a peer review request
2. The peer receives a "Peer Review Request" notification

**For manager reviews:**
- Manager creates a review for an employee
- Employee receives "Manager Review" notification

#### H. **Task Reviewed**
**How to trigger:**
1. Complete a task (change status to "completed")
2. The task creator receives a "Task Reviewed" notification

---

### 3. **Testing the Notification Bell Features**

#### Mark as Read
1. Click the bell icon
2. Click on any notification
3. It should mark as read and the unread count decreases

#### Mark All as Read
1. Click the bell icon
2. Click "Mark all read" at the top
3. All notifications become read

#### Navigate from Notifications
1. Click on a notification (e.g., task notification)
2. It should navigate you to the relevant page
3. Supported navigation:
   - Task notifications → Task page
   - Project notifications → Project page
   - Feedback notifications → Feedback page
   - Chat notifications → Chat page

---

### 4. **Testing Push Notifications**

#### Enable Push Notifications
1. Go to **Profile** → **Notifications**
2. Look for the "Push Notifications" section at the top
3. Click "Enable"
4. Your browser will prompt you for permission
5. Accept the permission

#### Test Web Push
1. Once enabled, trigger any notification event (e.g., send yourself a task)
2. You should receive a browser push notification
3. Click the notification to open the app

**Note:** Push notifications work when:
- You have granted browser permission
- The service worker is registered
- You're subscribed to push notifications
- Push is enabled in your preferences

---

### 5. **Testing Email Notifications**

**Current Status:** Email infrastructure is in place but requires SMTP configuration.

**To enable email notifications:**
1. Configure SMTP settings in organization settings (admin only)
2. Update the notification service with your email provider details
3. Once configured, email notifications will be sent for all enabled notification types

**Placeholder behavior:**
- Currently logs email notifications to console
- Shows: `📧 Email notification sent to user@email.com: Notification Title`

---

### 6. **Testing Notification Preferences**

#### Test Per-Channel Preferences
1. Go to **Profile** → **Notifications**
2. Disable "In-App" for "Task Assigned"
3. Have someone assign you a task
4. You should NOT see an in-app notification
5. Enable it again and test - notification should appear

#### Test Category Toggles
1. Use "All" / "None" buttons for each channel
2. Click "All" for Email - enables all email notifications
3. Click "None" for Push - disables all push notifications

---

### 7. **Admin Testing**

#### Test Organization-Wide Settings
1. Log in as admin
2. Go to **Settings**
3. Look for notification settings:
   - Master notification toggle
   - Email notifications enabled/disabled
   - Push notifications enabled/disabled

**When disabled:**
- Users won't receive notifications even if their preferences are enabled
- Organization settings override user preferences

---

### 8. **Testing Notification Polling**

The notification bell automatically checks for new notifications every 30 seconds.

**To test:**
1. Open the app in one browser window
2. Trigger a notification event in another window (or via API)
3. Wait up to 30 seconds
4. The notification count should update automatically

---

### 9. **Quick Test Script**

Here's a quick way to generate test notifications via API:

```bash
# First, log in and get your token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123" | jq -r .access_token)

# Create a test task (triggers task_assigned notification)
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification Task",
    "description": "This should trigger a notification",
    "assignee_id": 3,
    "status": "pending",
    "priority": "medium"
  }'

# Send test feedback (triggers feedback_received notification)
curl -X POST http://localhost:8000/api/v1/feedback \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test feedback notification",
    "recipient_type": "USER",
    "recipient_id": 3,
    "is_anonymous": false
  }'

# View your notifications
curl -X GET http://localhost:8000/api/v1/notifications \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 10. **Troubleshooting**

#### Notifications Not Appearing?
1. **Check the bell icon** - Click it to see if notifications are there but just not showing the badge
2. **Check notification preferences** - Profile → Notifications → Ensure in-app is enabled
3. **Check organization settings** - Admin may have disabled notifications globally
4. **Check browser console** - Look for any JavaScript errors
5. **Refresh the page** - Sometimes a hard refresh (Cmd+Shift+R) helps

#### Push Notifications Not Working?
1. **Check browser permission** - Settings → Site Settings → Notifications
2. **Check if subscribed** - Profile → Notifications → Push section should show "Enabled"
3. **Service worker issues** - Open DevTools → Application → Service Workers → Check if registered
4. **HTTPS required** - Push notifications require HTTPS (or localhost for testing)

#### Email Notifications Not Sending?
1. **Check SMTP configuration** - Currently not configured (logs to console instead)
2. **Check spam folder** - When configured, emails might go to spam
3. **Check email preferences** - Ensure email is enabled for that notification type

---

### 11. **Expected Notification Flow**

```
Event Triggered (e.g., Task Assigned)
          ↓
Check Organization Settings (notifications_enabled?)
          ↓
Check User Preferences (inapp_task_assigned?)
          ↓
Create Notification in Database
          ↓
Send to User (in-app, email, push based on preferences)
          ↓
User Sees Notification in Bell
          ↓
User Clicks → Marks as Read → Navigates to Item
```

---

### 12. **Notification Types Quick Reference**

| Type | Trigger | Navigation |
|------|---------|-----------|
| `task_assigned` | Task assigned to you | /tasks/{id} |
| `project_assigned` | Added to project | /projects/{id} |
| `late_to_work` | Late clock-in detected | /time-tracking |
| `comment_reply` | Reply to your comment | /tasks/{id} |
| `task_reviewed` | Task completed/reviewed | /tasks/{id} |
| `feedback_received` | Direct feedback to you | /feedback |
| `public_feedback` | Feedback to Everyone | /feedback |
| `feedback_replied` | Reply to your feedback | /feedback |
| `peer_review` | Peer review request | /performance |
| `manager_review` | Manager review | /performance |
| `goal_approved` | Goal approved | /performance |
| `goal_rejected` | Goal rejected | /performance |
| `leave_approved` | Leave approved | /leave |
| `leave_rejected` | Leave rejected | /leave |
| `private_message` | Direct message | /chat |
| `department_message` | Department chat message | /chat |
| `company_message` | Company chat message | /chat |

---

## Testing Checklist

- [ ] Notification bell appears in header
- [ ] Unread count badge shows correctly
- [ ] Clicking bell opens dropdown
- [ ] Notifications display with correct icons and messages
- [ ] Clicking notification navigates to correct page
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Notification preferences page loads
- [ ] Can toggle individual notification types
- [ ] "All" / "None" buttons work
- [ ] Push notification enable/disable works
- [ ] Browser permission prompt appears for push
- [ ] Task assignment creates notification
- [ ] Comment reply creates notification
- [ ] Chat messages create notifications
- [ ] Feedback creates notifications
- [ ] Goal approval/rejection creates notifications
- [ ] Leave approval/rejection creates notifications
- [ ] Auto-refresh works (30-second polling)
- [ ] Notifications persist across page reloads

---

## Support

If you encounter any issues while testing:
1. Check the browser console for errors
2. Check the backend logs: `tail -f /tmp/backend_final.log`
3. Verify the backend is running: `curl http://localhost:8000/`
4. Check notification API: `curl http://localhost:8000/api/v1/notifications -H "Authorization: Bearer YOUR_TOKEN"`

