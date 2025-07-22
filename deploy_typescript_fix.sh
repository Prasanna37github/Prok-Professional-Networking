#!/bin/bash

echo "🚀 Deploying TypeScript Error Fixes"
echo "==================================="

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
git commit -m "Fix TypeScript build errors

- Removed unused React import from ProfileHeader.tsx
- Removed unused authUser variable from ProfileLayout.tsx
- Fixed TS6133 errors that were causing build failures

This should resolve the frontend deployment issues on Render."

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
echo "5. Verify the build succeeds without TypeScript errors"
echo ""
echo "🔍 The fixes address:"
echo "   - TS6133: 'React' is declared but its value is never read"
echo "   - TS6133: 'authUser' is declared but its value is never read"
echo ""
echo "🌐 Your frontend should now deploy successfully!" 