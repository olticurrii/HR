# 🔧 FIX CORS ERROR - DO THIS NOW

## Your App is 99% Working! Just Need to Update 1 Setting

---

## 🎯 STEP-BY-STEP (Takes 1 Minute)

### 1. Go to Render Dashboard
- Open: https://dashboard.render.com
- Look for **hr-backend** service
- Click on it

### 2. Click "Environment" Tab
- At the top of the page, you'll see tabs
- Click on **"Environment"**

### 3. Find ALLOWED_ORIGINS
- Scroll down the list of environment variables
- Find: **ALLOWED_ORIGINS**

### 4. Edit It
- Click the **pencil icon** (Edit) next to ALLOWED_ORIGINS
- You'll see current value: `http://localhost:3000`

### 5. Change the Value
- **DELETE**: `http://localhost:3000`
- **TYPE EXACTLY**: `https://hr-frontend-yzmo.onrender.com`
- Make sure:
  - Starts with `https://` (not http://)
  - No space at the end
  - No trailing slash

### 6. Save
- Click **"Save"** or **"Save Changes"** button
- Backend will automatically redeploy (wait 1-2 minutes)

---

## ✅ Then Test

1. **Wait** for backend to show "Live" status (1-2 minutes)

2. **Go to**: `https://hr-frontend-yzmo.onrender.com`

3. **Hard refresh** the page:
   - **Windows**: Press `Ctrl + Shift + R`
   - **Mac**: Press `Cmd + Shift + R`

4. **Login**:
   - Email: `admin@company.com`
   - Password: `password123`

5. **SUCCESS!** 🎉

---

## 📍 Visual Guide

```
Render Dashboard
  └── hr-backend (click here)
        └── Environment tab (click here)
              └── ALLOWED_ORIGINS (click edit pencil)
                    └── Change to: https://hr-frontend-yzmo.onrender.com
                          └── Click Save
```

---

## ⚠️ Common Mistakes to Avoid

❌ DON'T write: `http://hr-frontend-yzmo.onrender.com` (wrong - needs https)
❌ DON'T write: `https://hr-frontend-yzmo.onrender.com/` (wrong - no trailing slash)
❌ DON'T write: `https://hr-frontend-yzmo.onrender.com ` (wrong - space at end)

✅ DO write: `https://hr-frontend-yzmo.onrender.com` (correct!)

---

## 🐛 If You Still See Errors

After fixing CORS, if you see 500 errors for some pages:
- **This is normal!** Database is empty
- Some pages need data (departments, roles, etc.)
- You can set these up after logging in

The important thing is that you can LOGIN first.

---

## 💡 Alternative (If You Can't Find Environment Tab)

If you can't find the Environment tab:
1. Look for **"Settings"** tab
2. Or look for **"Environment Variables"** section
3. It might be in a different location depending on Render's UI

---

**THAT'S IT! Just change that one setting and you're done!** 🚀

