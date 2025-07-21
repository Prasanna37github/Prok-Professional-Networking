#!/usr/bin/env python3
"""
Test script to verify backend connectivity and CORS
"""

import requests
import json
import sys

def test_backend(base_url):
    """Test backend endpoints"""
    print(f"🔍 Testing backend at: {base_url}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test CORS endpoint
    try:
        response = requests.get(f"{base_url}/api/test-cors")
        print(f"✅ CORS test: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False
    
    # Test OPTIONS request (preflight)
    try:
        response = requests.options(f"{base_url}/api/test-cors")
        print(f"✅ OPTIONS test: {response.status_code}")
        print(f"   CORS headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ OPTIONS test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Test local backend
    print("🌐 Testing local backend...")
    local_success = test_backend("http://localhost:5000")
    
    # Test deployed backend (if URL provided)
    if len(sys.argv) > 1:
        deployed_url = sys.argv[1]
        print(f"\n🌐 Testing deployed backend at {deployed_url}...")
        deployed_success = test_backend(deployed_url)
        
        if deployed_success:
            print("\n🎉 Deployed backend is working!")
        else:
            print("\n❌ Deployed backend has issues!")
    else:
        print("\n💡 To test deployed backend, run:")
        print("   python test_backend.py https://your-backend.onrender.com") 