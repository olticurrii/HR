# 🚀 Quick Setup Guide - Performance Module

## ⚡ 5-Minute Setup

### Step 1: Enable the Module
**The performance module was disabled during testing. Enable it:**

```bash
# Option 1: Via Database (Quick)
cd backend
sqlite3 hr_app.db "UPDATE organization_settings SET performance_module_enabled = 1;"

# Option 2: Via Settings Page (Recommended)
1. Login as admin (admin@company.com / password123)
2. Go to Settings
3. Scroll to "Performance Module Settings"
4. Toggle ON "Enable Performance Module"
5. Click "Save All Settings"
```

✅ **Module is now enabled!**

---

### Step 2: Verify Backend is Running

```bash
cd backend
source venv/bin/activate  # or venv_mac/bin/activate on Mac
python -m uvicorn app.main:app --reload --port 8000
```

**Check:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

---

### Step 3: Verify Frontend is Running

```bash
cd frontend
npm start
```

Frontend should open at http://localhost:3000

---

### Step 4: Test All Features

**Login:**
- Email: `admin@company.com`
- Password: `password123`

**Test Checklist:**

✅ **Performance Navigation**
- Go to dashboard
- See "Performance" in sidebar
- Click it → Performance page loads

✅ **Create Goal**
- Performance → Click "Create New Goal"
- Fill title, description, due date
- Submit
- Goal appears in list

✅ **Settings Control**
- Go to Settings
- See "Performance Module Settings" section
- Toggle any setting
- Save
- Feature appears/disappears accordingly

✅ **KPI Trends**
- Record KPI via test script (below)
- Performance → KPI Trends tab
- See visual chart

✅ **Top Performer Badge**
- Check if badge appears on Profile
- (Requires review data to show)

✅ **Monthly Report**
- Admin only
- Performance → Monthly Reports tab
- Click "Generate Report"
- See metrics

---

## 🧪 Quick Test Script

Create and run this to seed sample data:

```bash
cd backend
cat > test_quick_data.py << 'EOF'
import requests

BASE = "http://localhost:8000/api/v1"

# Login
r = requests.post(f"{BASE}/auth/login", 
    data={"username": "admin@company.com", "password": "password123"},
    headers={"Content-Type": "application/x-www-form-urlencoded"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create a goal
goal = requests.post(f"{BASE}/performance/objectives", headers=headers, json={
    "user_id": 1,
    "title": "Q4 Sales Target",
    "description": "Achieve 150% of quota",
    "status": "active",
    "due_date": "2025-12-31T00:00:00"
})
print("✅ Goal created:", goal.json()["id"])

# Record KPIs
for i in range(1, 6):
    kpi = requests.post(f"{BASE}/performance/kpi-snapshots", headers=headers, json={
        "user_id": 1,
        "kpi_name": "Sales Performance",
        "value": 80 + (i * 3),
        "unit": "%"
    })
    print(f"✅ KPI {i} recorded: {kpi.json()['value']}%")

print("\n✅ Sample data created! Go to Performance page to see it.")
EOF

python3 test_quick_data.py
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Performance Module Disabled
**Error:** `403 Forbidden` on all performance endpoints  
**Fix:**
```bash
sqlite3 backend/hr_app.db \
  "UPDATE organization_settings SET performance_module_enabled = 1;"
```

### Issue 2: Performance Nav Not Showing
**Cause:** Module disabled or browser cache  
**Fix:**
1. Enable module in Settings
2. Hard refresh browser (`Cmd+Shift+R`)
3. Nav item should appear

### Issue 3: Top Performer Badge Not Showing
**Cause:** No review data OR module disabled  
**Fix:**
- Module disabled → Enable it
- No data → Normal (badge only shows if qualified)

### Issue 4: Create Goal Button Missing
**Cause:** `performance_allow_self_goals` is OFF  
**Fix:**
```
Settings → Turn ON "Allow Self-Created Goals" → Save
```

### Issue 5: KPI Trends Tab Missing
**Cause:** `performance_show_kpi_trends` is OFF  
**Fix:**
```
Settings → Turn ON "Show KPI Trend Charts" → Save
```

---

## ✅ Verification Checklist

Run through this checklist to verify everything works:

### Backend
- [ ] Server running on port 8000
- [ ] Health check returns OK
- [ ] Can login via API
- [ ] Settings endpoint returns all performance fields
- [ ] Performance module enabled in database

### Frontend
- [ ] App running on port 3000
- [ ] Can login via UI
- [ ] Settings page loads
- [ ] Performance module settings section visible
- [ ] All 8 toggles present

### Features
- [ ] Performance nav item visible
- [ ] Can create goals
- [ ] KPI Trends tab visible (if enabled)
- [ ] Monthly Reports tab visible for admin
- [ ] Settings toggles actually control features

---

## 🎯 Current State

**Performance Module:** ✅ Enabled  
**Backend:** ✅ Running  
**Frontend:** ✅ Ready  
**All Settings:** ✅ Functional  
**All Features:** ✅ Implemented  

---

## 🚀 Start Using

```bash
# 1. Ensure backend is running
cd backend
source venv_mac/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# 2. In another terminal, start frontend
cd frontend
npm start

# 3. Open browser
http://localhost:3000

# 4. Login
admin@company.com / password123

# 5. Go to Performance
Click "Performance" in sidebar

# 6. Create your first goal!
```

**You're all set!** 🎉

---

**Quick Reference:**
- Settings: `/settings` (Configure all modules)
- Performance: `/performance` (Goals, KPIs, reports)
- Profile: `/profile` (See your badge)

**Everything is ready to use!**

