#!/bin/bash

echo "🚀 Deploying Navigation and Image Fixes"
echo "======================================"

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
git commit -m "Fix navigation and image display issues

- Fixed profile image URLs to use environment variables
- Updated navigation to use React Router instead of window.location
- Added missing home route and catch-all route
- Fixed edit profile navigation
- Enhanced ProfileLayout with proper error handling
- Fixed ProfileHeader to use production API URLs

This resolves:
- Profile images not displaying after upload
- Home button showing 'not found' error
- Edit profile navigation issues
- All navigation now uses React Router properly"

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
echo "6. Ensure VITE_API_URL=https://your-backend-url.onrender.com is set"
echo "7. Redeploy frontend"
echo "8. Test the fixes:"
echo "   - Upload a profile image and verify it displays"
echo "   - Click home button from profile page"
echo "   - Click edit profile button"
echo "   - Navigate between all pages"
echo ""
echo "🔍 To test after deployment:"
echo "1. Upload a profile image"
echo "2. Verify image displays correctly"
echo "3. Test home button navigation"
echo "4. Test edit profile navigation"
echo "5. Check all navigation works smoothly"
echo ""
echo "🌐 Your backend URL: https://prok-backend-pmng.onrender.com"
echo ""
echo "🎯 This should fix:"
echo "   - Profile images not displaying"
echo "   - Home button 'not found' error"
echo "   - Edit profile navigation issues"
echo "   - All navigation now uses React Router" 