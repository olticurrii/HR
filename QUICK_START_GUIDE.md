# 🚀 Employee Profile - Quick Start Guide

## ✅ What's Been Implemented

I've built a **complete Employee Profile system** matching the PeopleForce screenshot you provided, with:

### 🎯 Key Features

1. **Profile Header**
   - Avatar with online status indicator
   - Full name, role, and department
   - Previous/Next employee navigation arrows
   - Actions menu (admin only)

2. **Tab System**
   - Personal (view/edit contact info)
   - Job (role, manager, department, hire date)
   - **Performance** (the star of the show! ⭐)
     - **Objectives & OKRs** with progress tracking
     - **Reviews** (Manager, Self, Peer) with 1-5 ratings
     - **Competencies** with radar chart comparison
   - Workflows (tasks & projects)
   - Compensation, Time off, Time, More (placeholders for now)

3. **Performance Management**
   - Create objectives with key results
   - Track progress with weighted calculations
   - Submit and view performance reviews
   - Visualize competencies with radar charts
   - Multi-source feedback (Self/Manager/Peer)

4. **Security & Permissions**
   - Admin: Full access
   - Manager: Can view reports and submit manager reviews
   - Employee: Can view own profile and submit self reviews

## 🎬 How to Test

### Step 1: Login
1. Go to `http://localhost:3000`
2. Login with:
   - Email: `sarah.johnson@company.com`
   - Password: `password123`

### Step 2: Access Employee Profiles

**Option A - Direct URL:**
- Visit `http://localhost:3000/people/1` (Sarah Johnson)
- Visit `http://localhost:3000/people/2` (Michael Chen)
- Visit `http://localhost:3000/people/3` (David Kim)

**Option B - From Org Chart:**
1. Go to People → Org Chart
2. Click on any employee card
3. (Note: You'll need to add a link to profiles - I can help with that!)

### Step 3: Explore the Tabs

#### **Personal Tab**
- View email, phone, avatar
- Click "Edit" to update (if admin or viewing own profile)

#### **Job Tab**
- See role, department, manager
- Click manager's name to navigate to their profile

#### **Performance Tab → Objectives**
- See total progress bar at top
- Filter by Active/Closed/Archived
- Expand objectives to see key results
- **Try this**: Update a KR progress value and watch the objective progress recalculate!

#### **Performance Tab → Reviews**
- Click Manager/Self/Peer tabs
- See questions with ratings like "Good (4/5)"
- Read comments from reviewers

#### **Performance Tab → Competencies**
- Beautiful radar chart comparing Self vs Manager vs Peer scores
- Scroll down to see detailed scores table
- Check out the averages

#### **Workflows Tab**
- See assigned tasks and projects
- Status chips are color-coded
- Click items to navigate to task/project details

### Step 4: Test Permissions

**As Employee:**
1. Login as `emily.rodriguez@company.com` / `password123`
2. Go to `/people/4` (your own profile)
3. ✅ Can edit personal info
4. ✅ Can update KR progress
5. Try visiting `/people/1` → should show profile (if she reports to Sarah)

**As Admin:**
1. Login as Sarah Johnson
2. Visit any employee profile
3. ✅ Can see all tabs
4. ✅ Can edit personal info
5. ✅ See "Actions" button in header

## 📊 Sample Data Included

The system comes pre-loaded with:
- **3 employees** with objectives and KRs
- **2 objectives per employee** (e.g., "Improve Team Productivity")
- **3 key results per objective** with real progress
- **5 competencies**: Leadership, Communication, Technical Skills, Problem Solving, Teamwork
- **Competency scores** from Self, Manager, and Peer
- **Sample reviews** with ratings and comments
- **1 active review cycle** (Q1 2025)

## 🎨 UI Highlights

The design matches modern HR platforms:
- Clean, minimal white cards with subtle shadows
- Gradient progress bars (green for total, blue for individual)
- Color-coded status chips (green = done, blue = in progress, gray = open)
- Smooth hover effects
- Responsive layout
- Professional typography

## 🔗 API Endpoints

All available at `http://localhost:8000/docs`:

- `GET /api/v1/employees/{id}/profile_header`
- `GET /api/v1/employees/{id}/objectives`
- `PATCH /api/v1/employees/key_results/{id}` (update progress)
- `GET /api/v1/employees/{id}/reviews`
- `GET /api/v1/employees/{id}/competencies`
- `GET /api/v1/employees/{id}/workflows`
- ...and more!

## 🐛 If Something Goes Wrong

### Backend not running?
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend not running?
```bash
cd frontend
npm start
```

### Need to reset data?
```bash
cd backend
python seed_performance_data.py
```

### Getting 401 errors?
- Your token expired - just logout and login again
- The system now auto-redirects to login on 401

## 🎯 What's Next?

Want to enhance it further? Consider:

1. **Review Submission Form** - Let users submit new reviews from UI
2. **Objective Creation Form** - Create objectives without API calls
3. **Time Off Integration** - Connect to leave_requests table
4. **Time Tracking Tab** - Show clock-in/out data
5. **Documents Tab** - Upload/view employee documents
6. **Notifications** - Alert when reviews are submitted
7. **Export to PDF** - Download performance reports

## 💡 Pro Tips

1. **Prev/Next Navigation**: Use the arrow buttons in the header to browse through all employees alphabetically
2. **Progress Updates**: When you update a KR's current value, the progress auto-calculates and the objective progress updates too
3. **Filtering**: Use the status chips in Objectives to filter by Active/Closed/Archived
4. **Radar Chart**: The competencies radar chart updates dynamically based on scores
5. **Reviews**: Each review type (Manager/Self/Peer) has its own tab with counts

## 📸 Compare with Screenshot

Your PeopleForce screenshot features:
- ✅ Avatar + Name in header
- ✅ Tab navigation bar
- ✅ Workflows section with status chips ("Onboarding for a new hire", "Pending")
- ✅ Clean card-based layout
- ✅ Professional styling

Our implementation includes all of this PLUS:
- ✅ Full performance management system
- ✅ OKR tracking with progress bars
- ✅ Review system with ratings
- ✅ Competency radar charts
- ✅ Role-based access control

---

## 🎉 You're All Set!

Both servers are running and the system is ready to use. Visit `http://localhost:3000` and start exploring!

**Need help?** Just ask! 😊

