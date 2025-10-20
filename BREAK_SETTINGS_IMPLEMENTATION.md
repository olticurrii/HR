# Break Settings Implementation - Complete Guide

## Overview

Implemented an admin-only Settings feature that allows administrators to enable/disable employee breaks in the Time Tracking system. When breaks are disabled, break controls are hidden from employees and break API endpoints return 403 Forbidden.

## Implementation Summary

### ✅ Backend (FastAPI + SQLAlchemy)

#### 1. Database
- **Migration**: `010_create_organization_settings.sql`
- **Table**: `organization_settings`
  - `id`: Primary key (always 1 for single organization)
  - `allow_breaks`: Boolean (default: TRUE)
  - `created_at`, `updated_at`: Timestamps

#### 2. Model
- **File**: `backend/app/models/organization_settings.py`
- `OrganizationSettings` model with SQLAlchemy

#### 3. Schemas
- **File**: `backend/app/schemas/settings.py`
- `OrganizationSettingsResponse`: Read model
- `OrganizationSettingsUpdate`: Update model

#### 4. API Endpoints
- **File**: `backend/app/api/settings.py`

```python
GET  /api/v1/settings/org         # Get settings (all authenticated users)
PUT  /api/v1/settings/org         # Update settings (Admin only)
```

**Helper Function**:
```python
check_breaks_allowed(db: Session) -> bool  # Used by time tracking endpoints
```

#### 5. Break Endpoint Guards
- **File**: `backend/app/api/time_tracking.py`
- Modified endpoints:
  - `POST /api/v1/time/start-break` - Returns 403 if breaks disabled
  - `POST /api/v1/time/end-break` - Returns 403 if breaks disabled

#### 6. Registration
- Model registered in `backend/app/models/__init__.py`
- Router registered in `backend/app/main.py`

### ✅ Frontend (React + TypeScript)

#### 1. Service
- **File**: `frontend/src/services/settingsService.ts`
- Functions:
  - `getOrgSettings()`: Fetch current settings
  - `updateOrgSettings(data)`: Update settings (admin only)

#### 2. Settings Page
- **File**: `frontend/src/pages/Settings/SettingsPage.tsx`
- **Route**: `/settings` (Admin only)
- Features:
  - Toggle switch for "Allow employee breaks"
  - Real-time status indicator (Enabled/Disabled)
  - Save button (only enabled when changes detected)
  - Success/error notifications
  - Settings persist across page reloads

#### 3. Time Tracking Page
- **File**: `frontend/src/pages/TimeTracking/TimeTrackingPage.tsx`
- Features:
  - Fetches `allow_breaks` setting on mount
  - **When `allowBreaks = true`**:
    - Shows "Start Break" and "End Break" buttons normally
  - **When `allowBreaks = false`**:
    - Hides break buttons
    - Shows message: "Breaks disabled by admin" with Ban icon
    - Break status card still visible but shows "Active" state

## Usage Guide

### For Admins

#### Enable/Disable Breaks

1. Navigate to **Settings** page (only visible to admins in sidebar)
2. Find **Time Tracking** section
3. Toggle **"Allow Employee Breaks"** switch
4. Click **"Save Changes"** button
5. Status indicator updates to show:
   - ✅ **Breaks Enabled**: Employees can start/end breaks
   - ❌ **Breaks Disabled**: Break controls hidden, endpoints return 403

#### Effects When Disabled

- **Frontend**:
  - Break buttons replaced with "Breaks disabled by admin" message
  - Employees cannot see or access break controls
  
- **Backend**:
  - `/api/v1/time/start-break` → 403 Forbidden
  - `/api/v1/time/end-break` → 403 Forbidden
  - Error message: "Breaks are currently disabled by organization settings"

### For Employees

- When breaks are **enabled**: Normal break functionality
- When breaks are **disabled**: 
  - Break buttons hidden
  - Clear message explaining breaks are disabled
  - No ability to start/end breaks

## API Documentation

### GET /api/v1/settings/org

**Authentication**: Required (any user)

**Response**:
```json
{
  "id": 1,
  "allow_breaks": true,
  "created_at": "2025-10-18T12:00:00Z",
  "updated_at": "2025-10-18T12:00:00Z"
}
```

### PUT /api/v1/settings/org

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "allow_breaks": false
}
```

**Response**:
```json
{
  "id": 1,
  "allow_breaks": false,
  "created_at": "2025-10-18T12:00:00Z",
  "updated_at": "2025-10-18T15:30:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin

### POST /api/v1/time/start-break

**Response when breaks disabled**:
```json
HTTP 403 Forbidden
{
  "detail": "Breaks are currently disabled by organization settings"
}
```

### POST /api/v1/time/end-break

**Response when breaks disabled**:
```json
HTTP 403 Forbidden
{
  "detail": "Breaks are currently disabled by organization settings"
}
```

## Testing

### Manual Testing

#### Test 1: Enable/Disable Toggle

1. Login as admin
2. Go to Settings page
3. Toggle "Allow employee breaks" OFF
4. Click "Save Changes"
5. ✅ Success message appears
6. Refresh page
7. ✅ Setting persists (still OFF)

#### Test 2: Break Controls Hidden

1. With breaks disabled (from Test 1)
2. Go to Time Tracking page
3. Clock in
4. ✅ Break buttons replaced with "Breaks disabled by admin" message

#### Test 3: API Returns 403

1. With breaks disabled
2. Try to call break endpoint directly:
```bash
curl -X POST http://localhost:8000/api/v1/time/start-break \
  -H "Authorization: Bearer YOUR_TOKEN"
```
3. ✅ Returns 403 with error message

#### Test 4: Re-enable Breaks

1. Go back to Settings
2. Toggle "Allow employee breaks" ON
3. Click "Save Changes"
4. Go to Time Tracking
5. ✅ Break buttons visible again
6. ✅ Can start/end breaks normally

### Backend Tests

Run migration:
```bash
cd backend
python run_migration_010.py
```

Expected output:
```
✓ Migration 010 completed successfully!
✓ Organization settings table created with default values
```

## Files Created/Modified

### Backend Files

**Created**:
1. `backend/migrations/010_create_organization_settings.sql`
2. `backend/run_migration_010.py`
3. `backend/app/models/organization_settings.py`
4. `backend/app/schemas/settings.py`
5. `backend/app/api/settings.py`

**Modified**:
1. `backend/app/api/time_tracking.py` - Added break guards
2. `backend/app/models/__init__.py` - Registered OrganizationSettings
3. `backend/app/main.py` - Registered settings router

### Frontend Files

**Created**:
1. `frontend/src/services/settingsService.ts`

**Modified**:
1. `frontend/src/pages/Settings/SettingsPage.tsx` - Complete rewrite with toggle
2. `frontend/src/pages/TimeTracking/TimeTrackingPage.tsx` - Added break control logic

## Architecture Decisions

### Why Single Settings Row?

- Organization has one set of settings
- ID always = 1 for simplicity
- Easy to query and update
- Supports future settings expansion

### Why Check on Frontend AND Backend?

- **Frontend**: Better UX - hide controls immediately
- **Backend**: Security - prevent API abuse/direct calls
- **Both**: Defense in depth

### Why `allow_breaks` Defaults to TRUE?

- Backwards compatibility
- Less disruptive to existing users
- Admin opts-in to restriction

### Why Settings Available to All Users (GET)?

- Employees need to know if breaks are allowed
- Avoids confusion when buttons disappear
- Only UPDATE is admin-restricted

## Future Enhancements

Potential additions to settings:

- [ ] Break duration limits (min/max minutes)
- [ ] Maximum breaks per day
- [ ] Break time windows (only during certain hours)
- [ ] Different break policies per department
- [ ] Break approval workflow
- [ ] Overtime settings
- [ ] Work schedule templates
- [ ] Holiday calendars
- [ ] Notification preferences

## Troubleshooting

### Issue: Settings page shows "Failed to load settings"

**Solution**: 
1. Check backend is running
2. Verify migration ran: `python run_migration_010.py`
3. Check database has organization_settings table

### Issue: Break buttons still showing when disabled

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check console for errors
3. Verify settings API returns `allow_breaks: false`

### Issue: 403 error when breaks should be allowed

**Solution**:
1. Check settings value: `GET /api/v1/settings/org`
2. Verify `allow_breaks` is `true`
3. Restart backend server

## Security Considerations

- ✅ Only admins can update settings
- ✅ Break endpoints check settings before processing
- ✅ Settings fetch doesn't expose sensitive data
- ✅ 403 errors don't expose internal logic
- ✅ No way to bypass settings check

## Performance Impact

- **Minimal**: One extra DB query per break action
- Settings query is fast (primary key lookup)
- Could add caching if needed (not necessary for current scale)

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Date**: October 18, 2025  
**Migration**: 010_create_organization_settings.sql

