# 🎯 Goal Progress Update - Visual Walkthrough

## ⚡ Quick Answer

**To update your goal progress:**

1. Go to **Performance** page
2. Find your **approved** goal
3. Click **"Update"** button next to progress bar
4. Drag the **slider** to set progress (0-100%)
5. Click **"Save Progress"**
6. Done! ✅

---

## 📸 Visual Guide

### Step 1: Navigate to Performance

```
┌─────────────────────────────────────────┐
│ 🏠 Dashboard                             │
│ 📊 Performance      ← Click here        │
│ ⏰ Time Tracking                         │
│ 📅 Leave Management                      │
└─────────────────────────────────────────┘
```

---

### Step 2: Go to "My Goals" Tab

```
┌──────────────────────────────────────────────────┐
│ Performance Management                            │
├──────────────────────────────────────────────────┤
│ [My Goals] [Pending Approvals] [KPI Trends]     │
│    ▔▔▔▔▔▔▔▔                                      │
└──────────────────────────────────────────────────┘
```

---

### Step 3: Find Your Approved Goal

```
┌─────────────────────────────────────────────────┐
│ 🎯 Complete Q4 Sales Target       [Approved]    │
│ Achieve 150% of quarterly sales quota           │
│                                                  │
│ Progress                               45%      │
│ [█████████████████░░░░░░░░░░░░░░]  [Update] ← Click
│                                                  │
│ 📅 Due: Dec 31, 2025                            │
└─────────────────────────────────────────────────┘
```

---

### Step 4: Adjust the Slider

```
┌─────────────────────────────────────────────────┐
│ Update Progress: 75%                             │
│                                                  │
│ [━━━━━━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━]      │
│ 0%      25%      50%      75%      100%         │
│                                                  │
│ Preview:                                         │
│ [███████████████████████████████░░░░░░░]        │
│                                                  │
│ [💾 Save Progress]  [✕]                         │
└─────────────────────────────────────────────────┘
```

**Actions:**
- 🖱️ **Drag slider** to adjust
- 👀 **Watch preview** update in real-time
- 💾 **Click Save** when ready
- ❌ **Click X** to cancel

---

### Step 5: After Saving

```
┌─────────────────────────────────────────────────┐
│ 🎯 Complete Q4 Sales Target       [Approved]    │
│ Achieve 150% of quarterly sales quota           │
│                                                  │
│ Progress                               75%      │
│ [█████████████████████████████████░░░░░░]  [Update]
│                                                  │
│ 📅 Due: Dec 31, 2025                            │
│ ✅ Progress updated successfully!                │
└─────────────────────────────────────────────────┘
```

Progress bar reflects new value immediately! ✨

---

## 🔒 **When Update Button Appears**

### ✅ **Update Button Shows When:**

```
Goal Status: Approved ✓
Goal State: Active ✓
You are: Owner ✓

[Progress Bar]  [Update] ← Button visible
```

### ❌ **Update Button Hidden When:**

**Pending Approval:**
```
Goal Status: Pending ⏳
Goal State: Active

[Progress Bar]  [No button]
⏳ Waiting for manager approval
```

**Rejected:**
```
Goal Status: Rejected ✕
Goal State: Active

[Progress Bar]  [No button]
❌ Rejected by manager
```

**Closed:**
```
Goal Status: Approved ✓
Goal State: Closed

[Progress Bar]  [No button]
✓ Goal completed
```

---

## 📊 **Progress Milestones**

### Track Your Journey

**0% - Just Started**
```
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```

**25% - Quarter Way**
```
[██████░░░░░░░░░░░░░░░░░░░░░░] 25%
```

**50% - Halfway There!**
```
[████████████░░░░░░░░░░░░░░░░] 50%
```

**75% - Almost Done**
```
[██████████████████░░░░░░░░░░] 75%
```

**100% - Achievement Unlocked! 🎉**
```
[████████████████████████████] 100%
```

---

## 🎮 **Interactive Example**

Try this complete workflow:

### Create & Track a Goal

**Day 1: Create Goal**
```
Goal: "Master React Performance"
Progress: 0%
Status: Pending
```

**Day 3: Approved**
```
Manager approves
Status: Approved
Progress: 0%
[Update] button appears
```

**Week 1: Learning Phase**
```
Click Update → Set to 25%
"Completed basic tutorials"
```

**Week 2: Building**
```
Click Update → Set to 50%
"Built first optimized component"
```

**Week 3: Practicing**
```
Click Update → Set to 75%
"Applied to 3 production components"
```

**Week 4: Mastered!**
```
Click Update → Set to 100%
"Achieved measurable performance improvements"
Status: Ready to close
```

---

## 💡 **Pro Tips**

### Tip 1: Update Regularly
Don't wait until the end. Update weekly to show continuous progress.

### Tip 2: Use Round Numbers
Stick to 0%, 25%, 50%, 75%, 100% or 5% increments for clarity.

### Tip 3: Track Milestones
Update progress when you hit major milestones, not arbitrary percentages.

### Tip 4: Be Realistic
Don't set to 90% if you're only halfway done. Honest tracking is better.

### Tip 5: Communicate
Add notes (if field available) explaining why progress changed.

---

## 🔄 **Bulk Progress Update (API)**

If you have many goals to update:

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
headers = {"Authorization": f"Bearer {token}"}

# Update multiple goals
goal_updates = [
    {"id": 1, "progress": 75},
    {"id": 2, "progress": 50},
    {"id": 3, "progress": 100},
]

for update in goal_updates:
    response = requests.put(
        f"{BASE_URL}/performance/objectives/{update['id']}",
        headers=headers,
        json={"progress": update['progress']}
    )
    print(f"✅ Goal {update['id']} → {update['progress']}%")
```

---

## 📱 **Mobile-Friendly**

The slider works on mobile devices too:
- 📱 Tap and drag
- 👆 Touch-friendly targets
- 📏 Responsive layout

---

## ✅ **Summary**

**Where:** Performance page → My Goals tab  
**Button:** "Update" next to progress bar  
**Action:** Drag slider, click Save  
**Frequency:** Update weekly or at milestones  
**Result:** Progress bar updates immediately  

**Component:** `GoalProgressUpdater.tsx` ✅  
**Integrated:** Yes ✅  
**Working:** Yes ✅  

**You can now track goal progress with a simple slider!** 🎯

