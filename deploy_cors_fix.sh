#!/bin/bash

echo "🚀 Deploying CORS Fix to Production"
echo "=================================="

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
git commit -m "Fix CORS configuration for production deployment

- Simplified CORS configuration to avoid conflicts
- Added OPTIONS method support to auth routes
- Fixed signup route to return token
- Enhanced preflight request handling"

# Push to main branch
echo "🚀 Pushing to main branch..."
git push origin main

echo ""
echo "✅ Changes pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Render dashboard"
echo "2. Click on your backend service (prok-backend-pmng)"
echo "3. Click 'Manual Deploy' → 'Clear build cache & deploy'"
echo "4. Wait for deployment to complete (2-3 minutes)"
echo "5. Test the signup functionality"
echo ""
echo "🔍 To test after deployment:"
echo "python3 test_production_cors.py"
echo ""
echo "🌐 Your backend URL: https://prok-backend-pmng.onrender.com" 