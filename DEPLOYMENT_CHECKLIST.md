# 🚀 Quick Deployment Checklist

## 🔑 Generated Security Keys

**SECRET_KEY:**
```
2b1c8057fc43e8750b20b0294ab841198f2f9ba0ae6848a9eeb138f09d6685f2
```

**JWT_SECRET_KEY:**
```
96f82ce6fd44b225dd7f4ffe6b77e318b5d37d08ebe3b70aac21a904718cfbbc
```

## 📋 Deployment Steps

### **1. Create PostgreSQL Database**
- Go to Render → New + → PostgreSQL
- Name: `prok-database`
- Database: `prok_app`
- User: `prok_user`
- Plan: Free
- **Copy the External Database URL**

### **2. Create Backend Service**
- Go to Render → New + → Web Service
- Connect: `Prasanna37github/Prok-Professional-Networking`
- Branch: `module7-deployment`
- Root Directory: `app/backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python main.py`

### **3. Set Environment Variables**
Add these to your backend service:

| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `SECRET_KEY` | `2b1c8057fc43e8750b20b0294ab841198f2f9ba0ae6848a9eeb138f09d6685f2` |
| `JWT_SECRET_KEY` | `96f82ce6fd44b225dd7f4ffe6b77e318b5d37d08ebe3b70aac21a904718cfbbc` |
| `DATABASE_URL` | `[Your PostgreSQL URL from step 1]` |
| `UPLOAD_FOLDER` | `uploads` |
| `MAX_CONTENT_LENGTH` | `16777216` |

### **4. Deploy Backend**
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Note your backend URL (e.g., `https://prok-backend-pmng.onrender.com`)

### **5. Configure Frontend**
- Go to your frontend service on Render
- Environment tab → Add variable:
  - `VITE_API_URL` = `https://your-backend-url.onrender.com`
- Redeploy frontend

### **6. Test Deployment**
```bash
# Test backend health
curl https://your-backend-url.onrender.com/api/health

# Test CORS
python3 test_production_cors.py
```

## ✅ Success Indicators

- [ ] Backend shows "Live" status
- [ ] Health check returns: `{"status": "healthy", "message": "Backend is running"}`
- [ ] CORS test passes
- [ ] Frontend can sign up users
- [ ] No CORS errors in browser console

## 🆘 If Issues Occur

1. **Check Render logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test backend directly** with curl commands
4. **Check database connection** in PostgreSQL service

**Your backend should be fully functional after following these steps! 🎉** 