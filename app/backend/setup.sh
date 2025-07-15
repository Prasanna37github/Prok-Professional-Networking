#!/bin/bash

echo "🚀 Setting up Profile Backend"
echo "=============================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Set environment variables
echo "⚙️ Setting environment variables..."
export FLASK_APP=main.py
export FLASK_ENV=development

# Initialize database
echo "🗄️ Initializing database..."
python init_db.py

echo "✅ Setup completed!"
echo ""
echo "To run the backend server:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run server: python main.py"
echo ""
echo "To test the endpoints:"
echo "python test_profile.py"
echo ""
echo "Test user credentials:"
echo "Username: testuser"
echo "Email: test@example.com"
echo "Password: testpass123" 