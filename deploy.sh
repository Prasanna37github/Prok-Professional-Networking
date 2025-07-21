#!/bin/bash

# 🚀 Prok Professional Networking - Deployment Script
# This script helps prepare your project for Render deployment

echo "🚀 Prok Professional Networking - Deployment Preparation"
echo "========================================================"

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml - proceeding with deployment preparation"

# Check required files
echo "📋 Checking required files..."

required_files=(
    "render.yaml"
    "app/backend/requirements.txt"
    "app/backend/Procfile"
    "app/backend/runtime.txt"
    "app/frontend/package.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING!"
        missing_files=true
    fi
done

if [ "$missing_files" = true ]; then
    echo "❌ Some required files are missing. Please create them before deploying."
    exit 1
fi

echo ""
echo "✅ All required files are present!"

# Check git status
echo ""
echo "🔍 Checking git status..."
if [ -d ".git" ]; then
    git_status=$(git status --porcelain)
    if [ -n "$git_status" ]; then
        echo "⚠️  You have uncommitted changes:"
        echo "$git_status"
        echo ""
        read -p "Do you want to commit these changes? (y/n): " commit_changes
        if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
            git add .
            git commit -m "Prepare for Render deployment"
            echo "✅ Changes committed!"
        fi
    else
        echo "✅ No uncommitted changes"
    fi
    
    # Check if remote exists
    if git remote get-url origin > /dev/null 2>&1; then
        echo "✅ Git remote 'origin' is configured"
        echo "Remote URL: $(git remote get-url origin)"
    else
        echo "⚠️  No git remote 'origin' found"
        echo "Please add your GitHub repository as remote:"
        echo "git remote add origin https://github.com/yourusername/your-repo.git"
    fi
else
    echo "❌ Not a git repository"
    echo "Please initialize git and add your remote repository"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Go to Render.com and create an account"
echo ""
echo "3. Deploy using the blueprint:"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Select 'Prok-Professional-Networking'"
echo "   - Click 'Apply'"
echo ""
echo "4. Or deploy manually following the DEPLOYMENT_GUIDE.md"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Good luck with your deployment!" 