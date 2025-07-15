#!/bin/bash

echo "🚀 Setting up Prok Professional Networking App..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python 3 is installed
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Backend setup
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python3 init_db.py

echo "✅ Backend setup complete"

# Frontend setup
echo "🔧 Setting up frontend..."
cd ../frontend

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup complete! You can now run the application:"
echo ""
echo "To start the backend server:"
echo "  cd backend && source venv/bin/activate && python3 main.py"
echo ""
echo "To start the frontend server (in a new terminal):"
echo "  cd frontend && npm run dev"
echo ""
echo "The backend will run on http://localhost:5000"
echo "The frontend will run on http://localhost:5173"
echo ""
echo "📝 Instructions:"
echo "1. Start the backend server first"
echo "2. Start the frontend server in a new terminal"
echo "3. Open http://localhost:5173 in your browser"
echo "4. Sign up for a new account or login"
echo "5. Navigate to the profile page and test the edit functionality"
echo ""
echo "🔧 Profile Edit Features:"
echo "- Edit basic profile information (name, title, location, bio, phone)"
echo "- Upload profile image"
echo "- All changes are saved to the database"
echo "- Real-time validation and error handling" 