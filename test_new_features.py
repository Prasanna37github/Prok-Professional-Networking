#!/usr/bin/env python3
"""
Test script for the new features implemented:
1. Post interactions (like, comment, share)
2. Rich text editor features
3. Dashboard header cleanup
4. Like functionality backend
"""

import requests
import json
import time
import sys
import os

# Configuration
BASE_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:5173"

def test_backend_health():
    """Test if backend is running"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BASE_URL}/api/posts/")
        if response.status_code == 401:  # Expected - missing auth
            print("✅ Backend is running (401 expected for missing auth)")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_frontend_health():
    """Test if frontend is running"""
    print("🔍 Testing frontend health...")
    try:
        response = requests.get(FRONTEND_URL)
        if response.status_code == 200:
            print("✅ Frontend is running")
            return True
        else:
            print(f"❌ Frontend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    print("🔍 Testing user registration...")
    
    # Test data
    user_data = {
        "username": "testuser_features",
        "email": "testfeatures@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/signup", json=user_data)
        if response.status_code == 201:
            print("✅ User registration successful")
            return response.json().get('token')
        elif response.status_code == 400:
            print("ℹ️ User might already exist, trying login...")
            return test_user_login(user_data)
        else:
            print(f"❌ User registration failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ User registration error: {e}")
        return None

def test_user_login(user_data):
    """Test user login"""
    print("🔍 Testing user login...")
    
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ User login successful")
            return response.json().get('token')
        else:
            print(f"❌ User login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ User login error: {e}")
        return None

def test_create_post(token):
    """Test post creation"""
    print("🔍 Testing post creation...")
    
    headers = {"Authorization": f"Bearer {token}"}
    post_data = {
        "title": "Test Post with Rich Text",
        "content": "This is a **bold** and *italic* test post with [a link](https://example.com) and ![an image](image-url).",
        "allow_comments": True,
        "is_public": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
        if response.status_code == 201:
            print("✅ Post creation successful")
            return response.json().get('post', {}).get('id')
        else:
            print(f"❌ Post creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Post creation error: {e}")
        return None

def test_like_functionality(token, post_id):
    """Test like functionality"""
    print("🔍 Testing like functionality...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Test liking a post
        response = requests.post(f"{BASE_URL}/api/posts/{post_id}/like", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Post liked successfully. Like count: {data.get('like_count', 0)}")
            
            # Test getting like status
            status_response = requests.get(f"{BASE_URL}/api/posts/{post_id}/like", headers=headers)
            if status_response.status_code == 200:
                status_data = status_response.json()
                print(f"✅ Like status retrieved: {status_data.get('liked', False)}")
            
            # Test unliking a post
            unlike_response = requests.post(f"{BASE_URL}/api/posts/{post_id}/like", headers=headers)
            if unlike_response.status_code == 200:
                unlike_data = unlike_response.json()
                print(f"✅ Post unliked successfully. Like count: {unlike_data.get('like_count', 0)}")
                return True
            else:
                print(f"❌ Unlike failed: {unlike_response.status_code}")
                return False
        else:
            print(f"❌ Like failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Like functionality error: {e}")
        return False

def test_get_posts(token):
    """Test getting posts with like counts"""
    print("🔍 Testing posts retrieval with like counts...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/posts/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            posts = data.get('posts', [])
            print(f"✅ Retrieved {len(posts)} posts")
            
            if posts:
                first_post = posts[0]
                like_count = first_post.get('like_count', 0)
                print(f"✅ First post has like_count: {like_count}")
                
                # Check if user data includes name and avatar
                user = first_post.get('user', {})
                if 'name' in user or 'avatar' in user:
                    print("✅ Post user data includes name/avatar fields")
                else:
                    print("⚠️ Post user data missing name/avatar fields")
            
            return True
        else:
            print(f"❌ Posts retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Posts retrieval error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting comprehensive feature tests...")
    print("=" * 50)
    
    # Test server health
    if not test_backend_health():
        print("❌ Backend health check failed. Please start the backend server.")
        return False
    
    if not test_frontend_health():
        print("❌ Frontend health check failed. Please start the frontend server.")
        return False
    
    print("\n" + "=" * 50)
    
    # Test authentication
    token = test_user_registration()
    if not token:
        print("❌ Authentication failed. Cannot proceed with tests.")
        return False
    
    print("\n" + "=" * 50)
    
    # Test post creation
    post_id = test_create_post(token)
    if not post_id:
        print("❌ Post creation failed. Cannot test like functionality.")
        return False
    
    print("\n" + "=" * 50)
    
    # Test like functionality
    like_success = test_like_functionality(token, post_id)
    
    print("\n" + "=" * 50)
    
    # Test posts retrieval
    posts_success = test_get_posts(token)
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Backend Health: PASS")
    print(f"✅ Frontend Health: PASS")
    print(f"✅ Authentication: {'PASS' if token else 'FAIL'}")
    print(f"✅ Post Creation: {'PASS' if post_id else 'FAIL'}")
    print(f"✅ Like Functionality: {'PASS' if like_success else 'FAIL'}")
    print(f"✅ Posts Retrieval: {'PASS' if posts_success else 'FAIL'}")
    
    print("\n" + "=" * 50)
    print("🌐 Manual Testing Instructions:")
    print(f"1. Open your browser and go to: {FRONTEND_URL}")
    print("2. Login with username: testuser_features, password: testpass123")
    print("3. Test the following features:")
    print("   - Dashboard header (should be clean, no duplicate profile images)")
    print("   - Create a new post with rich text features")
    print("   - Like/unlike posts and verify count updates")
    print("   - Click comment button to show input field")
    print("   - Click share button to show modal")
    print("   - Test rich text editor (bold, italic, insert link, add image)")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 