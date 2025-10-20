# 📊 How to Update Goal Progress

## 🎯 Overview

Self-created goals can be updated by the owner to track progress toward completion. Progress is displayed as a percentage (0-100%).

---

## 🖱️ **Method 1: Via UI (Recommended)**

### Step-by-Step

1. **Navigate to Performance**
   - Click "Performance" in the sidebar
   - Go to "My Goals" tab

2. **Find Your Goal**
   - Locate the goal you want to update
   - Goal must be **Approved** and **Active**

3. **Click "Update" Button**
   - Click the "Update" button next to the progress bar
   - A slider will appear

4. **Adjust Progress**
   - Drag the slider to set progress (0-100%)
   - Preview shows in real-time
   - Increment: 5% steps

5. **Save**
   - Click "Save Progress"
   - Progress updates immediately
   - Progress bar reflects new value

### Requirements
- ✅ Goal must be **Approved** (not pending)
- ✅ Goal must be **Active** (not closed/archived)
- ✅ You must be the goal owner

---

## 🔧 **Method 2: Via API**

### Using cURL

```bash
# Get your token first
TOKEN="your_jwt_token_here"

# Update goal progress
curl -X PUT http://localhost:8000/api/v1/performance/objectives/123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 75.0
  }'
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
token = "your_jwt_token"
headers = {"Authorization": f"Bearer {token}"}

# Update progress
response = requests.put(
    f"{BASE_URL}/performance/objectives/123",
    headers=headers,
    json={"progress": 75.0}
)

print(f"✅ Progress updated: {response.json()['progress']}%")
```

### What You Can Update

Besides progress, you can also update:
- `title` - Goal title
- `description` - Goal description
- `status` - 'active', 'closed', 'archived'
- `start_date` - Start date
- `due_date` - Due date
- `progress` - Progress percentage (0-100)

**Example (Update Multiple Fields):**
```json
{
  "progress": 80.0,
  "status": "active",
  "description": "Updated description with latest achievements"
}
```

---

## 🎨 **UI Features**

### Progress Updater Component

**Features:**
- 🎚️ **Slider Control** - Easy drag to set percentage
- 👁️ **Live Preview** - See changes before saving
- ⚡ **Quick Updates** - 5% increments for fast adjustment
- ✅ **Validation** - Can't exceed 100%
- 💾 **Auto-save** - Updates immediately on save
- ❌ **Cancel Option** - Revert changes if needed

### Visual States

**Editable (Approved & Active):**
```
Progress                                           45%
[===================░░░░░░░░░░░░░░░░░░░░░]  [Update]
```

**Click Update:**
```
┌─────────────────────────────────────────────┐
│ Update Progress: 75%                         │
│ [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
│ 0%      25%      50%      75%      100%      │
│                                               │
│ Preview:                                      │
│ [███████████████████████████████░░░░░░░░░]   │
│                                               │
│ [💾 Save Progress]  [X]                       │
└─────────────────────────────────────────────┘
```

**After Saving:**
```
Progress                                           75%
[█████████████████████████████████░░░░░░░░]  [Update]
```

---

## 📋 **Goal Progress Workflow**

### Complete Lifecycle

```
1. Create Goal
   ↓
2. Status: Pending
   ↓
3. Manager Approves
   ↓
4. Status: Approved (Progress: 0%)
   ↓
5. Employee Updates Progress
   - Week 1: 25%
   - Week 2: 50%
   - Week 3: 75%
   - Week 4: 100%
   ↓
6. Complete Goal
   - Status: Closed
   ↓
7. Goal Achievement Recorded
```

---

## 🔄 **When Can You Update Progress?**

### ✅ **Can Update:**
- Goal is **Approved** (not pending)
- Goal is **Active** (not closed/archived)
- You are the **goal owner**
- You are a **manager** (for your reports)
- You are an **admin**

### ❌ **Cannot Update:**
- Goal is still **Pending approval**
- Goal is **Closed** or **Archived**
- You don't have **permission**

---

## 💡 **Best Practices**

### Regular Updates
**Recommended:** Update progress weekly
```
Week 1: 25%  "Completed planning phase"
Week 2: 50%  "Finished first milestone"
Week 3: 75%  "Integrated feedback"
Week 4: 100% "Goal achieved!"
```

### Meaningful Increments
- Use 5% or 10% increments
- Don't jump from 0% to 100%
- Track realistic progress

### Closing Goals
When you reach 100%:
```
1. Update progress to 100%
2. Click goal menu (if implemented)
3. Change status to "Closed"
4. Or admin/manager can close it
```

---

## 🧪 **Test Progress Updates**

### Quick Test

1. **Create a test goal:**
   - Performance → Create New Goal
   - Title: "Test Progress Updates"
   - Submit

2. **If approval required:**
   - Login as manager
   - Approve the goal

3. **Update progress:**
   - Back to employee view
   - Find goal
   - Click "Update"
   - Drag slider to 50%
   - Click "Save Progress"
   - ✅ Progress bar updates!

4. **Continue updating:**
   - Later: Update to 75%
   - Later: Update to 100%
   - Close goal

---

## 📊 **Progress Tracking Tips**

### Link to Tasks (Optional Future Enhancement)
When your goals are linked to tasks:
- Task 1 complete = 25% progress
- Task 2 complete = 50% progress
- Task 3 complete = 75% progress
- All tasks complete = 100% progress

### Milestone-Based
Break goals into milestones:
```
Goal: "Launch New Product"
├─ 25%: Requirements gathered
├─ 50%: Design completed
├─ 75%: Development finished
└─ 100%: Product launched
```

### Time-Based
For ongoing goals:
```
Goal: "Maintain 90% Customer Satisfaction"
├─ Month 1: 88% → 22% progress
├─ Month 2: 91% → 56% progress  
├─ Month 3: 93% → 89% progress
└─ Month 4: 95% → 100% progress
```

---

## 🎯 **Progress Auto-Calculation (Future)**

Currently, progress is manual. Future enhancements could include:

**Auto-Progress from Tasks:**
```python
# If goal has 4 linked tasks
completed_tasks = 3
total_tasks = 4
auto_progress = (completed_tasks / total_tasks) * 100  # = 75%
```

**Auto-Progress from KPIs:**
```python
# If goal target is 100 units
current_value = 85
target_value = 100
auto_progress = (current_value / target_value) * 100  # = 85%
```

For now, manual updates give you full control.

---

## 📝 **Quick Reference**

**Update Progress UI:**
```
Performance → My Goals → Find Goal → Click "Update" → Adjust Slider → Save
```

**Update Progress API:**
```bash
PUT /api/v1/performance/objectives/{id}
Body: {"progress": 75.0}
```

**Who Can Update:**
- ✅ Goal owner
- ✅ Goal's assigned manager  
- ✅ Admin

**Requirements:**
- ✅ Goal must be approved
- ✅ Goal must be active

---

## ✅ **Summary**

**Progress Update Methods:**
1. 🖱️ **UI Slider** - Click "Update" button, drag slider, save
2. 🔧 **API Call** - PUT endpoint with progress value

**Component:** `GoalProgressUpdater.tsx`  
**Integrated:** PerformancePage.tsx  
**API:** `PUT /performance/objectives/{id}`  

**Status:** ✅ **READY TO USE**

Go to Performance page, find an approved goal, and click "Update" to start tracking progress! 🎯

