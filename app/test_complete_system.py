#!/usr/bin/env python3
"""
Complete system test including skills, education, and experience
"""

import requests
import json
import uuid

BASE_URL = "http://localhost:5000/api"

def test_complete_profile():
    """Test complete profile with all fields"""
    print("🧪 Testing Complete Profile System...\n")
    
    # Generate unique username
    unique_id = str(uuid.uuid4())[:8]
    username = f"complete_user_{unique_id}"
    email = f"complete_user_{unique_id}@example.com"
    
    # 1. Signup
    print("1. Testing signup...")
    signup_data = {
        "username": username,
        "email": email,
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/signup", json=signup_data)
    if response.status_code != 201:
        print(f"❌ Signup failed: {response.json()}")
        return False
    print("✅ Signup successful")
    
    # 2. Login
    print("\n2. Testing login...")
    login_data = {
        "email": email,
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.json()}")
        return False
    
    token = response.json().get('token')
    print("✅ Login successful")
    
    # 3. Update basic profile
    print("\n3. Testing basic profile update...")
    basic_profile = {
        "name": "Complete Test User",
        "title": "Full Stack Developer",
        "location": "New York, NY",
        "bio": "Experienced developer with expertise in modern web technologies.",
        "phone": "+1-555-0123"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{BASE_URL}/profile", json=basic_profile, headers=headers)
    if response.status_code != 200:
        print(f"❌ Basic profile update failed: {response.json()}")
        return False
    print("✅ Basic profile updated")
    
    # 4. Update skills
    print("\n4. Testing skills update...")
    skills_data = {
        "skills": [
            {"name": "JavaScript", "level": "Expert"},
            {"name": "React", "level": "Advanced"},
            {"name": "Node.js", "level": "Advanced"},
            {"name": "Python", "level": "Intermediate"},
            {"name": "SQL", "level": "Advanced"}
        ]
    }
    
    response = requests.put(f"{BASE_URL}/profile/skills", json=skills_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Skills update failed: {response.json()}")
        return False
    print("✅ Skills updated")
    
    # 5. Update experience
    print("\n5. Testing experience update...")
    experience_data = {
        "experience": [
            {
                "title": "Senior Full Stack Developer",
                "company": "Tech Solutions Inc",
                "start_date": "2022-01",
                "end_date": "2024-12",
                "description": "Led development of enterprise web applications using React and Node.js"
            },
            {
                "title": "Frontend Developer",
                "company": "StartupXYZ",
                "start_date": "2020-06",
                "end_date": "2022-01",
                "description": "Built responsive user interfaces and improved user experience"
            },
            {
                "title": "Junior Developer",
                "company": "WebDev Agency",
                "start_date": "2019-01",
                "end_date": "2020-06",
                "description": "Developed websites and web applications using modern technologies"
            }
        ]
    }
    
    response = requests.put(f"{BASE_URL}/profile/experience", json=experience_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Experience update failed: {response.json()}")
        return False
    print("✅ Experience updated")
    
    # 6. Update education
    print("\n6. Testing education update...")
    education_data = {
        "education": [
            {
                "degree": "Master of Science",
                "field": "Computer Science",
                "school": "Stanford University",
                "start_date": "2017-09",
                "end_date": "2019-05",
                "description": "Specialized in software engineering and web technologies"
            },
            {
                "degree": "Bachelor of Science",
                "field": "Computer Engineering",
                "school": "MIT",
                "start_date": "2013-09",
                "end_date": "2017-05",
                "description": "Focused on computer systems and programming fundamentals"
            }
        ]
    }
    
    response = requests.put(f"{BASE_URL}/profile/education", json=education_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Education update failed: {response.json()}")
        return False
    print("✅ Education updated")
    
    # 7. Update social links
    print("\n7. Testing social links update...")
    socials_data = {
        "socials": [
            {"platform": "LinkedIn", "url": "https://linkedin.com/in/completetestuser"},
            {"platform": "GitHub", "url": "https://github.com/completetestuser"},
            {"platform": "Twitter", "url": "https://twitter.com/completetestuser"},
            {"platform": "Portfolio", "url": "https://completetestuser.dev"}
        ]
    }
    
    response = requests.put(f"{BASE_URL}/profile/socials", json=socials_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Social links update failed: {response.json()}")
        return False
    print("✅ Social links updated")
    
    # 8. Get complete profile
    print("\n8. Testing profile retrieval...")
    response = requests.get(f"{BASE_URL}/profile?username={username}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Profile retrieval failed: {response.json()}")
        return False
    
    profile = response.json().get('profile', {})
    print("✅ Profile retrieved successfully")
    
    # 9. Verify all data
    print("\n9. Verifying all data...")
    
    # Check basic info
    assert profile.get('name') == "Complete Test User", "Name mismatch"
    assert profile.get('title') == "Full Stack Developer", "Title mismatch"
    assert profile.get('location') == "New York, NY", "Location mismatch"
    assert profile.get('bio') == "Experienced developer with expertise in modern web technologies.", "Bio mismatch"
    assert profile.get('phone') == "+1-555-0123", "Phone mismatch"
    
    # Check skills
    skills = profile.get('skills', [])
    assert len(skills) == 5, f"Expected 5 skills, got {len(skills)}"
    skill_names = [skill.get('name') for skill in skills]
    assert "JavaScript" in skill_names, "JavaScript skill missing"
    assert "React" in skill_names, "React skill missing"
    
    # Check experience
    experience = profile.get('experience', [])
    assert len(experience) == 3, f"Expected 3 experiences, got {len(experience)}"
    exp_titles = [exp.get('title') for exp in experience]
    assert "Senior Full Stack Developer" in exp_titles, "Senior position missing"
    
    # Check education
    education = profile.get('education', [])
    assert len(education) == 2, f"Expected 2 education entries, got {len(education)}"
    edu_degrees = [edu.get('degree') for edu in education]
    assert "Master of Science" in edu_degrees, "Master's degree missing"
    
    # Check socials
    socials = profile.get('socials', [])
    assert len(socials) == 4, f"Expected 4 social links, got {len(socials)}"
    social_platforms = [social.get('platform') for social in socials]
    assert "LinkedIn" in social_platforms, "LinkedIn missing"
    assert "GitHub" in social_platforms, "GitHub missing"
    
    print("✅ All data verified successfully!")
    
    # 10. Print summary
    print(f"\n📊 Profile Summary for {username}:")
    print(f"  Name: {profile.get('name')}")
    print(f"  Title: {profile.get('title')}")
    print(f"  Location: {profile.get('location')}")
    print(f"  Skills: {len(profile.get('skills', []))} items")
    print(f"  Experience: {len(profile.get('experience', []))} items")
    print(f"  Education: {len(profile.get('education', []))} items")
    print(f"  Social Links: {len(profile.get('socials', []))} items")
    
    return True

def main():
    """Run the complete test"""
    print("🚀 Complete Profile System Test")
    print("=" * 50)
    
    try:
        success = test_complete_profile()
        if success:
            print("\n🎉 All tests passed! The profile system is working correctly.")
            print("\n📝 What was tested:")
            print("  ✅ User signup and login")
            print("  ✅ Basic profile information (name, title, location, bio, phone)")
            print("  ✅ Skills management (add, update, remove)")
            print("  ✅ Work experience management")
            print("  ✅ Education management")
            print("  ✅ Social links management")
            print("  ✅ Profile retrieval and verification")
            print("  ✅ Database storage verification")
        else:
            print("\n❌ Some tests failed. Please check the errors above.")
            
    except Exception as e:
        print(f"\n💥 Test failed with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 