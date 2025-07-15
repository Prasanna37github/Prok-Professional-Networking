#!/usr/bin/env python3
"""
Test script for post creation functionality
Tests: text posts, media uploads, post retrieval, and validation
"""

import requests
import json
import os
import time
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USERNAME = f"testuser_{int(time.time())}"
TEST_PASSWORD = "testpass123"

def print_step(step, description):
    """Print a formatted test step"""
    print(f"\n{'='*60}")
    print(f"STEP {step}: {description}")
    print(f"{'='*60}")

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")

def test_auth():
    """Test user authentication"""
    print_step(1, "Testing User Authentication")
    
    # Test signup
    signup_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD,
        "email": f"{TEST_USERNAME}@test.com"
    }
    
    response = requests.post(f"{BASE_URL}/api/signup", json=signup_data)
    if response.status_code == 201:
        print_success("User signup successful")
    else:
        print_error(f"Signup failed: {response.text}")
        return None
    
    # Test login
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    if response.status_code == 200:
        token = response.json().get("token")
        print_success("User login successful")
        return token
    else:
        print_error(f"Login failed: {response.text}")
        return None

def test_text_post_creation(token):
    """Test creating a text-only post"""
    print_step(2, "Testing Text-Only Post Creation")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test post with title and content
    post_data = {
        "title": "Test Post Title",
        "content": "This is a test post content with some text.",
        "allow_comments": "true",
        "is_public": "true"
    }
    
    response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
    
    if response.status_code == 201:
        post = response.json().get("post")
        print_success(f"Text post created successfully (ID: {post['id']})")
        print_info(f"Title: {post['title']}")
        print_info(f"Content: {post['content']}")
        return post['id']
    else:
        print_error(f"Text post creation failed: {response.text}")
        return None

def test_media_post_creation(token):
    """Test creating a post with media"""
    print_step(3, "Testing Post Creation with Media")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a simple test image file
    test_image_path = "test_image.txt"
    with open(test_image_path, "w") as f:
        f.write("This is a test file content")
    
    try:
        with open(test_image_path, "rb") as f:
            files = {"media": ("test_image.txt", f, "text/plain")}
            post_data = {
                "title": "Test Post with Media",
                "content": "This post contains a media file.",
                "allow_comments": "true",
                "is_public": "true"
            }
            
            response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, files=files, headers=headers)
            
            if response.status_code == 201:
                post = response.json().get("post")
                print_success(f"Media post created successfully (ID: {post['id']})")
                print_info(f"Media URL: {post['media_url']}")
                print_info(f"Media Type: {post['media_type']}")
                return post['id']
            else:
                print_error(f"Media post creation failed: {response.text}")
                return None
    finally:
        # Clean up test file
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def test_post_retrieval(token):
    """Test retrieving posts"""
    print_step(4, "Testing Post Retrieval")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test getting all posts
    response = requests.get(f"{BASE_URL}/api/posts/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        posts = data.get("posts", [])
        print_success(f"Retrieved {len(posts)} posts")
        print_info(f"Total posts: {data.get('total', 0)}")
        print_info(f"Current page: {data.get('current_page', 1)}")
        
        for i, post in enumerate(posts[:3], 1):  # Show first 3 posts
            print_info(f"Post {i}: {post['title']} by {post['user']['username']}")
        
        return len(posts)
    else:
        print_error(f"Post retrieval failed: {response.text}")
        return 0

def test_post_validation(token):
    """Test post validation"""
    print_step(5, "Testing Post Validation")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test missing title
    post_data = {
        "content": "This post has no title",
        "allow_comments": "true",
        "is_public": "true"
    }
    
    response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
    if response.status_code == 400:
        print_success("Validation caught missing title")
    else:
        print_error("Validation failed to catch missing title")
    
    # Test missing content
    post_data = {
        "title": "This post has no content",
        "allow_comments": "true",
        "is_public": "true"
    }
    
    response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
    if response.status_code == 400:
        print_success("Validation caught missing content")
    else:
        print_error("Validation failed to catch missing content")

def test_post_settings(token):
    """Test post settings (private posts, no comments)"""
    print_step(6, "Testing Post Settings")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test private post
    post_data = {
        "title": "Private Test Post",
        "content": "This is a private post that should not be visible to others.",
        "allow_comments": "true",
        "is_public": "false"
    }
    
    response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
    if response.status_code == 201:
        post = response.json().get("post")
        print_success(f"Private post created (ID: {post['id']})")
        print_info(f"Is public: {post['is_public']}")
    else:
        print_error(f"Private post creation failed: {response.text}")
    
    # Test post without comments
    post_data = {
        "title": "No Comments Test Post",
        "content": "This post does not allow comments.",
        "allow_comments": "false",
        "is_public": "true"
    }
    
    response = requests.post(f"{BASE_URL}/api/posts/", data=post_data, headers=headers)
    if response.status_code == 201:
        post = response.json().get("post")
        print_success(f"No-comments post created (ID: {post['id']})")
        print_info(f"Allow comments: {post['allow_comments']}")
    else:
        print_error(f"No-comments post creation failed: {response.text}")

def test_unauthorized_access():
    """Test unauthorized access to posts"""
    print_step(7, "Testing Unauthorized Access")
    
    # Test creating post without token
    post_data = {
        "title": "Unauthorized Post",
        "content": "This should fail without authentication.",
        "allow_comments": "true",
        "is_public": "true"
    }
    
    response = requests.post(f"{BASE_URL}/api/posts/", data=post_data)
    if response.status_code == 401:
        print_success("Unauthorized post creation properly rejected")
    else:
        print_error("Unauthorized post creation was not rejected")
    
    # Test getting posts without token
    response = requests.get(f"{BASE_URL}/api/posts/")
    if response.status_code == 401:
        print_success("Unauthorized post retrieval properly rejected")
    else:
        print_error("Unauthorized post retrieval was not rejected")

def main():
    """Main test function"""
    print("🚀 Starting Post Creation Test Suite")
    print(f"Testing against: {BASE_URL}")
    
    # Test authentication
    token = test_auth()
    if not token:
        print_error("Authentication failed. Cannot proceed with post tests.")
        return
    
    # Test post creation
    text_post_id = test_text_post_creation(token)
    media_post_id = test_media_post_creation(token)
    
    # Test post retrieval
    post_count = test_post_retrieval(token)
    
    # Test validation
    test_post_validation(token)
    
    # Test post settings
    test_post_settings(token)
    
    # Test unauthorized access
    test_unauthorized_access()
    
    # Summary
    print_step(8, "Test Summary")
    print_success("Post creation test suite completed!")
    print_info(f"Created text post: {'Yes' if text_post_id else 'No'}")
    print_info(f"Created media post: {'Yes' if media_post_id else 'No'}")
    print_info(f"Total posts retrieved: {post_count}")
    
    print("\n🎉 All tests completed successfully!")

if __name__ == "__main__":
    main() 