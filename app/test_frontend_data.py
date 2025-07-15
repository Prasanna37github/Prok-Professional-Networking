#!/usr/bin/env python3
"""
Test to verify the data structure being sent to frontend
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_data_structure():
    """Test the data structure being sent to frontend"""
    print("🧪 Testing Frontend Data Structure...\n")
    
    # Login with existing user (using bhuvanesh which we know exists)
    login_data = {
        "email": "bhu@gmail.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/login", json=login_data)
    if response.status_code != 200:
        print("❌ Login failed")
        return
    
    token = response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get profile data
    response = requests.get(f"{BASE_URL}/profile?username=bhuvanesh", headers=headers)
    if response.status_code != 200:
        print("❌ Profile fetch failed")
        return
    
    profile = response.json().get('profile', {})
    
    print("📊 Profile Data Structure:")
    print(f"  Name: {type(profile.get('name'))} = {profile.get('name')}")
    print(f"  Title: {type(profile.get('title'))} = {profile.get('title')}")
    print(f"  Bio: {type(profile.get('bio'))} = {profile.get('bio')}")
    print(f"  Skills: {type(profile.get('skills'))} = {profile.get('skills')}")
    print(f"  Experience: {type(profile.get('experience'))} = {profile.get('experience')}")
    print(f"  Education: {type(profile.get('education'))} = {profile.get('education')}")
    print(f"  Socials: {type(profile.get('socials'))} = {profile.get('socials')}")
    
    # Verify data types
    print("\n🔍 Data Type Verification:")
    
    # Check if skills is a list
    skills = profile.get('skills', [])
    if isinstance(skills, list):
        print("✅ Skills is a list")
        if skills:
            first_skill = skills[0]
            if isinstance(first_skill, dict) and 'name' in first_skill and 'level' in first_skill:
                print("✅ Skills have correct structure (name, level)")
            else:
                print("❌ Skills structure incorrect")
        else:
            print("ℹ️ Skills list is empty")
    else:
        print("❌ Skills is not a list")
    
    # Check if experience is a list
    experience = profile.get('experience', [])
    if isinstance(experience, list):
        print("✅ Experience is a list")
        if experience:
            first_exp = experience[0]
            required_fields = ['title', 'company', 'start_date', 'end_date', 'description']
            if isinstance(first_exp, dict) and all(field in first_exp for field in required_fields):
                print("✅ Experience has correct structure")
            else:
                print("❌ Experience structure incorrect")
        else:
            print("ℹ️ Experience list is empty")
    else:
        print("❌ Experience is not a list")
    
    # Check if education is a list
    education = profile.get('education', [])
    if isinstance(education, list):
        print("✅ Education is a list")
        if education:
            first_edu = education[0]
            required_fields = ['degree', 'field', 'school', 'start_date', 'end_date', 'description']
            if isinstance(first_edu, dict) and all(field in first_edu for field in required_fields):
                print("✅ Education has correct structure")
            else:
                print("❌ Education structure incorrect")
        else:
            print("ℹ️ Education list is empty")
    else:
        print("❌ Education is not a list")
    
    # Check if socials is a list
    socials = profile.get('socials', [])
    if isinstance(socials, list):
        print("✅ Socials is a list")
        if socials:
            first_social = socials[0]
            if isinstance(first_social, dict) and 'platform' in first_social and 'url' in first_social:
                print("✅ Socials have correct structure (platform, url)")
            else:
                print("❌ Socials structure incorrect")
        else:
            print("ℹ️ Socials list is empty")
    else:
        print("❌ Socials is not a list")
    
    print("\n🎯 Frontend should now handle all data types correctly!")

if __name__ == "__main__":
    test_data_structure() 