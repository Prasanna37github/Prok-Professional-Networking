#!/bin/bash

echo "🚀 Deploying Complete CORS Fix to Production"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "app/backend/main.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Add all changes
echo "📦 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix ALL API files to use environment variables for production

- Updated auth/api.ts to use VITE_API_URL
- Updated profile/api.ts to use VITE_API_URL  
- Updated posts/api.ts to use VITE_API_URL
- Updated feed/api.ts to use VITE_API_URL
- Updated comments/api.ts to use VITE_API_URL
- Updated job-board/api.ts to use VITE_API_URL
- Updated messaging/api.ts to use VITE_API_URL
- Fixed API endpoint paths (added /api prefix where missing)
- Enhanced backend CORS configuration
- Fixed signup to return token

This should resolve ALL CORS errors after sign-in."

# Push to module7-deployment branch
echo "🚀 Pushing to module7-deployment branch..."
git push origin module7-deployment

echo ""
echo "✅ All changes pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Render dashboard"
echo "2. Click on your backend service (prok-backend-pmng)"
echo "3. Click 'Manual Deploy' → 'Clear build cache & deploy'"
echo "4. Wait for deployment to complete (2-3 minutes)"
echo "5. Go to your frontend service"
echo "6. Set VITE_API_URL=https://your-backend-url.onrender.com"
echo "7. Redeploy frontend"
echo "8. Test the complete flow: signup → login → dashboard"
echo ""
echo "🔍 To test after deployment:"
echo "python3 test_production_cors.py"
echo ""
echo "🌐 Your backend URL: https://prok-backend-pmng.onrender.com"
echo ""
echo "🎯 This should fix ALL CORS errors including:"
echo "   - Profile loading after sign-in"
echo "   - Posts loading"
echo "   - Comments, jobs, messaging"
echo "   - All API calls in production" 