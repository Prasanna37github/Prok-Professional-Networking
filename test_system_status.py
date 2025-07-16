#!/usr/bin/env python3
"""
System Status Test Script
Tests database connectivity and API endpoints
"""

import requests
import json
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'backend'))

def test_backend_connection():
    """Test if backend is running"""
    try:
        response = requests.get('http://localhost:5000/api/posts/', timeout=5)
        if response.status_code == 401:  # Expected - requires authentication
            print("✅ Backend server is running (authentication required)")
            return True
        else:
            print(f"⚠️  Backend responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_frontend_connection():
    """Test if frontend is running"""
    try:
        response = requests.get('http://localhost:5173', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend server is running")
            return True
        else:
            print(f"⚠️  Frontend responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend server is not running")
        return False
    except Exception as e:
        print(f"❌ Error connecting to frontend: {e}")
        return False

def test_database():
    """Test database connectivity"""
    try:
        from app.backend.main import create_app
        from app.backend.db import db
        from app.backend.models.user_model import User
        from app.backend.models.post import Post
        from app.backend.models.like import Like
        
        app = create_app()
        with app.app_context():
            user_count = User.query.count()
            post_count = Post.query.count()
            like_count = Like.query.count()
            
            print(f"✅ Database is accessible:")
            print(f"   - Users: {user_count}")
            print(f"   - Posts: {post_count}")
            print(f"   - Likes: {like_count}")
            return True
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🔍 Testing Prok Professional Networking System Status")
    print("=" * 50)
    
    backend_ok = test_backend_connection()
    frontend_ok = test_frontend_connection()
    database_ok = test_database()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"Backend Server: {'✅ Running' if backend_ok else '❌ Not Running'}")
    print(f"Frontend Server: {'✅ Running' if frontend_ok else '❌ Not Running'}")
    print(f"Database: {'✅ Accessible' if database_ok else '❌ Not Accessible'}")
    
    if backend_ok and frontend_ok and database_ok:
        print("\n🎉 All systems are operational!")
        print("\n📱 Access your application at:")
        print("   Frontend: http://localhost:5173")
        print("   Backend API: http://localhost:5000")
        print("\n🔗 Navigation buttons are available on the dashboard:")
        print("   - Edit Profile button")
        print("   - Create Post button")
    else:
        print("\n⚠️  Some systems are not running properly.")
        print("Please check the server status and try again.")

if __name__ == '__main__':
    main() 