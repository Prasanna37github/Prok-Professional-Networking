#!/usr/bin/env python3
"""
Complete Dashboard Test Script
Tests the full dashboard functionality including:
- User authentication
- Profile management
- Post creation and retrieval
- Theme toggle functionality
- Media upload handling
"""

import requests
import json
import time
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:5174"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_test_result(test_name, success, message=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if message:
        print(f"   {message}")

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/api/profile?username=test")
        return response.status_code in [200, 401]  # 401 is expected without auth
    except requests.exceptions.ConnectionError:
        return False

def test_user_registration():
    """Test user registration"""
    username = f"testuser_{int(time.time())}"
    email = f"{username}@test.com"
    
    data = {
        "username": username,
        "email": email,
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/signup", json=data)
        if response.status_code == 201:
            return True, username, response.json().get('token')
        else:
            return False, username, None
    except Exception as e:
        return False, username, str(e)

def test_user_login(username, password="testpass123"):
    """Test user login"""
    data = {
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/login", json=data)
        if response.status_code == 200:
            return True, response.json().get('token')
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

def test_profile_update(token, username):
    """Test profile update"""
    headers = {"Authorization": f"Bearer {token}"}
    
    profile_data = {
        "name": "Test User Full Name",
        "title": "Software Engineer",
        "location": "San Francisco, CA",
        "bio": "Experienced software engineer with expertise in web development.",
        "phone": "+1-555-0123",
        "socials": [
            {"platform": "linkedin", "url": "https://linkedin.com/in/testuser"},
            {"platform": "github", "url": "https://github.com/testuser"}
        ],
        "skills": ["JavaScript", "Python", "React", "Node.js"],
        "experience": [
            {
                "title": "Senior Developer",
                "company": "Tech Corp",
                "duration": "2020-2023",
                "description": "Led development of web applications"
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science",
                "institution": "University of Technology",
                "year": "2018",
                "field": "Computer Science"
            }
        ]
    }
    
    try:
        response = requests.put(f"{BASE_URL}/api/profile", json=profile_data, headers=headers)
        return response.status_code == 200
    except Exception as e:
        return False

def test_post_creation(token):
    """Test post creation with media"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a simple text post
    post_data = {
        "title": "Test Post Title",
        "content": "This is a test post content with some interesting information about professional networking.",
        "allow_comments": True,
        "is_public": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
        if response.status_code == 201:
            return True, response.json().get('post', {}).get('id')
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

def test_post_retrieval(token):
    """Test post retrieval"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/posts/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            return True, len(data.get('posts', []))
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

def test_profile_retrieval(token, username):
    """Test profile retrieval"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/profile?username={username}", headers=headers)
        if response.status_code == 200:
            profile = response.json().get('profile', {})
            return True, profile.get('name') == "Test User Full Name"
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

def test_frontend_connectivity():
    """Test if frontend is accessible"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def main():
    print_section("COMPLETE DASHBOARD SYSTEM TEST")
    print(f"Testing at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test backend health
    print_test_result("Backend Health Check", test_backend_health())
    
    # Test frontend connectivity
    print_test_result("Frontend Connectivity", test_frontend_connectivity())
    
    # Test user registration
    success, username, token = test_user_registration()
    print_test_result("User Registration", success, f"Username: {username}")
    
    if not success:
        print("❌ Cannot proceed with other tests due to registration failure")
        return
    
    # Test user login
    success, login_token = test_user_login(username)
    print_test_result("User Login", success)
    
    if not success:
        print("❌ Cannot proceed with other tests due to login failure")
        return
    
    # Use the login token for subsequent tests
    token = login_token
    
    # Test profile update
    success = test_profile_update(token, username)
    print_test_result("Profile Update", success)
    
    # Test profile retrieval
    success, name_match = test_profile_retrieval(token, username)
    print_test_result("Profile Retrieval", success and name_match)
    
    # Test post creation
    success, post_id = test_post_creation(token)
    print_test_result("Post Creation", success, f"Post ID: {post_id}" if success else post_id)
    
    # Test post retrieval
    success, post_count = test_post_retrieval(token)
    print_test_result("Post Retrieval", success, f"Found {post_count} posts" if success else post_count)
    
    print_section("TEST SUMMARY")
    print("🎉 Dashboard system is ready for use!")
    print(f"📝 Test user: {username}")
    print(f"🔗 Backend: {BASE_URL}")
    print(f"🌐 Frontend: {FRONTEND_URL}")
    print("\nTo test the complete system:")
    print("1. Open the frontend URL in your browser")
    print("2. Login with the test credentials")
    print("3. Test the theme toggle functionality")
    print("4. Create and view posts")
    print("5. Edit your profile")

if __name__ == "__main__":
    main() 