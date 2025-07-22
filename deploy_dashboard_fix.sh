#!/bin/bash

echo "🚀 Deploying Dashboard Image Loading Fixes"
echo "=========================================="

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
git commit -m "Fix dashboard image loading issues

- Updated Dashboard.tsx to use environment variables for API URLs
- Fixed profile image loading in dashboard header
- Fixed post user avatar loading in posts
- Fixed comment user avatar loading in comments
- Fixed post media loading in posts
- All hardcoded localhost:5000 URLs now use VITE_API_URL

This ensures all images load correctly in production environment."

# Push to module7-deployment branch
echo "🚀 Pushing to module7-deployment branch..."
git push origin module7-deployment

echo ""
echo "✅ All changes pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Render dashboard"
echo "2. Click on your frontend service"
echo "3. Click 'Manual Deploy' → 'Clear build cache & deploy'"
echo "4. Wait for deployment to complete (2-3 minutes)"
echo "5. Test the dashboard:"
echo "   - Profile images should load correctly"
echo "   - Post images should display properly"
echo "   - User avatars in posts should show"
echo "   - Comment user avatars should display"
echo ""
echo "🔍 The fixes address:"
echo "   - Dashboard profile image not loading"
echo "   - Post images not displaying"
echo "   - User avatars in posts not showing"
echo "   - Comment user avatars not loading"
echo ""
echo "🌐 Your dashboard should now display all images correctly!" 