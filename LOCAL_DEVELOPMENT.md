# 🖥️ Local Development Servers Started!

## ✅ Servers Running

I've started both servers for you in the background:

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Port**: 8000

### Frontend (React)
- **URL**: http://localhost:3000
- **Will open automatically in your browser**
- **Port**: 3000

---

## 🎯 Access Your App

Once both servers are ready (takes 10-30 seconds):

1. **Frontend will open automatically**: http://localhost:3000
2. **Login with**:
   - Email: `admin@company.com`
   - Password: `password123`

---

## 🔧 Useful Commands

### Check if servers are running:
```bash
# Check backend
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

### View logs:
```bash
# Backend logs - in terminal 1
cd backend
source ../venv_mac/bin/activate
uvicorn app.main:app --reload

# Frontend logs - in terminal 2
cd frontend
npm start
```

### Stop servers:
```bash
# Find and kill processes
lsof -ti:8000 | xargs kill  # Stop backend
lsof -ti:3000 | xargs kill  # Stop frontend
```

---

## 📊 API Documentation

When backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🐛 Troubleshooting

### Port already in use?
```bash
# Kill existing processes
lsof -ti:8000 | xargs kill
lsof -ti:3000 | xargs kill
```

### Backend not starting?
```bash
cd backend
source ../venv_mac/bin/activate
pip install -r requirements.txt
```

### Frontend not starting?
```bash
cd frontend
npm install
npm start
```

### Database issues?
```bash
# Reinitialize database
cd backend
source ../venv_mac/bin/activate
python init_db.py
```

---

## 💡 Development Tips

### Hot Reload
- **Backend**: Auto-reloads on file changes (--reload flag)
- **Frontend**: Auto-reloads on file changes (React default)

### Environment Variables
- **Backend**: Uses local SQLite database
- **Frontend**: Uses `http://localhost:8000` (from config.js)

### Database Location
- Local SQLite: `hr_app.db` in root directory
- Production: PostgreSQL on Render

---

## 🔄 Restart Servers

If you need to restart:

**Backend:**
```bash
# Stop
lsof -ti:8000 | xargs kill

# Start
cd backend
source ../venv_mac/bin/activate
uvicorn app.main:app --reload
```

**Frontend:**
```bash
# Stop
lsof -ti:3000 | xargs kill

# Start
cd frontend
npm start
```

---

## 📱 Access from Mobile/Other Device

1. Find your local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Update frontend to use your IP instead of localhost

3. Access from other device: `http://YOUR_IP:3000`

---

**Your local development environment is ready! 🚀**

