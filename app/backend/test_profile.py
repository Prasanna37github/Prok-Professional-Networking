#!/usr/bin/env python3
"""
Test script for profile backend functionality
"""

import requests
import json
import os

BASE_URL = "http://localhost:5000"

def test_profile_endpoints():
    """Test all profile endpoints"""
    
    print("🧪 Testing Profile Backend Endpoints")
    print("=" * 50)
    
    # Test 1: Signup a test user
    print("\n1. Testing user signup...")
    signup_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/signup", json=signup_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test 2: Login to get token
    print("\n2. Testing user login...")
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/login", json=login_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        
        if 'token' in result:
            token = result['token']
            headers = {"Authorization": f"Bearer {token}"}
            print(f"   ✅ Token obtained successfully")
        else:
            print(f"   ❌ Failed to get token")
            return
            
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test 3: Get profile (should be empty initially)
    print("\n3. Testing get profile...")
    try:
        response = requests.get(f"{BASE_URL}/api/profile", headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Update profile
    print("\n4. Testing profile update...")
    profile_data = {
        "name": "John Doe",
        "title": "Software Engineer",
        "location": "San Francisco, CA",
        "bio": "Passionate developer with 5+ years of experience.",
        "phone": "123-456-7890",
        "skills": ["React", "Node.js", "Python", "TypeScript"],
        "socials": [
            {"platform": "LinkedIn", "url": "https://linkedin.com/in/johndoe", "icon": "/linkedin.svg"},
            {"platform": "GitHub", "url": "https://github.com/johndoe", "icon": "/github.svg"}
        ],
        "experience": [
            {
                "role": "Senior Developer",
                "company": "TechCorp",
                "duration": "2022-Present",
                "description": "Leading a team of frontend engineers."
            }
        ],
        "education": [
            {
                "degree": "B.Sc. Computer Science",
                "institution": "Stanford University",
                "duration": "2015-2019"
            }
        ]
    }
    
    try:
        response = requests.put(f"{BASE_URL}/api/profile", json=profile_data, headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Get updated profile
    print("\n5. Testing get updated profile...")
    try:
        response = requests.get(f"{BASE_URL}/api/profile", headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: Update skills separately
    print("\n6. Testing skills update...")
    skills_data = {"skills": ["React", "Node.js", "Python", "TypeScript", "Docker"]}
    try:
        response = requests.put(f"{BASE_URL}/api/profile/skills", json=skills_data, headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 7: Update experience separately
    print("\n7. Testing experience update...")
    experience_data = {
        "experience": [
            {
                "role": "Senior Developer",
                "company": "TechCorp",
                "duration": "2022-Present",
                "description": "Leading a team of frontend engineers."
            },
            {
                "role": "Developer",
                "company": "Webify",
                "duration": "2019-2022",
                "description": "Built scalable web applications."
            }
        ]
    }
    try:
        response = requests.put(f"{BASE_URL}/api/profile/experience", json=experience_data, headers=headers)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n✅ Profile backend tests completed!")

if __name__ == "__main__":
    test_profile_endpoints() 