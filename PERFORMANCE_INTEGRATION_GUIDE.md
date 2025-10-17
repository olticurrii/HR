# 🎯 Performance Integration with Tasks & Projects

## Overview

The employee profile performance system is now **fully integrated with tasks and projects**. Performance metrics are automatically calculated based on real work activity!

## 🔗 How It Works

### 1. **Auto-Calculated Metrics**

When you open an employee's profile and click **Performance → Summary**, the system automatically calculates:

- **Task Completion Rate** - % of tasks completed
- **On-Time Completion Rate** - % of tasks completed before deadline
- **Overdue Tasks** - Number of tasks past due date
- **Project Involvement** - Number of projects participating in
- **Overall Performance Score (0-100)** - Weighted calculation:
  - 60% from task completion rate
  - 20% from on-time completion
  - 20% from project involvement

### 2. **Real-Time Insights**

The system provides intelligent insights like:
- ✅ "Excellent Task Completion - You've completed 85% of your tasks this month!"
- ⚠️ "You have 3 overdue tasks - Consider addressing these first"
- 📊 "Good Progress - Keep pushing to reach 80%!"

### 3. **Task-to-Objective Linking** (Future Enhancement)

You can link tasks to specific objectives:
- When tasks are completed, the objective progress auto-updates
- Example: If an objective has 10 linked tasks and 7 are done → 70% progress

## 📊 What's Been Added

### Backend

**New Database Tables:**
- `performance_metrics` - Stores calculated performance stats by period
- `task_completion_history` - Tracks when tasks are completed
- Added `objective_id` column to `tasks` table for linking
- Added `objective_id` column to `projects` table for linking

**New API Endpoints:**
- `GET /api/v1/employees/{id}/performance_metrics?days=30`
  - Returns task metrics, project metrics, overall score, and insights
- `POST /api/v1/employees/{id}/link_task_to_objective`
  - Links a task to an objective

**New Service:**
- `PerformanceCalculator` class calculates all metrics from tasks/projects

### Frontend

**New Component:**
- `PerformanceSummary.tsx` - Beautiful dashboard showing:
  - Overall performance score (0-100) with gradient card
  - Period selector (Last 7/30/90 days)
  - Task performance cards (Total, Completed, In Progress, Overdue)
  - Completion rate progress bars
  - On-time completion tracking
  - Project involvement stats
  - AI-generated insights with icons

**Updated Components:**
- `PerformanceTab.tsx` - Now has "Summary" as the first tab
- Tab order: **Summary** | Objectives | Reviews | Competencies

## 🎯 How to Use It

### For Employees:

1. **Go to your profile** or any employee's profile
2. Click **"Performance"** tab
3. Click **"Summary"** sub-tab
4. See your real-time performance metrics!

**What you'll see:**
- Your overall score (e.g., "87/100")
- How many tasks you've completed this month
- Your completion rate and on-time rate
- Number of overdue tasks
- Projects you're involved in
- Personalized insights and recommendations

### For Managers:

1. **Click on any employee** in the Org Chart
2. Navigate to their **Performance → Summary**
3. See their task and project performance
4. Use insights to provide feedback
5. Track performance over 7, 30, or 90 days

### Improving Your Score:

To get a higher performance score:
- ✅ Complete more tasks (increases completion rate)
- ⏰ Finish tasks before deadline (increases on-time rate)
- 📋 Stay involved in projects
- 🚫 Avoid overdue tasks

## 📈 Score Calculation Formula

```
Overall Score = 
  (Task Completion Rate × 0.6) +
  (On-Time Completion Rate × 0.2) +
  (Project Involvement Score × 0.2)
```

**Example:**
- 80% task completion → 48 points
- 90% on-time completion → 18 points
- 5 project tasks → 10 points (capped at 20)
- **Total: 76/100**

## 🎨 Visual Features

- **Gradient Score Card** - Purple/blue gradient with large score display
- **Color-Coded Metrics**:
  - Green (80-100%): Excellent
  - Blue (60-79%): Good
  - Yellow (40-59%): Needs Improvement
  - Red (<40%): Urgent Attention
- **Progress Bars** - Animated with smooth transitions
- **Insight Cards** - Color-coded by type (positive/warning/neutral)
- **Icons** - Checkmark for positive, alert for warnings, trending for neutral

## 🔄 Data Flow

```
1. Employee completes a task in Tasks page
   ↓
2. Task status changes to "Completed"
   ↓
3. Next time Performance page loads:
   - PerformanceCalculator queries last 30 days of tasks
   - Calculates completion rate, on-time rate, etc.
   - Generates insights based on patterns
   ↓
4. Displays real-time metrics in Summary tab
```

## 🚀 Future Enhancements

**Already Built (Just Need UI):**
- Link tasks to objectives via API
- Auto-update objective progress when linked tasks complete
- Track task quality scores (1-5 rating)

**Possible Additions:**
- Performance trends (line charts over time)
- Comparison with team averages
- Gamification (badges for achievements)
- Manager feedback integration
- Performance goals vs actual
- Export performance reports as PDF

## 📝 Technical Details

**Backend Files:**
- `backend/app/services/performance_calculator.py` - All calculation logic
- `backend/app/api/employee_profile.py` - Performance metrics endpoints
- `backend/migrations/002_link_performance_to_tasks.sql` - Database schema

**Frontend Files:**
- `frontend/src/components/EmployeeProfile/Performance/PerformanceSummary.tsx` - Main UI
- `frontend/src/services/employeeProfileService.ts` - API calls
- `frontend/src/components/EmployeeProfile/PerformanceTab.tsx` - Tab navigation

## ✅ Testing Checklist

- [ ] Open employee profile from Org Chart
- [ ] Click Performance → Summary
- [ ] See overall score and task metrics
- [ ] Switch between 7/30/90 day periods
- [ ] Verify insights appear based on metrics
- [ ] Check that overdue tasks show in red
- [ ] Verify completion rates match actual tasks
- [ ] Test with different employees

## 🎉 Benefits

1. **Real-Time** - No manual updates needed, auto-calculates from tasks
2. **Objective** - Based on actual work, not subjective ratings
3. **Actionable** - Insights tell employees what to improve
4. **Transparent** - Employees can see their own metrics
5. **Integrated** - Connects Performance, Tasks, and Projects seamlessly

---

**The employee profile is now a complete performance management system!** 🚀

