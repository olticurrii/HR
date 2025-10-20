# 🚀 Render Deployment Instructions

## Quick Deployment (Recommended)

Since Render blueprints don't support static sites in `render.yaml`, follow this manual approach:

### Step 1: Deploy Backend Using Blueprint

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy via Blueprint**
   - Go to https://render.com/dashboard
   - Click **"New +"** → **"Blueprint"**
   - Connect your repository
   - Render will automatically deploy the backend service and database
   - **Copy the backend URL** (e.g., `https://hr-backend.onrender.com`)

### Step 2: Deploy Frontend Manually

1. **Create Static Site**
   - Click **"New +"** → **"Static Site"**
   - Connect the same repository
   - Configure:
     ```
     Name: hr-frontend
     Root Directory: frontend
     Build Command: npm install && CI=false npm run build
     Publish Directory: build
     ```

2. **Set Environment Variable**
   - Add environment variable:
     ```
     REACT_APP_API_URL = https://your-backend-url.onrender.com
     ```
   - Use the backend URL from Step 1

3. **Deploy**
   - Click **"Create Static Site"**
   - **Copy the frontend URL** (e.g., `https://hr-frontend.onrender.com`)

### Step 3: Update Backend CORS

1. Go to your **backend service** (from Step 1)
2. Navigate to **"Environment"** tab
3. Update the `ALLOWED_ORIGINS` variable:
   ```
   ALLOWED_ORIGINS = https://hr-frontend.onrender.com
   ```
   (Use your actual frontend URL from Step 2)
4. Click **"Save Changes"** (will trigger auto-deploy)

### Step 4: Test! 🎉

1. Visit your frontend URL
2. Login with:
   - Email: `admin@company.com`
   - Password: `password123`
3. **Important**: Change the admin password immediately!

---

## Alternative: Manual Deployment (Both Services)

If you prefer not to use the Blueprint, deploy both manually:

### Backend

1. **Create Web Service**
   - New → Web Service
   - Connect repository
   - Settings:
     ```
     Name: hr-backend
     Root Directory: backend
     Environment: Python 3
     Build Command: pip install -r requirements.txt
     Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

2. **Environment Variables**
   ```
   SECRET_KEY = <click Generate>
   ALLOWED_ORIGINS = https://your-frontend-url.onrender.com
   ```

### Frontend

1. **Create Static Site**
   - New → Static Site
   - Connect repository
   - Settings:
     ```
     Name: hr-frontend
     Root Directory: frontend
     Build Command: npm install && CI=false npm run build
     Publish Directory: build
     ```

2. **Environment Variable**
   ```
   REACT_APP_API_URL = https://your-backend-url.onrender.com
   ```

3. **Update Backend CORS**
   - Go back to backend
   - Update `ALLOWED_ORIGINS` with actual frontend URL

---

## Environment Variables Reference

### Backend
| Variable | Value | Required |
|----------|-------|----------|
| `SECRET_KEY` | Auto-generate | ✅ Yes |
| `ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` | ✅ Yes |
| `DATABASE_URL` | Auto-set if using PostgreSQL | Optional |

### Frontend
| Variable | Value | Required |
|----------|-------|----------|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com` | ✅ Yes |

---

## Troubleshooting

### "Cannot connect to backend"
- ✅ Verify `REACT_APP_API_URL` is set in frontend
- ✅ Check backend service is running
- ✅ Open browser console for detailed error

### "CORS Error"
- ✅ Update `ALLOWED_ORIGINS` in backend with exact frontend URL
- ✅ Include `https://` prefix
- ✅ No trailing slash
- ✅ Trigger backend redeploy after changing

### "Build Failed"
- ✅ For frontend: Use `CI=false npm run build` to ignore warnings
- ✅ For backend: Check Python version is 3.11+
- ✅ Review build logs in Render dashboard

### "Service Unavailable" / Slow First Load
- This is normal on free tier
- Services sleep after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Consider upgrading to paid tier for always-on

---

## Next Steps

1. ✅ Deploy backend (Blueprint or Manual)
2. ✅ Deploy frontend (Manual only)
3. ✅ Update CORS settings
4. ✅ Test application
5. ✅ Change admin password
6. ✅ Set up users and departments

---

## Why Two Methods?

**Blueprint (render.yaml)**: 
- ✅ Great for backend + database
- ❌ Doesn't support static sites

**Manual**:
- ✅ Works for everything
- ✅ More control
- ❌ Slightly more steps

**Recommended**: Use Blueprint for backend, Manual for frontend (Step 1-3 above)

---

## Support

- **Render Docs**: https://render.com/docs
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Quick Start**: See `QUICK_DEPLOY.md`

---

**Last Updated**: October 2025

