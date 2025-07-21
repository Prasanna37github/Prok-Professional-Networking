# 🚀 Prok Professional Networking - Render Deployment Guide

This guide will walk you through deploying your Prok Professional Networking app on Render, including both the backend API and frontend web application.

## 📋 Prerequisites

- A GitHub account with your code repository
- A Render account (free tier available)
- Basic understanding of web deployment concepts

## 🏗️ Project Structure

Your project should have the following structure for deployment:

```
Prok-Professional-Networking/
├── render.yaml                 # Render blueprint configuration
├── app/
│   ├── backend/
│   │   ├── main.py            # Flask application entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── requirements.txt   # Python dependencies
│   │   ├── Procfile          # Process definition for Render
│   │   ├── runtime.txt       # Python version specification
│   │   ├── api/              # API routes
│   │   ├── models/           # Database models
│   │   └── uploads/          # File upload directory
│   └── frontend/
│       ├── package.json      # Node.js dependencies
│       ├── vite.config.ts    # Vite configuration
│       └── src/              # React source code
└── DEPLOYMENT_GUIDE.md       # This file
```

## 🔧 Step 1: Prepare Your Repository

### 1.1 Commit All Changes
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Verify Required Files
Ensure these files exist in your repository:
- ✅ `render.yaml` (in root directory)
- ✅ `app/backend/requirements.txt`
- ✅ `app/backend/Procfile`
- ✅ `app/backend/runtime.txt`
- ✅ `app/frontend/package.json`

## 🌐 Step 2: Deploy on Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

### 2.2 Deploy Using Blueprint (Recommended)

#### Option A: One-Click Deploy
1. Click "New +" in your Render dashboard
2. Select "Blueprint"
3. Connect your GitHub repository
4. Select the repository: `Prok-Professional-Networking`
5. Render will automatically detect the `render.yaml` file
6. Click "Apply" to deploy all services

#### Option B: Manual Deployment
If the blueprint doesn't work, deploy services individually:

### 2.3 Deploy Backend API

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Backend Service**
   ```
   Name: prok-backend
   Environment: Python
   Build Command: cd app/backend && pip install -r requirements.txt
   Start Command: cd app/backend && python main.py
   ```

3. **Set Environment Variables**
   ```
   FLASK_ENV=production
   JWT_SECRET_KEY=[generate a secure random string]
   UPLOAD_FOLDER=uploads
   MAX_CONTENT_LENGTH=16777216
   ```

4. **Create Database**
   - Click "New +" → "PostgreSQL"
   - Name: `prok-database`
   - Plan: Free
   - Copy the connection string

5. **Add Database URL**
   - Go back to your backend service
   - Add environment variable:
   ```
   DATABASE_URL=[paste the PostgreSQL connection string]
   ```

### 2.4 Deploy Frontend

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**
   ```
   Name: prok-frontend
   Build Command: cd app/frontend && npm install && npm run build
   Publish Directory: app/frontend/dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-service-name.onrender.com
   ```

## 🔗 Step 3: Configure Services

### 3.1 Update Frontend API URL
After your backend is deployed, update the frontend environment variable:

1. Go to your frontend service in Render
2. Navigate to "Environment"
3. Update `VITE_API_URL` to your backend URL:
   ```
   VITE_API_URL=https://prok-backend.onrender.com
   ```
4. Redeploy the frontend service

### 3.2 Configure CORS (if needed)
If you encounter CORS issues, update your backend CORS configuration in `app/backend/main.py`:

```python
CORS(app, origins=[
    "https://your-frontend-domain.onrender.com",
    "http://localhost:3000"  # for local development
])
```

## 🗄️ Step 4: Database Setup

### 4.1 Initialize Database
Your backend will automatically create database tables on first run. If you need to manually initialize:

1. Go to your backend service
2. Navigate to "Shell"
3. Run:
   ```bash
   cd app/backend
   python -c "from main import setup_database; setup_database()"
   ```

### 4.2 Database Migrations (if needed)
If you have existing data or need migrations:

1. Create a migration script
2. Run it through the Render shell
3. Or use Flask-Migrate for more complex migrations

## 🔒 Step 5: Security Configuration

### 5.1 Environment Variables
Ensure these are set in your backend service:
```
JWT_SECRET_KEY=[secure random string]
FLASK_ENV=production
DATABASE_URL=[PostgreSQL connection string]
```

### 5.2 File Upload Security
- Uploads are stored in the `uploads/` directory
- Maximum file size: 16MB (configurable)
- Supported formats: images, videos, audio

## 🚀 Step 6: Testing Your Deployment

### 6.1 Test Backend API
1. Visit your backend URL: `https://prok-backend.onrender.com`
2. You should see a welcome message or API documentation
3. Test API endpoints using tools like Postman or curl

### 6.2 Test Frontend
1. Visit your frontend URL: `https://prok-frontend.onrender.com`
2. Test user registration and login
3. Test all major features

### 6.3 Test File Uploads
1. Create a post with an image
2. Upload a profile picture
3. Verify files are stored correctly

## 🔧 Step 7: Monitoring and Maintenance

### 7.1 Monitor Logs
- Backend logs: Available in Render dashboard
- Frontend logs: Check browser console
- Database logs: Available in PostgreSQL service

### 7.2 Performance Monitoring
- Render provides basic performance metrics
- Monitor response times and error rates
- Set up alerts for downtime

### 7.3 Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular database backups

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
**Problem**: Frontend or backend build fails
**Solution**: 
- Check build logs in Render dashboard
- Verify all dependencies are in requirements.txt/package.json
- Ensure correct file paths in build commands

#### 2. Database Connection Issues
**Problem**: Backend can't connect to database
**Solution**:
- Verify DATABASE_URL environment variable
- Check PostgreSQL service is running
- Ensure database credentials are correct

#### 3. CORS Errors
**Problem**: Frontend can't communicate with backend
**Solution**:
- Update CORS configuration in backend
- Verify API URL in frontend environment variables
- Check network requests in browser developer tools

#### 4. File Upload Issues
**Problem**: Files not uploading or not accessible
**Solution**:
- Check upload directory permissions
- Verify file size limits
- Ensure proper file serving configuration

### Debug Commands

#### Backend Debugging
```bash
# Check backend logs
# Available in Render dashboard under "Logs"

# Access backend shell
# Available in Render dashboard under "Shell"
cd app/backend
python main.py
```

#### Frontend Debugging
```bash
# Check build output
cd app/frontend
npm run build

# Test locally
npm run dev
```

## 📊 Performance Optimization

### 1. Database Optimization
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Optimize database queries

### 2. Frontend Optimization
- Enable gzip compression
- Optimize images and assets
- Implement lazy loading

### 3. Caching
- Implement Redis for session storage
- Use CDN for static assets
- Cache API responses where appropriate

## 🔄 Continuous Deployment

### 1. Automatic Deploys
- Render automatically deploys on git push
- Configure branch protection rules
- Set up staging environment

### 2. Environment Management
- Use different environments for dev/staging/prod
- Manage environment variables securely
- Implement feature flags

## 📞 Support

### Render Support
- Documentation: [docs.render.com](https://docs.render.com)
- Community: [community.render.com](https://community.render.com)
- Email: support@render.com

### Project Support
- Check the main README.md for project-specific information
- Review logs for error details
- Test locally before deploying

## ✅ Deployment Checklist

- [ ] Repository is pushed to GitHub
- [ ] All required files are present
- [ ] Backend service is deployed and running
- [ ] Database is created and connected
- [ ] Frontend service is deployed and running
- [ ] Environment variables are configured
- [ ] CORS is properly configured
- [ ] File uploads are working
- [ ] User registration/login works
- [ ] All major features are tested
- [ ] Performance is acceptable
- [ ] Security measures are in place

## 🎉 Success!

Once all steps are completed, your Prok Professional Networking app will be live at:
- Frontend: `https://prok-frontend.onrender.com`
- Backend API: `https://prok-backend.onrender.com`

Your app is now ready for users to register, create profiles, share posts, and connect professionally! 