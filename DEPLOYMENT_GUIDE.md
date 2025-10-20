# Deployment Guide for Render

This guide will help you deploy the HR Management System to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://render.com/dashboard
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   
   **Backend Environment Variables:**
   - `SECRET_KEY`: Will be auto-generated (or set your own strong secret)
   - `ALLOWED_ORIGINS`: Set to your frontend URL (e.g., `https://your-app.onrender.com`)
   - `DATABASE_URL`: Auto-set if using PostgreSQL, or leave default for SQLite
   
   **Frontend Environment Variables:**
   - `REACT_APP_API_URL`: Set to your backend URL (e.g., `https://your-backend.onrender.com`)

4. **Deploy**
   - Click "Apply" and Render will deploy both services

### Option 2: Manual Deployment

#### Backend Deployment

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `hr-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Set Environment Variables**
   ```
   SECRET_KEY=<generate-a-strong-secret-key>
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   DATABASE_URL=sqlite:///./hr_app.db
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Note the backend URL (e.g., `https://hr-backend-xxxx.onrender.com`)

#### Frontend Deployment

1. **Create Static Site**
   - Click "New" → "Static Site"
   - Connect your repository
   - Configure:
     - **Name**: `hr-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

2. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Note the frontend URL

4. **Update Backend CORS**
   - Go back to backend service settings
   - Update `ALLOWED_ORIGINS` to include the frontend URL
   - Trigger a manual deploy

## Post-Deployment Configuration

### 1. Update config.js (if needed)

The app now uses environment variables, so you don't need to hardcode URLs. However, if deploying to a specific environment, you can create production-specific files:

```javascript
// frontend/src/config.js is already configured to use environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export default API_BASE_URL;
```

### 2. Initialize Database

If using a fresh database, you may need to run migrations:

1. Go to your backend service in Render
2. Click "Shell" tab
3. Run:
   ```bash
   python init_db.py
   ```

### 3. Test Your Deployment

1. Visit your frontend URL
2. Try logging in with the default credentials:
   - Email: `admin@company.com`
   - Password: `password123`

## Important Notes

### Database Persistence

- **SQLite**: Data is stored in the service's disk. On free tier, this resets periodically.
- **PostgreSQL**: Recommended for production. Add a PostgreSQL database in Render.

To use PostgreSQL:
1. Create a PostgreSQL database in Render
2. Update `DATABASE_URL` in backend environment variables
3. Install `psycopg2-binary` in requirements.txt:
   ```
   psycopg2-binary>=2.9.9
   ```

### File Uploads (Avatars)

For production, you should use cloud storage (S3, Cloudinary, etc.) instead of local file storage.

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Limited bandwidth and build minutes

### Security Checklist

- [x] Changed default SECRET_KEY
- [x] Updated CORS to production URLs only
- [x] Environment variables are set correctly
- [ ] Consider using HTTPS-only cookies in production
- [ ] Set up proper logging and monitoring
- [ ] Change default admin password after first login

## Troubleshooting

### Backend Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set
- Check that build command completed successfully

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings in backend (`ALLOWED_ORIGINS`)
- Ensure backend service is running

### Database Errors
- For SQLite: Check disk space
- For PostgreSQL: Verify DATABASE_URL format
- Run migrations if needed

## Environment Variables Reference

### Backend (.env)
```bash
# Required
SECRET_KEY=your-super-secret-key
ALLOWED_ORIGINS=https://your-frontend.onrender.com

# Optional
DATABASE_URL=postgresql://user:pass@host/db  # For PostgreSQL
```

### Frontend (.env)
```bash
# Required
REACT_APP_API_URL=https://your-backend.onrender.com
```

## Support

For issues specific to:
- **Render Platform**: https://render.com/docs
- **Application Code**: Check the GitHub repository or contact support

---

**Last Updated**: October 2025

