# Feedback Module - Complete Implementation Guide

## Overview

The Feedback Module is a comprehensive system that allows employees to submit feedback to specific users, admins, or everyone in the company. It includes sentiment analysis, keyword extraction, and admin insights with trend visualization.

## Features

### ✨ Core Features

1. **Multiple Recipient Types**
   - **To Specific User**: Send feedback to a specific employee
   - **To Admin**: Send feedback directly to administrators
   - **To Everyone**: Company-wide broadcasts visible to all employees

2. **Anonymous Feedback**
   - Employees can choose to send feedback anonymously
   - Anonymous authors appear as "Anonymous" to non-admin users
   - Admins can always see the true author (for accountability)
   - Authors can always see their own feedback

3. **Sentiment Analysis**
   - Automatic sentiment detection (Positive, Neutral, Negative)
   - Uses vaderSentiment library for accurate analysis
   - Fallback to rule-based analysis if library unavailable
   - Sentiment scores range from -1 (most negative) to +1 (most positive)

4. **Keyword Extraction**
   - Automatic extraction of top 5 keywords from feedback
   - Stopword filtering for meaningful keywords
   - Basic profanity filtering
   - Displayed with each feedback item

5. **Admin Insights Dashboard**
   - Sentiment distribution (pie chart and percentages)
   - Feedback trends over time (line charts)
   - Top keywords by frequency (bar chart)
   - Average sentiment trends
   - Top feedback recipients
   - Customizable time windows (7, 30, 90, 180, 365 days)

## Backend Implementation

### Database Schema

```sql
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    recipient_type VARCHAR(10) NOT NULL CHECK (recipient_type IN ('USER', 'ADMIN', 'EVERYONE')),
    recipient_id INTEGER,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT 0,
    sentiment_label VARCHAR(10) CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
    sentiment_score REAL,
    keywords TEXT,  -- JSON stored as TEXT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE SET NULL
);
```

### API Endpoints

#### 1. Create Feedback
```
POST /api/v1/feedback
```

**Request Body:**
```json
{
  "content": "Great work on the project!",
  "is_anonymous": false,
  "recipient_type": "USER",  // or "ADMIN" or "EVERYONE"
  "recipient_id": 5  // required only if recipient_type is "USER"
}
```

**Response:**
```json
{
  "id": 1,
  "content": "Great work on the project!",
  "is_anonymous": false,
  "recipient_type": "USER",
  "recipient_id": 5,
  "created_at": "2025-10-18T10:30:00Z",
  "sentiment_label": "positive",
  "sentiment_score": 0.85,
  "keywords": ["great", "work", "project"],
  "author": {
    "id": 3,
    "full_name": "John Doe"
  },
  "author_display": "John Doe"
}
```

#### 2. Get Received Feedback
```
GET /api/v1/feedback/my?skip=0&limit=50
```

Returns feedback addressed to the current user:
- Feedback with `recipient_type=USER` and `recipient_id=<my_id>`
- Feedback with `recipient_type=EVERYONE` (broadcasts)
- Feedback with `recipient_type=ADMIN` (if user is admin)

#### 3. Get Sent Feedback
```
GET /api/v1/feedback/sent?skip=0&limit=50
```

Returns all feedback authored by the current user.

#### 4. Get All Feedback (Admin Only)
```
GET /api/v1/admin/feedback?recipient_type=USER&start_date=2025-01-01&skip=0&limit=100
```

**Query Parameters:**
- `recipient_type`: Filter by USER, ADMIN, or EVERYONE
- `recipient_id`: Filter by specific recipient
- `start_date`: Filter by start date (ISO format)
- `end_date`: Filter by end date (ISO format)
- `skip`: Pagination offset
- `limit`: Number of items per page

#### 5. Get Insights (Admin Only)
```
GET /api/v1/admin/feedback/insights?window_days=30
```

**Query Parameters:**
- `window_days`: Time window in days (default: 30, max: 365)

**Response:**
```json
{
  "sentiment": {
    "positive": 45,
    "neutral": 30,
    "negative": 25,
    "total": 100,
    "positive_pct": 45.0,
    "neutral_pct": 30.0,
    "negative_pct": 25.0
  },
  "keywords": [
    {"term": "project", "count": 23},
    {"term": "team", "count": 18},
    {"term": "communication", "count": 15}
  ],
  "trend": [
    {"date": "2025-10-01", "count": 5, "avg_sentiment": 0.45},
    {"date": "2025-10-02", "count": 8, "avg_sentiment": 0.62}
  ],
  "recipients": [
    {"id": 5, "name": "Jane Smith", "count": 12, "recipient_type": "USER"},
    {"id": null, "name": "Everyone", "count": 35, "recipient_type": "EVERYONE"}
  ],
  "total_feedback": 100,
  "window_days": 30
}
```

## Frontend Implementation

### Pages

1. **FeedbackPage** (`/feedback`)
   - Create new feedback form
   - View received feedback (tab)
   - View sent feedback (tab)
   - View all feedback (admin tab)
   - Link to insights dashboard (admin)

2. **InsightsPage** (`/feedback/insights`)
   - Admin-only page
   - Sentiment distribution charts
   - Feedback trends over time
   - Top keywords visualization
   - Top recipients table
   - Time period selector

### Components

#### Feedback Form Features
- Recipient type selector (Everyone/Admin/Specific User)
- User dropdown (when "Specific User" selected)
- Rich text area for feedback content
- Anonymous checkbox with explanation
- Real-time validation
- Success/error notifications

#### Feedback Card Display
- Author information (masked if anonymous)
- Sentiment indicator with color coding
- Feedback content
- Recipient information
- Creation date
- Top keywords as tags

### Styling

- Uses Tailwind CSS for consistent styling
- Responsive design for mobile and desktop
- Color-coded sentiment indicators:
  - 🟢 Positive: Green (#10B981)
  - ⚪ Neutral: Gray (#6B7280)
  - 🔴 Negative: Red (#EF4444)

## Usage Examples

### Employee Use Cases

#### 1. Send Anonymous Feedback to Admin
```
1. Navigate to /feedback
2. Select "Admin" recipient type
3. Write your feedback
4. Check "Send anonymously"
5. Click "Send Feedback"
```

#### 2. Send Feedback to Specific Team Member
```
1. Navigate to /feedback
2. Select "Specific User" recipient type
3. Choose user from dropdown
4. Write your feedback
5. Click "Send Feedback"
```

#### 3. Share Company-Wide Appreciation
```
1. Navigate to /feedback
2. Select "Everyone" recipient type
3. Write your message
4. Click "Send Feedback"
```

### Admin Use Cases

#### 1. View All Feedback
```
1. Navigate to /feedback
2. Click "All Feedback" tab
3. See all feedback with full author visibility
4. Filter by date, type, or recipient
```

#### 2. Analyze Feedback Trends
```
1. Navigate to /feedback
2. Click "Insights" tab (or go to /feedback/insights)
3. Select time period (7, 30, 90, 180, or 365 days)
4. Review:
   - Sentiment distribution
   - Feedback volume trends
   - Common keywords
   - Average sentiment over time
   - Top recipients
```

## Sentiment Analysis

### How It Works

1. **Primary Method: vaderSentiment**
   - Industry-standard sentiment analysis library
   - Optimized for social media and short text
   - Accounts for:
     - Punctuation (!!!, ???)
     - Capitalization (AMAZING)
     - Emoticons and emojis
     - Negations (not good)
     - Degree modifiers (very, extremely)

2. **Fallback: Rule-Based**
   - Used if vaderSentiment unavailable
   - Counts positive and negative words
   - Simple but effective for basic analysis

### Sentiment Thresholds
- **Positive**: score > 0.2
- **Neutral**: -0.2 ≤ score ≤ 0.2
- **Negative**: score < -0.2

## Privacy & Security

### Author Masking Rules

1. **Anonymous Feedback:**
   - Non-admin users see "Anonymous" as author
   - Admin users see true author
   - Original author always sees themselves

2. **Non-Anonymous Feedback:**
   - All users see the true author

3. **Data Retention:**
   - Author information always stored (for accountability)
   - Masking is display-only (not database-level)

### Permissions

- **All Users:** Can create and view their feedback
- **Admin Users:** Can view all feedback and access insights

## Installation & Setup

### 1. Backend Setup

```bash
# Install dependencies
cd backend
source venv/bin/activate  # or venv_mac/bin/activate on Mac
pip install vaderSentiment

# Run migration
python run_migration_009.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Dependencies already in package.json
cd frontend
npm install  # if needed

# Start development server
npm start
```

### 3. Verify Installation

1. Backend: Visit http://localhost:8000/docs
   - Check for `/feedback` endpoints
   - Check for `/admin/feedback/insights` endpoint

2. Frontend: Visit http://localhost:3000/feedback
   - Should see the feedback form
   - Admins should see additional tabs

## Testing

### Manual Test Scenarios

#### Test 1: Create Feedback to Everyone
```bash
curl -X POST http://localhost:8000/api/v1/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great company culture!",
    "is_anonymous": false,
    "recipient_type": "EVERYONE"
  }'
```

#### Test 2: Get My Feedback
```bash
curl http://localhost:8000/api/v1/feedback/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test 3: Admin Insights
```bash
curl http://localhost:8000/api/v1/admin/feedback/insights?window_days=30 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Troubleshooting

### Issue: "Nothing shows up on feedback page"

**Solution:**
1. Ensure backend server is running on port 8000
2. Check browser console for API errors
3. Verify authentication token is valid
4. Ensure migration 009 was run successfully

### Issue: Sentiment analysis not working

**Solution:**
1. Verify vaderSentiment is installed: `pip list | grep vader`
2. If not installed: `pip install vaderSentiment`
3. Restart backend server

### Issue: Charts not rendering

**Solution:**
1. Verify recharts is installed: Check `package.json`
2. Clear browser cache
3. Check for JavaScript console errors

### Issue: Anonymous feedback shows author

**Solution:**
1. Verify user is not an admin (admins always see authors)
2. Check that viewer is not the author (authors see themselves)
3. Check API response for proper masking

## Future Enhancements

### Planned Features
- [ ] Real-time notifications (WebSocket/SSE)
- [ ] Feedback responses/threads
- [ ] Emoji reactions to feedback
- [ ] Export feedback to CSV/PDF
- [ ] Advanced sentiment analysis (emotions)
- [ ] Department-level analytics
- [ ] Feedback categories/tags
- [ ] Rate limiting to prevent spam
- [ ] Email notifications
- [ ] Mobile app support

### Nice-to-Have
- [ ] AI-powered feedback suggestions
- [ ] Feedback templates
- [ ] Scheduled feedback reminders
- [ ] Integration with performance reviews
- [ ] Anonymous feedback verification
- [ ] Feedback search and filtering
- [ ] Bulk operations

## Support

For issues or questions:
1. Check this guide first
2. Review API documentation at http://localhost:8000/docs
3. Check server logs for error messages
4. Verify all dependencies are installed

## Credits

- **Sentiment Analysis:** vaderSentiment library
- **Charts:** Recharts library
- **Icons:** Lucide React
- **Framework:** FastAPI + React + TypeScript

---

**Version:** 1.0.0  
**Last Updated:** October 18, 2025  
**Status:** ✅ Production Ready

