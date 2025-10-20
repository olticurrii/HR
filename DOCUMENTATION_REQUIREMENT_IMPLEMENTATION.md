# Require Daily Documentation - Implementation Guide

## Overview

Extended the organization settings to include a "Require Daily Documentation" toggle. When enabled, employees must submit a work summary when clocking out. The system shows a modal requiring non-empty text before completing clock-out.

## Implementation Summary

### ✅ Backend (FastAPI + SQLAlchemy)

#### 1. Database Migrations

**Migration 011**: Add `require_documentation` to organization settings
- **File**: `backend/migrations/011_add_require_documentation.sql`
- Adds `require_documentation BOOLEAN DEFAULT false` column

**Migration 012**: Add `work_summary` to time entries
- **File**: `backend/migrations/012_add_work_summary_to_time_entry.sql`
- Adds `work_summary TEXT NULL` column to store documentation

#### 2. Models Updated

**OrganizationSettings** (`backend/app/models/organization_settings.py`):
```python
require_documentation = Column(Boolean, nullable=False, default=False)
```

**TimeEntry** (`backend/app/models/time_entry.py`):
```python
work_summary = Column(Text, nullable=True)
```

#### 3. Schemas Updated

**File**: `backend/app/schemas/settings.py`
```python
class OrganizationSettingsBase(BaseModel):
    allow_breaks: bool
    require_documentation: bool  # Added

class OrganizationSettingsUpdate(BaseModel):
    allow_breaks: bool
    require_documentation: bool  # Added
```

#### 4. API Endpoints Updated

**Settings API** (`backend/app/api/settings.py`):
- `GET /api/v1/settings/org` - Returns `require_documentation`
- `PUT /api/v1/settings/org` - Updates `require_documentation` (Admin only)
- New helper: `check_documentation_required(db)` - Used by time tracking

**Time Tracking API** (`backend/app/api/time_tracking.py`):
- `POST /api/v1/time/clock-out` endpoint modified:
  - Accepts optional `work_summary` query parameter
  - Validates that `work_summary` is non-empty if `require_documentation=true`
  - Returns 400 error if documentation required but missing/empty

**Request Example**:
```python
POST /api/v1/time/clock-out?work_summary=Completed%20project%20tasks
```

**Validation**:
```python
if check_documentation_required(db):
    if not work_summary or not work_summary.strip():
        raise HTTPException(
            status_code=400,
            detail="Work summary is required when clocking out"
        )
```

#### 5. Service Layer Updated

**TimeTrackingService** (`backend/app/services/time_tracking_service.py`):
- `clock_out()` method now accepts `work_summary: Optional[str]`
- Stores `work_summary` in database if provided

```python
def clock_out(db: Session, user_id: int, work_summary: Optional[str] = None):
    # ... existing logic ...
    if work_summary:
        active_entry.work_summary = work_summary.strip()
    # ... save to database ...
```

### ✅ Frontend (React + TypeScript)

#### 1. Services Updated

**settingsService.ts**:
```typescript
export interface OrganizationSettings {
  id: number;
  allow_breaks: boolean;
  require_documentation: boolean;  // Added
  created_at: string;
  updated_at: string;
}
```

**timeTrackingService.ts**:
```typescript
clockOut: async (workSummary?: string): Promise<TimeEntry> => {
  const params = new URLSearchParams();
  if (workSummary) {
    params.append('work_summary', workSummary);
  }
  
  const response = await axios.post(
    `${API_BASE_URL}/clock-out?${params.toString()}`,
    null,
    { headers: getAuthHeaders() }
  );
  return response.data;
}
```

#### 2. Settings Page Enhanced

**File**: `frontend/src/pages/Settings/SettingsPage.tsx`

**New State**:
```typescript
const [requireDocumentation, setRequireDocumentation] = useState(false);
```

**New Toggle Switch**:
- Label: "Require Daily Documentation"
- Description: "When enabled, employees must submit a work summary when clocking out..."
- Status indicator showing "Documentation Required" or "Documentation Optional"
- Saves to `/api/v1/settings/org`

**UI Structure**:
```
Time Tracking Section:
├── Allow Employee Breaks (toggle)
│   └── Status: Breaks Enabled/Disabled
├── Divider
└── Require Daily Documentation (toggle)
    └── Status: Documentation Required/Optional
```

#### 3. Time Tracking Page Enhanced

**File**: `frontend/src/pages/TimeTracking/TimeTrackingPage.tsx`

**New State**:
```typescript
const [requireDocumentation, setRequireDocumentation] = useState(false);
const [showDocumentationModal, setShowDocumentationModal] = useState(false);
const [workSummary, setWorkSummary] = useState('');
```

**Clock-Out Flow**:
1. User clicks "Clock Out" button
2. **If `requireDocumentation = true`**:
   - Show documentation modal
   - User must enter work summary
   - Submit button disabled until text entered
   - Sends `work_summary` with clock-out request
3. **If `requireDocumentation = false`**:
   - Show standard confirmation modal
   - Clock out without documentation

**Documentation Modal**:
- Title: "Today's Work Summary"
- Textarea: "Describe what you accomplished today..."
- Cancel button: Closes modal
- Clock Out button: Disabled if empty, submits with documentation
- Error display if validation fails

## Usage Guide

### For Admins

#### Enable Documentation Requirement

1. Navigate to **Settings** page
2. Find **"Require Daily Documentation"** toggle
3. Toggle **ON**
4. Click **"Save Changes"**
5. Status shows: **"Documentation Required"**

#### Effects When Enabled

**Frontend**:
- Clock Out button triggers documentation modal
- Employees must type work summary (minimum 1 character)
- Empty submissions are blocked with error message

**Backend**:
- Validates `work_summary` parameter is non-empty
- Returns 400 if missing or empty
- Stores work summary in `time_entries.work_summary` column

#### Disable Documentation

1. Toggle **OFF** in Settings
2. Click **"Save Changes"**
3. Normal clock-out flow resumes (no modal)

### For Employees

#### When Documentation Required

1. Clock in and work normally
2. Click **"Clock Out"** button
3. **Modal appears**: "Today's Work Summary"
4. Type work summary (e.g., "Completed 3 customer tickets, started new feature development")
5. Click **"Clock Out"** button in modal
6. ✅ Clocked out with documentation saved

#### When Documentation Optional

- Standard clock-out flow (no modal)
- Work summary not required

## API Documentation

### GET /api/v1/settings/org

**Response**:
```json
{
  "id": 1,
  "allow_breaks": true,
  "require_documentation": true,
  "created_at": "2025-10-18T12:00:00Z",
  "updated_at": "2025-10-18T15:30:00Z"
}
```

### PUT /api/v1/settings/org

**Authentication**: Admin only

**Request**:
```json
{
  "allow_breaks": true,
  "require_documentation": true
}
```

**Response**:
```json
{
  "id": 1,
  "allow_breaks": true,
  "require_documentation": true,
  "created_at": "2025-10-18T12:00:00Z",
  "updated_at": "2025-10-18T16:00:00Z"
}
```

### POST /api/v1/time/clock-out

**Query Parameters**:
- `work_summary` (string, optional): Work documentation text

**Example**:
```bash
POST /api/v1/time/clock-out?work_summary=Completed%20daily%20tasks

# Response 200 OK
{
  "id": 123,
  "user_id": 5,
  "clock_in": "2025-10-18T09:00:00Z",
  "clock_out": "2025-10-18T17:00:00Z",
  "work_summary": "Completed daily tasks",
  ...
}
```

**Error Responses**:

When documentation required but missing:
```json
HTTP 400 Bad Request
{
  "detail": "Work summary is required when clocking out"
}
```

## Testing

### Manual Test Plan

#### Test 1: Enable Documentation Requirement

1. Login as admin
2. Go to **Settings**
3. Toggle **"Require Daily Documentation"** ON
4. Click **"Save Changes"**
5. ✅ Success message appears
6. Refresh page
7. ✅ Setting still ON (persisted)

#### Test 2: Modal Appears When Required

1. With documentation enabled
2. Login as employee
3. Go to **Time Tracking**
4. Clock in
5. Click **"Clock Out"**
6. ✅ Documentation modal appears
7. ✅ "Clock Out" button is disabled (empty textarea)

#### Test 3: Cannot Submit Empty Documentation

1. In documentation modal
2. Try clicking **"Clock Out"** without typing
3. ✅ Button remains disabled
4. Type text, then delete all
5. ✅ Button becomes disabled again

#### Test 4: Submit Documentation Successfully

1. In documentation modal
2. Type: "Completed project tasks and code review"
3. ✅ "Clock Out" button enabled
4. Click **"Clock Out"**
5. ✅ Successfully clocked out
6. ✅ Modal closes
7. ✅ Status shows "Not Working"

#### Test 5: Backend Validation

With documentation enabled, try:
```bash
curl -X POST http://localhost:8000/api/v1/time/clock-out \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: ✅ 400 error "Work summary is required"

With work summary:
```bash
curl -X POST "http://localhost:8000/api/v1/time/clock-out?work_summary=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: ✅ 200 OK, clocked out

#### Test 6: Disable Documentation

1. Go to Settings
2. Toggle **"Require Daily Documentation"** OFF
3. Save
4. Go to Time Tracking
5. Click **"Clock Out"**
6. ✅ Normal confirmation modal (not documentation modal)
7. ✅ Can clock out without documentation

#### Test 7: Documentation Persists in Database

1. Clock out with documentation
2. Check database:
```sql
SELECT work_summary FROM time_entries 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 1;
```
3. ✅ Work summary stored correctly

## Files Created/Modified

### Backend Files

**Created**:
1. `backend/migrations/011_add_require_documentation.sql`
2. `backend/run_migration_011.py`
3. `backend/migrations/012_add_work_summary_to_time_entry.sql`
4. `backend/run_migration_012.py`

**Modified**:
1. `backend/app/models/organization_settings.py` - Added `require_documentation`
2. `backend/app/models/time_entry.py` - Added `work_summary`
3. `backend/app/schemas/settings.py` - Updated schemas
4. `backend/app/api/settings.py` - Added helper function
5. `backend/app/api/time_tracking.py` - Added validation
6. `backend/app/services/time_tracking_service.py` - Accept and store work_summary

### Frontend Files

**Modified**:
1. `frontend/src/services/settingsService.ts` - Added `require_documentation`
2. `frontend/src/services/timeTrackingService.ts` - Accept `workSummary` parameter
3. `frontend/src/pages/Settings/SettingsPage.tsx` - Added toggle and UI
4. `frontend/src/pages/TimeTracking/TimeTrackingPage.tsx` - Added modal and logic

## Architecture Decisions

### Why Store in time_entries Table?

- Keeps work documentation with the time entry it describes
- Easy to query work history with documentation
- Supports future reporting/analytics features

### Why Optional Parameter?

- Backwards compatibility
- Admin can toggle without breaking existing functionality
- Documentation only required when setting enabled

### Why Modal Instead of Inline Form?

- **Focus**: Forces attention on documentation
- **Validation**: Clear feedback before submission
- **UX**: Prevents accidental clock-outs without docs
- **Visibility**: Obvious requirement to users

### Why Query Parameter vs Request Body?

- FastAPI's automatic form handling
- Simpler than multipart/form-data
- Compatible with existing endpoint signature
- Easy to test with curl/Postman

## Future Enhancements

Potential additions:

- [ ] **Character minimum**: Require N characters (e.g., 20+)
- [ ] **Template prompts**: Pre-fill with questions like "What did you accomplish?"
- [ ] **Department-specific**: Different requirements per department
- [ ] **Review workflow**: Managers can review/approve documentation
- [ ] **Export reports**: Download all work summaries as CSV/PDF
- [ ] **AI summarization**: Auto-generate summaries from task logs
- [ ] **Recurring tasks**: Pre-fill common activities
- [ ] **Rich text editor**: Support formatting, lists, links
- [ ] **Attachments**: Allow uploading files/screenshots
- [ ] **Daily digest**: Email summaries to managers

## Troubleshooting

### Issue: Modal doesn't appear when enabled

**Solution**:
1. Check browser console for errors
2. Verify settings loaded: inspect `requireDocumentation` state
3. Hard refresh (Ctrl+Shift+R)
4. Check API response from `/api/v1/settings/org`

### Issue: Can submit empty documentation

**Solution**:
1. Check backend validation in `time_tracking.py`
2. Ensure frontend sends `work_summary` parameter
3. Verify `require_documentation` is `true` in database

### Issue: 400 error "Work summary is required" when disabled

**Solution**:
1. Check `/api/v1/settings/org` returns `require_documentation: false`
2. Restart backend server
3. Clear browser cache
4. Verify database value: `SELECT require_documentation FROM organization_settings WHERE id = 1;`

### Issue: Documentation not saving

**Solution**:
1. Check migration 012 ran successfully
2. Verify `work_summary` column exists in `time_entries` table
3. Check backend logs for errors
4. Test direct API call with curl

## Security Considerations

- ✅ Only admins can change settings
- ✅ Backend validates documentation requirement
- ✅ Cannot bypass via direct API calls
- ✅ Input sanitized (`.strip()` removes whitespace)
- ✅ SQL injection protected (parameterized queries)
- ✅ XSS protected (React auto-escapes)

## Performance Impact

- **Minimal**: One extra setting check per clock-out
- **Storage**: ~100-500 bytes per documentation entry
- **Network**: Slightly larger payload (documentation text)
- **No caching needed**: Setting checked on-demand

## Database Schema

### organization_settings

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| require_documentation | BOOLEAN | FALSE | If true, require work summary on clock-out |

### time_entries

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| work_summary | TEXT | NULL | Employee's work documentation for the day |

## Data Examples

### Sample Work Summaries

```
"Completed 5 support tickets, started development on new dashboard feature"

"Attended team meeting, reviewed code for PR #123, fixed production bug"

"Customer onboarding calls (3), updated documentation, replied to emails"

"Research for project X, drafted proposal, presented to stakeholders"
```

### Query Examples

**Get all documented entries for a user**:
```sql
SELECT clock_in, clock_out, work_summary 
FROM time_entries 
WHERE user_id = 5 AND work_summary IS NOT NULL
ORDER BY clock_in DESC;
```

**Find entries without documentation (when required)**:
```sql
SELECT te.*, u.full_name
FROM time_entries te
JOIN users u ON te.user_id = u.id
WHERE te.clock_out IS NOT NULL 
  AND te.work_summary IS NULL
  AND te.created_at > '2025-10-18'
ORDER BY te.created_at DESC;
```

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Date**: October 18, 2025  
**Migrations**: 011, 012  
**Dependencies**: Requires Break Settings (Migration 010)

