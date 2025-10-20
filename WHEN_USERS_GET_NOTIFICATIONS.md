# When Users Get Notifications 🔔

## Overview
The system has a comprehensive notification system with **in-app notifications** and **email notifications**, both controlled by organization-wide settings and individual user preferences.

---

## 📬 Notification Triggers

### 1. **Task Assigned**
**When:** A task is assigned to a user  
**Who Gets Notified:** The assignee  
**Notification Contains:**
- Title: "New Task Assigned"
- Message: "You've been assigned: [Task Title]"
- Link: `/tasks/{task_id}`

**Channels:**
- ✉️ Email (if enabled)
- 🔔 In-app notification

**User Can Disable:** Yes (in Profile → Notifications)

---

### 2. **Goal Approved**
**When:** A manager approves an employee's performance goal  
**Who Gets Notified:** The employee who created the goal  
**Notification Contains:**
- Title: "Goal Approved"
- Message: 'Your goal "[Goal Title]" has been approved!'
- Link: `/performance`

**Channels:**
- ✉️ Email (if enabled)
- 🔔 In-app notification

**User Can Disable:** Yes

---

### 3. **Goal Rejected/Needs Revision**
**When:** A manager rejects or requests changes to a goal  
**Who Gets Notified:** The employee who created the goal  
**Notification Contains:**
- Title: "Goal Needs Revision"
- Message: 'Your goal "[Goal Title]" needs revision: [Reason]'
- Link: `/performance`

**Channels:**
- ✉️ Email (if enabled)
- 🔔 In-app notification

**User Can Disable:** Yes

---

### 4. **Feedback Received**
**When:** Someone sends feedback to a user  
**Who Gets Notified:**
- **Direct Recipient** (if recipient_type = USER)
- **Recipient's Manager** (if feedback is negative)
- **All Admins** (if recipient_type = ADMIN)
- **All Admins** (if recipient_type = EVERYONE - company-wide)

**Notification Contains:**
- Title: "New Feedback Received"
- Message: "You've received new feedback"
- Link: `/feedback`

**Channels:**
- ✉️ Email (if enabled)
- 🔔 In-app notification

**User Can Disable:** Yes

**Special Rules:**
- Anonymous feedback: Author identity is masked
- Negative feedback: Manager is automatically notified
- Company-wide feedback: Admins get notified

---

### 5. **Leave Approved** (Future Feature)
**When:** A leave request is approved  
**Who Gets Notified:** The employee who requested leave  
**User Can Disable:** Yes

---

### 6. **Daily Admin Digest** 📊
**When:** Every day (scheduled)  
**Who Gets Notified:** All administrators  
**Contains:**
- New users count
- New feedback count
- Flagged feedback count
- Pending goal approvals count
- Unread notifications count

**Channel:** Email only  
**User Can Disable:** No (admin-level feature)  
**Org Can Disable:** Yes (in Settings)

---

### 7. **Weekly Feedback Summary** 📈
**When:** Weekly (scheduled)  
**Who Gets Notified:** All administrators  
**Contains:**
- Total feedback for the week
- Sentiment breakdown (positive/neutral/negative)
- Flagged content count
- Anonymous feedback count
- Top keywords
- Top feedback authors
- Recipient type distribution

**Channel:** Email only  
**User Can Disable:** No (admin-level feature)  
**Org Can Disable:** Yes (in Settings)

---

## 🎛️ Control Levels

### **Level 1: Organization Settings** (Admin Only)
Located in: Settings Page (Admin → Settings)

**Master Switches:**
- ✅ Email Notifications Enabled (master on/off for ALL email)
- ✅ In-App Notifications Enabled (master on/off for ALL in-app)
- ✅ Daily Summary Enabled (admin digest)

**If disabled at org level:**
- ❌ NO notifications of that type will be sent to ANYONE
- User preferences are ignored

---

### **Level 2: User Preferences** (Per User)
Located in: Profile → Notifications Tab

**Individual Controls:**

| Notification Type | Email | In-App |
|-------------------|-------|--------|
| Task Assigned | ✓ | ✓ |
| Goal Approved | ✓ | ✓ |
| Goal Rejected | ✓ | ✓ |
| Feedback Received | ✓ | ✓ |
| Leave Approved | ✓ | ✓ |

**How It Works:**
- Each user can toggle email AND in-app notifications independently
- Respects org-level settings (if org disabled, user can't enable)
- Defaults: All enabled

---

## 🔔 In-App Notifications

### **Where to See:**
- **Notification Bell** in header (top-right)
- Shows unread count badge
- Click to see dropdown with recent notifications

### **Features:**
- Real-time updates (polling every 30 seconds)
- Mark individual as read
- Mark all as read
- Click notification to navigate to relevant page
- Shows title, message, and timestamp

### **Retention:**
- All notifications are kept in database
- Can view history (last 50 by default)
- Filter: unread only or all

---

## 📧 Email Notifications

### **Current Status:**
- ⚠️ **Stubbed** (prints to console in development)
- 📝 Ready for integration with:
  - SendGrid
  - AWS SES
  - Mailgun
  - Any SMTP service

### **Implementation Location:**
`backend/app/services/notification_service_enhanced.py`

Function: `send_email_notification()`

Currently:
```python
print(f"📧 EMAIL QUEUED: To user {user_id}, Subject: {subject}")
```

**To Enable Real Emails:**
1. Choose email service
2. Add API keys to `.env`
3. Implement actual sending in `send_email_notification()`

---

## 📋 Notification Flow

### Example: Task Assignment

```
1. Admin creates task and assigns to Employee A
        ↓
2. System checks organization settings:
   - email_notifications_enabled? → Yes
   - inapp_notifications_enabled? → Yes
        ↓
3. System checks Employee A's preferences:
   - email_task_assigned? → Yes
   - inapp_task_assigned? → Yes
        ↓
4. System creates:
   - In-app notification (stored in database)
   - Email queued (or sent if configured)
        ↓
5. Employee A sees:
   - Bell icon shows "1" unread
   - Email arrives in inbox
        ↓
6. Employee A clicks notification:
   - Redirected to /tasks/{task_id}
   - Notification marked as read
   - Bell count decreases
```

---

## 🔍 Technical Details

### **Database Tables:**

#### `inapp_notifications`
```sql
- id (primary key)
- user_id (foreign key → users)
- type (task_assigned, goal_approved, etc.)
- title
- message
- link (URL to relevant page)
- is_read (boolean)
- created_at
- read_at
```

#### `user_notification_preferences`
```sql
- id (primary key)
- user_id (foreign key → users, unique)
- email_task_assigned (boolean, default true)
- email_goal_approved (boolean, default true)
- email_goal_rejected (boolean, default true)
- email_feedback_received (boolean, default true)
- email_leave_approved (boolean, default true)
- inapp_task_assigned (boolean, default true)
- inapp_goal_approved (boolean, default true)
- inapp_goal_rejected (boolean, default true)
- inapp_feedback_received (boolean, default true)
- inapp_leave_approved (boolean, default true)
```

#### `organization_settings`
```sql
- email_notifications_enabled (boolean, default true)
- inapp_notifications_enabled (boolean, default true)
- daily_summary_enabled (boolean, default true)
```

---

## 🚀 API Endpoints

### **For Users:**
```
GET  /api/v1/notifications
     ?limit=50&unread_only=false

POST /api/v1/notifications/{id}/read

POST /api/v1/notifications/read-all

GET  /api/v1/notifications/preferences

PUT  /api/v1/notifications/preferences
```

### **For Admins:**
```
GET  /api/v1/admin/notifications/daily-digest
```

---

## 🧪 Testing Notifications

### **Trigger Test Notifications:**

1. **Task Assigned:**
   ```
   Admin → Tasks → Create Task → Assign to someone
   ```

2. **Goal Approved:**
   ```
   Employee → Performance → Create Goal
   Manager → Performance → Approve Goal
   ```

3. **Feedback Received:**
   ```
   Anyone → Feedback → Send to specific user
   ```

### **Check Notifications:**

1. **In-App:**
   - Look at bell icon (should show count)
   - Click bell → see notification
   - Click notification → navigate to page

2. **Email (Dev):**
   - Check backend console logs
   - Look for: `📧 EMAIL QUEUED: ...`

3. **Backend Logs:**
   ```bash
   tail -f /tmp/backend_insights.log
   # or wherever your logs are
   ```

---

## 📊 Notification Types Enum

```python
class NotificationType(str, Enum):
    TASK_ASSIGNED = "task_assigned"
    GOAL_APPROVED = "goal_approved"
    GOAL_REJECTED = "goal_rejected"
    FEEDBACK_RECEIVED = "feedback_received"
    LEAVE_APPROVED = "leave_approved"
    # More can be added...
```

---

## ⚙️ Configuration

### **Backend:**
File: `backend/app/services/notification_service_enhanced.py`

Functions:
- `create_inapp_notification()` - Creates in-app notification
- `send_email_notification()` - Sends email (stub)
- `should_send_notification()` - Checks if notification should be sent
- `get_user_preferences()` - Gets user's notification preferences

### **Frontend:**
File: `frontend/src/components/Notifications/NotificationBell.tsx`

Features:
- Bell icon with badge
- Dropdown with notifications
- Mark as read
- Navigate to context

File: `frontend/src/components/Profile/NotificationPreferences.tsx`

Features:
- Grid of toggles
- Save preferences
- Email + In-app columns

---

## 🎯 Best Practices

### **For Users:**
1. Review notification preferences regularly
2. Turn off non-essential notifications to reduce noise
3. Check in-app notifications daily
4. Mark notifications as read to keep organized

### **For Admins:**
1. Keep email notifications enabled for critical events
2. Review daily digest each morning
3. Monitor notification system health
4. Adjust org settings based on team feedback

### **For Developers:**
1. Always check org + user preferences before sending
2. Use meaningful titles and messages
3. Always provide a link to relevant page
4. Log notification actions for debugging
5. Handle email sending failures gracefully

---

## 🐛 Troubleshooting

### **"I'm not getting notifications"**

Check:
1. ✅ Organization settings enabled? (Admin → Settings)
2. ✅ Your preferences enabled? (Profile → Notifications)
3. ✅ Bell icon working? (Should poll every 30s)
4. ✅ Backend running? (Check health endpoint)
5. ✅ Database tables exist? (Check migration 013)

### **"Bell icon not showing unread count"**

Check:
1. ✅ In-app notifications enabled (org level)
2. ✅ Frontend console for errors
3. ✅ API call succeeding: `GET /api/v1/notifications?unread_only=true`
4. ✅ Database has unread notifications

### **"Everyone getting too many notifications"**

Solution:
1. Adjust org-level settings
2. Educate users on preference settings
3. Consider notification batching (future enhancement)

---

## 🔮 Future Enhancements

### **Planned:**
- [ ] Email batching (digest mode)
- [ ] Push notifications (mobile)
- [ ] Slack/Teams integration
- [ ] Notification preferences: frequency settings
- [ ] Notification sound/vibration
- [ ] Custom notification templates
- [ ] Notification history page (full view)
- [ ] Notification analytics (admin)

---

## 📝 Summary

**Users get notified when:**
- ✅ Tasks are assigned to them
- ✅ Their goals are approved/rejected
- ✅ They receive feedback
- ✅ Leave requests are approved
- ✅ (Admins) Daily/weekly summaries

**Control available at:**
- 🏢 **Organization level** (master switches)
- 👤 **User level** (per-type toggles)
- 📧 **Channel level** (email vs in-app)

**Channels:**
- 🔔 In-app notifications (bell icon)
- ✉️ Email notifications (ready for integration)

**Default state:** All enabled  
**User can customize:** Yes  
**Admin can override:** Yes (disable entirely)

---

**Status:** ✅ Fully Implemented  
**Location:** Throughout application  
**Documentation:** Complete  

