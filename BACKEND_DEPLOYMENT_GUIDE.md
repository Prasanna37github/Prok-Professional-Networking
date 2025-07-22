# 🚀 Backend Deployment Guide - Render

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ Render.com account
- ✅ Your backend code is ready (CORS fixes applied)

## 🎯 Step-by-Step Deployment

### **Step 1: Verify Your Code is Ready**

First, ensure your backend code is properly configured:

```bash
# Check if you're in the right directory
ls app/backend/main.py

# Verify your changes are committed
git status
```

### **Step 2: Access Render Dashboard**

1. Go to [render.com](https://render.com)
2. Sign in with your GitHub account
3. Click **"New +"** button

### **Step 3: Create Web Service**

1. **Select Service Type:**
   - Click **"Web Service"**

2. **Connect Repository:**
   - Click **"Connect a repository"**
   - Select your GitHub repository: `Prasanna37github/Prok-Professional-Networking`
   - Choose branch: `module7-deployment`

### **Step 4: Configure Backend Service**

#### **Basic Settings:**
- **Name**: `prok-backend-pmng` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `module7-deployment`
- **Root Directory**: `app/backend`
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  python main.py
  ```

#### **Environment Variables:**
Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Description |
|-----|-------|-------------|
| `FLASK_ENV` | `production` | Production environment |
| `SECRET_KEY` | `your-super-secret-key-here` | Flask secret key |
| `JWT_SECRET_KEY` | `your-jwt-secret-key-here` | JWT token secret |
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `UPLOAD_FOLDER` | `uploads` | File upload directory |
| `MAX_CONTENT_LENGTH` | `16777216` | Max file size (16MB) |

#### **Generate Secure Keys:**
Run these commands to generate secure keys:

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32))"

# Generate JWT_SECRET_KEY
python3 -c "import secrets; print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

### **Step 5: Create PostgreSQL Database**

1. **Create Database Service:**
   - Go back to Render dashboard
   - Click **"New +"** → **"PostgreSQL"**

2. **Configure Database:**
   - **Name**: `prok-database`
   - **Database**: `prok_app`
   - **User**: `prok_user`
   - **Region**: Same as your backend
   - **Plan**: Free

3. **Get Connection String:**
   - After creation, click on your database
   - Copy the **"External Database URL"**
   - Use this as your `DATABASE_URL` environment variable

### **Step 6: Deploy Backend**

1. **Click "Create Web Service"**
2. **Wait for deployment** (2-3 minutes)
3. **Monitor the build logs** for any errors

### **Step 7: Verify Deployment**

#### **Test Backend Health:**
```bash
# Test health endpoint
curl https://your-backend-name.onrender.com/api/health

# Expected response:
# {"status": "healthy", "message": "Backend is running"}
```

#### **Test CORS Configuration:**
```bash
# Run the test script
python3 test_production_cors.py
```

### **Step 8: Configure Frontend**

1. **Go to your frontend service** on Render
2. **Go to Environment tab**
3. **Add/Update environment variable:**
   ```
   VITE_API_URL=https://your-backend-name.onrender.com
   ```
4. **Redeploy frontend**

## 🔧 Troubleshooting

### **Common Issues:**

#### **1. Build Failures**
**Problem**: Backend build fails
**Solution**:
- Check build logs in Render dashboard
- Verify `requirements.txt` exists in `app/backend/`
- Ensure all dependencies are listed

#### **2. Database Connection Issues**
**Problem**: Can't connect to database
**Solution**:
- Verify `DATABASE_URL` environment variable
- Check PostgreSQL service is running
- Ensure database credentials are correct

#### **3. CORS Errors**
**Problem**: Frontend can't communicate with backend
**Solution**:
- Verify backend URL in frontend environment
- Check CORS configuration in `main.py`
- Test with `test_production_cors.py`

#### **4. Missing Dependencies**
**Problem**: Module not found errors
**Solution**:
- Add missing packages to `requirements.txt`
- Redeploy with "Clear build cache & deploy"

### **Debug Commands:**

#### **Check Backend Logs:**
- Go to your backend service on Render
- Click **"Logs"** tab
- Look for error messages

#### **Test Backend Directly:**
```bash
# Health check
curl https://your-backend-name.onrender.com/api/health

# CORS test
curl -X OPTIONS https://your-backend-name.onrender.com/api/signup

# Test signup endpoint
curl -X POST https://your-backend-name.onrender.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

## 📊 Monitoring

### **Health Checks:**
- URL: `https://your-backend-name.onrender.com/api/health`
- Should return: `{"status": "healthy", "message": "Backend is running"}`

### **CORS Test:**
- URL: `https://your-backend-name.onrender.com/api/test-cors`
- Should return: `{"message": "CORS test successful", "method": "GET"}`

### **Database Status:**
- Check PostgreSQL service status in Render dashboard
- Monitor database connection logs

## 🎯 Success Indicators

- ✅ Backend service shows "Live" status
- ✅ Health check endpoint responds
- ✅ CORS test passes
- ✅ Database connection works
- ✅ Frontend can communicate with backend
- ✅ Signup/login functionality works

## 📞 Quick Commands

**Generate secure keys:**
```bash
python3 -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32))"
python3 -c "import secrets; print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

**Test deployment:**
```bash
python3 test_production_cors.py
```

**Check backend status:**
```bash
curl https://your-backend-name.onrender.com/api/health
```

## 🏆 Final Checklist

- [ ] Backend service is "Live" on Render
- [ ] Environment variables are set correctly
- [ ] Database is connected and working
- [ ] Health check endpoint responds
- [ ] CORS configuration works
- [ ] Frontend can communicate with backend
- [ ] Signup/login functionality works in production

**Your backend should now be fully deployed and working! 🎉** 