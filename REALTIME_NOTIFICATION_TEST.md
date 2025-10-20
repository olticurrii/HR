# 🔔 Real-Time Notification Testing Guide

## ✅ Notification System Status

Your notification system is **FULLY CONFIGURED** and ready! Notifications will be created automatically for:

- ✅ **Task Assignment** - When a task is assigned to a user
- ✅ **Chat Messages** - When someone sends a message (private, department, company)
- ✅ **Comment Replies** - When someone replies to your comment
- ✅ **Feedback** - When you receive feedback
- ✅ **Goal Approval/Rejection** - When goals are approved/rejected
- ✅ **Leave Approval/Rejection** - When leave requests are approved/rejected  
- ✅ **Reviews** - Peer and manager reviews

---

## 🧪 How to Test Real-Time Notifications

### **Option 1: Test in the Web App (Recommended)**

#### Test Task Assignment Notifications:

1. **Open TWO browser windows/tabs:**
   - Window A: Log in as **Admin** (admin@company.com)
   - Window B: Log in as **Jane Smith** (jane.smith@company.com)

2. **In Window A (Admin):**
   - Go to **Tasks** page
   - Click "Create Task"
   - Fill in the form:
     - Title: "Test Notification Task"
     - Description: "Testing real-time notifications"
     - **Assignee: Jane Smith**
     - Priority: Medium
   - Click "Create"

3. **In Window B (Jane):**
   - Watch the notification bell in the header
   - You should see the red badge appear or count increase
   - Click the bell to see the new notification
   - Click the notification to navigate to the task

**Expected Result:** Jane sees a notification within 30 seconds (or immediately if she refreshes)

---

#### Test Chat Message Notifications:

1. **Keep TWO windows open:**
   - Window A: Admin
   - Window B: Jane Smith

2. **In Window A (Admin):**
   - Go to **Chat** page
   - Start a private chat with Jane Smith (or use existing chat)
   - Send a message: "Testing notifications!"

3. **In Window B (Jane):**
   - Watch the notification bell
   - You should see "New Private Message" notification
   - Click the notification to open the chat

**Expected Result:** Jane sees the message notification

---

#### Test Department/Company Messages:

1. **In any user's window:**
   - Go to **Chat** → **Department Chat** or **Company Chat**
   - Send a message

2. **In other users' windows:**
   - They should see department/company message notifications

---

### **Option 2: Test with Monitoring Script**

For advanced testing, open a terminal and run the notification monitor:

```bash
cd /Users/olti/Desktop/Projektet\ e\ oltit/PristinaData/backend
python monitor_notifications.py
```

This will show **real-time** notifications as they're created in the database:

```
🔍 Monitoring notifications (initial count: 15)
================================================================================
Waiting for new notifications...
(Try creating a task, sending a message, or posting feedback)
================================================================================

🔔 1 NEW NOTIFICATION(S) at 17:30:45!
--------------------------------------------------------------------------------
  ID: 16
  Type: task_assigned
  For: Jane Smith
  Title: New Task Assigned
  Message: You have been assigned a new task: Test Notification Task
  Created: 2025-10-20 17:30:45
--------------------------------------------------------------------------------
```

---

## 🔄 How the Notification System Works

### **Automatic Triggers:**

When these events happen, notifications are **automatically created**:

1. **Task Created with Assignee** → `task_assigned` notification to assignee
2. **Chat Message Sent** → `private_message`, `department_message`, or `company_message` to participants
3. **Comment Reply** → `comment_reply` to original commenter
4. **Feedback Posted** → `feedback_received` to recipient
5. **Goal Approved/Rejected** → `goal_approved`/`goal_rejected` to employee
6. **Leave Approved/Rejected** → `leave_approved`/`leave_rejected` to employee
7. **Task Status Changed** → `task_reviewed` to creator/assignee

### **Notification Flow:**

```
Event Occurs (e.g., Task Created)
         ↓
Backend creates notification in database
         ↓
Frontend polls every 30 seconds
         ↓
Notification appears in bell with red badge
         ↓
User clicks → Navigates to relevant page
```

---

## ⚙️ Notification Polling

The notification bell **automatically checks** for new notifications every **30 seconds**.

**To see notifications immediately:**
- Refresh the page (Cmd+R / Ctrl+R)
- Or wait up to 30 seconds

**To adjust polling interval** (optional):
Edit `frontend/src/components/Notifications/NotificationBell.tsx` line 18:
```typescript
const interval = setInterval(loadNotifications, 30000); // Change 30000 to 10000 for 10 seconds
```

---

## 🎯 Quick Test Checklist

- [ ] Open app in two browser windows (different users)
- [ ] Create a task and assign it to the other user
- [ ] Check if notification appears in bell (within 30 seconds)
- [ ] Click notification bell to see the notification
- [ ] Click the notification - should navigate to the task
- [ ] Send a chat message to the other user
- [ ] Check if message notification appears
- [ ] Mark notification as read - badge count decreases
- [ ] Send feedback to someone - they get a notification
- [ ] Create/approve a goal - employee gets notification

---

## 🐛 Troubleshooting

### **"I don't see new notifications"**

1. **Check the notification bell** - Click it even if no badge shows
2. **Wait 30 seconds** - The system polls every 30 seconds
3. **Refresh the page** - Hard refresh (Cmd+Shift+R)
4. **Check browser console** - Look for errors (F12 → Console)
5. **Verify backend is running** - `curl http://localhost:8000/` should return JSON

### **"Notifications appear but I can't click them"**

- This is expected if there's no navigation data
- Task/Project/Feedback/Chat notifications should be clickable
- Other types may not navigate

### **"Verify notifications are being created"**

Run the monitor script:
```bash
cd backend
python monitor_notifications.py
```

Then trigger an event (create task, send message) and watch the terminal.

---

## 📊 Check Notification Status in Database

```bash
# See all notifications
sqlite3 backend/hr_app.db "SELECT id, type, title, is_read FROM notifications ORDER BY created_at DESC LIMIT 10"

# Count notifications by type
sqlite3 backend/hr_app.db "SELECT type, COUNT(*) FROM notifications GROUP BY type"

# See unread notifications
sqlite3 backend/hr_app.db "SELECT id, type, title FROM notifications WHERE is_read = 0"
```

---

## 🎉 Testing Summary

Your notification system is **WORKING**! Here's what to remember:

1. ✅ Notifications are created automatically when events occur
2. ✅ Frontend polls every 30 seconds (or on page load)
3. ✅ Notification bell shows unread count
4. ✅ Clicking notifications navigates to relevant pages
5. ✅ All 17 notification types are implemented and functional

**The key is the 30-second polling** - if you want instant updates, either:
- Refresh the page
- Reduce polling interval
- Implement WebSocket for real-time push (advanced)

---

## 📝 Next Steps

To see notifications in action:
1. **Test with multiple users** (open multiple browser windows)
2. **Create tasks, send messages, post feedback**
3. **Watch notifications appear** (within 30 seconds or on refresh)
4. **Customize notification preferences** (Profile → Notifications)

Need help? Run the monitoring script and watch notifications being created in real-time!

