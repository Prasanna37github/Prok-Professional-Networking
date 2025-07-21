# 🔧 Backend Deployment Environment Variables

## ✅ Required Environment Variables for Render

### **Essential Variables:**

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here-different-from-secret-key

# File Upload
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

### **Optional Variables:**

```bash
# CORS (if needed)
CORS_HEADERS=Content-Type

# Debug (set to false for production)
FLASK_DEBUG=false
```

## 🚀 How to Set Environment Variables on Render

### **Step 1: Go to Your Backend Service**
1. Open your Render dashboard
2. Click on your backend service (`prok-backend`)

### **Step 2: Add Environment Variables**
1. Go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add each variable:

| Key | Value | Description |
|-----|-------|-------------|
| `FLASK_ENV` | `production` | Production environment |
| `SECRET_KEY` | `your-long-random-string` | Flask secret key |
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `JWT_SECRET_KEY` | `your-jwt-secret` | JWT token secret |
| `UPLOAD_FOLDER` | `uploads` | File upload directory |
| `MAX_CONTENT_LENGTH` | `16777216` | Max file size (16MB) |

### **Step 3: Generate Secure Keys**

**For SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**For JWT_SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🔍 Troubleshooting CORS Issues

### **1. Check if Backend is Running**
Test your backend URL: `https://your-backend.onrender.com/api/health`

### **2. Test CORS Endpoint**
Test CORS: `https://your-backend.onrender.com/api/test-cors`

### **3. Update Frontend API URL**
Make sure your frontend environment variable is set:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## 🎯 Quick Fix Commands

If you need to quickly test:

```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test CORS
curl -X OPTIONS https://your-backend.onrender.com/api/test-cors
```

## 📋 Checklist

- [ ] All environment variables set in Render
- [ ] Backend service is "Live"
- [ ] Health check endpoint responds
- [ ] Frontend API URL is correct
- [ ] CORS test endpoint works

**After setting these variables, redeploy your backend service!** 