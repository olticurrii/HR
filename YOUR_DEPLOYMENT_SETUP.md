# 🎯 YOUR DEPLOYMENT - Final Setup Steps

## Your URLs

✅ **Frontend**: `https://hr-frontend-yzmo.onrender.com`
✅ **Backend**: `https://hr-backend-k2gl.onrender.com`

---

## 🔧 Step 1: Update Backend CORS

Your backend needs to accept requests from your frontend.

### In Render Dashboard:

1. Go to **hr-backend** service
2. Click **"Environment"** tab
3. Find `ALLOWED_ORIGINS` variable
4. Click the **Edit** button (pencil icon)
5. **Change value to**:
   ```
   https://hr-frontend-yzmo.onrender.com
   ```
6. Click **"Save"**
7. Wait for automatic redeploy (1-2 minutes)

---

## 🔧 Step 2: Update Frontend API URL

Your frontend needs to know where your backend is.

### In Render Dashboard:

1. Go to **hr-frontend** static site
2. Click **"Environment"** or **"Settings"** tab
3. Look for `REACT_APP_API_URL` variable
4. If it exists, **Edit** it. If not, **Add** it.
5. **Set value to**:
   ```
   https://hr-backend-k2gl.onrender.com
   ```
6. Click **"Save"**
7. This will trigger a redeploy

---

## ✅ Step 3: Wait and Test

### Wait for:
- ⏳ Backend to finish redeploying (after CORS update)
- ⏳ Frontend to finish redeploying (after API URL update)
- Both should show "Live" status

### Then Test:

1. **Visit**: `https://hr-frontend-yzmo.onrender.com`

2. **You should see**: Login page

3. **Login with**:
   - **Email**: `admin@company.com`
   - **Password**: `password123`

4. **If login works**: 🎉 Everything is set up correctly!

5. **IMPORTANT**: Immediately go to Profile and change the admin password!

---

## 🐛 Troubleshooting

### If you see "Cannot connect to backend":

**Check Frontend Environment**:
1. Go to hr-frontend → Environment
2. Verify `REACT_APP_API_URL` is set to your backend URL
3. Make sure it starts with `https://` and has no trailing slash

### If you see "CORS error" in browser console:

**Check Backend Environment**:
1. Go to hr-backend → Environment  
2. Verify `ALLOWED_ORIGINS` = `https://hr-frontend-yzmo.onrender.com`
3. Make sure it's exactly this (no spaces, no trailing slash)
4. Redeploy backend if you changed it

### If page loads slowly on first visit:

- This is normal! Free tier services sleep after 15 minutes
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

### To check if backend is working:

Visit: `https://your-backend-url.onrender.com/health`

Should return:
```json
{"status":"healthy"}
```

---

## 📋 Quick Checklist

Complete these in order:

- [ ] Find your backend URL (go to hr-backend service, copy URL at top)
- [ ] Update backend CORS to: `https://hr-frontend-yzmo.onrender.com`
- [ ] Update frontend API URL to: `https://your-backend-url.onrender.com`
- [ ] Wait for both services to redeploy (check they show "Live")
- [ ] Visit `https://hr-frontend-yzmo.onrender.com`
- [ ] Login with admin@company.com / password123
- [ ] Change admin password immediately
- [ ] Start using your app! 🎉

---

## 🎊 After Everything Works

Your HR Management System is live! You can now:

- ✅ Create user accounts
- ✅ Set up departments
- ✅ Manage tasks and projects
- ✅ Track time and attendance
- ✅ Handle leave requests
- ✅ Collect feedback
- ✅ Monitor performance
- ✅ Use the chat system
- ✅ And much more!

---

## 💰 Note About Free Tier

**Current Setup**: Both services on free tier
- Services sleep after 15 min of inactivity
- 750 hours/month free compute time
- Database resets on free tier (upgrade to PostgreSQL for persistence)

**To Upgrade**: Go to each service → Settings → Instance Type → Select paid tier ($7/month each)

---

**That's it! Follow the checklist above and you'll be up and running!** 🚀

