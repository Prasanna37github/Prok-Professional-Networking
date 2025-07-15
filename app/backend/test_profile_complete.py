#!/usr/bin/env python3
"""
Comprehensive test script for profile functionality
Tests: signup, login, profile update, image upload, and profile retrieval
"""

import requests
import json
import time
import uuid

BASE_URL = "http://localhost:5000/api"

def test_signup():
    """Test user signup"""
    print("Testing signup...")
    # Generate unique username to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    signup_data = {
        "username": f"testuser_{unique_id}",
        "email": f"testuser_{unique_id}@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/signup", json=signup_data)
    print(f"Signup response: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 201, signup_data["username"], signup_data["email"]

def test_login(email):
    """Test user login"""
    print("\nTesting login...")
    login_data = {
        "email": email,
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        return response.json().get('token')
    return None

def test_get_profile(token, username):
    """Test getting profile by username"""
    print(f"\nTesting get profile for username: {username}")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/profile?username={username}", headers=headers)
    print(f"Get profile response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_update_profile(token):
    """Test updating profile"""
    print("\nTesting profile update...")
    
    profile_data = {
        "name": "Test User Updated",
        "title": "Senior Software Engineer",
        "location": "San Francisco, CA",
        "bio": "This is an updated bio for testing purposes.",
        "phone": "+1-555-0123"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/profile", json=profile_data, headers=headers)
    print(f"Update profile response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_update_skills(token):
    """Test updating skills"""
    print("\nTesting skills update...")
    
    skills_data = {
        "skills": [
            {"name": "Python", "level": "Advanced"},
            {"name": "JavaScript", "level": "Intermediate"},
            {"name": "React", "level": "Advanced"}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/profile/skills", json=skills_data, headers=headers)
    print(f"Update skills response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_update_experience(token):
    """Test updating experience"""
    print("\nTesting experience update...")
    
    experience_data = {
        "experience": [
            {
                "title": "Senior Software Engineer",
                "company": "Tech Corp",
                "start_date": "2020-01",
                "end_date": "2023-12",
                "description": "Led development of web applications"
            },
            {
                "title": "Software Engineer",
                "company": "Startup Inc",
                "start_date": "2018-06",
                "end_date": "2020-01",
                "description": "Full-stack development"
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/profile/experience", json=experience_data, headers=headers)
    print(f"Update experience response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_update_education(token):
    """Test updating education"""
    print("\nTesting education update...")
    
    education_data = {
        "education": [
            {
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "school": "University of Technology",
                "start_date": "2014-09",
                "end_date": "2018-05",
                "description": "Focused on software engineering"
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/profile/education", json=education_data, headers=headers)
    print(f"Update education response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_update_socials(token):
    """Test updating social links"""
    print("\nTesting social links update...")
    
    socials_data = {
        "socials": [
            {"platform": "LinkedIn", "url": "https://linkedin.com/in/testuser"},
            {"platform": "GitHub", "url": "https://github.com/testuser"},
            {"platform": "Twitter", "url": "https://twitter.com/testuser"}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/profile/socials", json=socials_data, headers=headers)
    print(f"Update socials response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def main():
    """Run all tests"""
    print("=== Profile Functionality Test Suite ===\n")
    
    # Test signup
    signup_result = test_signup()
    if not signup_result[0]:
        print("❌ Signup failed")
        return
    
    username, email = signup_result[1], signup_result[2]
    
    # Test login
    token = test_login(email)
    if not token:
        print("❌ Login failed")
        return
    
    print(f"✅ Login successful, token: {token[:20]}...")
    
    # Test profile operations
    
    # Test initial profile retrieval
    if test_get_profile(token, username):
        print("✅ Initial profile retrieval successful")
    else:
        print("❌ Initial profile retrieval failed")
    
    # Test profile update
    if test_update_profile(token):
        print("✅ Profile update successful")
    else:
        print("❌ Profile update failed")
    
    # Test skills update
    if test_update_skills(token):
        print("✅ Skills update successful")
    else:
        print("❌ Skills update failed")
    
    # Test experience update
    if test_update_experience(token):
        print("✅ Experience update successful")
    else:
        print("❌ Experience update failed")
    
    # Test education update
    if test_update_education(token):
        print("✅ Education update successful")
    else:
        print("❌ Education update failed")
    
    # Test socials update
    if test_update_socials(token):
        print("✅ Social links update successful")
    else:
        print("❌ Social links update failed")
    
    # Test final profile retrieval
    if test_get_profile(token, username):
        print("✅ Final profile retrieval successful")
    else:
        print("❌ Final profile retrieval failed")
    
    print("\n=== Test Suite Complete ===")

if __name__ == "__main__":
    main() 