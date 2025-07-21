#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process..."

# Install system dependencies if needed
echo "📦 Installing system dependencies..."
apt-get update -qq && apt-get install -y -qq \
    libmagic1 \
    libpq-dev \
    gcc \
    g++ \
    || echo "System dependencies installation skipped (not available)"

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create uploads directory if it doesn't exist
echo "📁 Creating uploads directory..."
mkdir -p uploads
mkdir -p uploads/posts

echo "✅ Build completed successfully!" 