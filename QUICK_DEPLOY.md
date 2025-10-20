# Quick Deploy to Render

## 🚀 5-Minute Deployment

### Step 1: Update Your URLs

1. **config.js is already set up** ✅
   - Located at: `frontend/src/config.js`
   - Uses environment variables automatically

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 3: Deploy Backend

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `hr-management-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables** - Add these:
   ```
   SECRET_KEY = <click "Generate" to create one>
   ALLOWED_ORIGINS = https://your-frontend-name.onrender.com
   ```
   
6. Click **"Create Web Service"**
7. **COPY YOUR BACKEND URL** (e.g., `https://hr-management-backend.onrender.com`)

### Step 4: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect the same repository
3. Configure:
   - **Name**: `hr-management-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && CI=false npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables** - Add this (use your actual backend URL):
   ```
   REACT_APP_API_URL = https://hr-management-backend.onrender.com
   ```

5. Click **"Create Static Site"**

### Step 5: Update CORS

1. Go back to your **backend service**
2. Go to **"Environment"** tab
3. Update `ALLOWED_ORIGINS` with your actual frontend URL:
   ```
   ALLOWED_ORIGINS = https://hr-management-frontend.onrender.com
   ```
4. Save and it will auto-redeploy

### Step 6: Test! 🎉

1. Visit your frontend URL
2. Login with:
   - Email: `admin@company.com`
   - Password: `password123`

## Important Notes

### First Request May Be Slow
- Free tier services "spin down" after 15 minutes
- First request wakes it up (30-60 seconds)

### Change Default Password
After first login, immediately:
1. Go to Profile
2. Change admin password

### File Persistence
- SQLite database resets on free tier restarts
- For production, upgrade to PostgreSQL database

## Need Help?

### Common Issues

**"Cannot connect to backend"**
- Check `REACT_APP_API_URL` in frontend environment variables
- Verify backend service is running

**"CORS error"**
- Update `ALLOWED_ORIGINS` in backend to include frontend URL
- Make sure there are no spaces in the URL

**"Build failed"**
- Check logs in Render dashboard
- Ensure all dependencies are in requirements.txt/package.json

---

**That's it! You're deployed! 🚀**

