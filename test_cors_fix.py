#!/usr/bin/env python3
"""
Comprehensive CORS and API test script for production deployment
"""

import requests
import json
import sys
import os

def test_backend(base_url):
    """Test backend endpoints and CORS configuration"""
    print(f"🔍 Testing backend at: {base_url}")
    print("=" * 60)
    
    # Test 1: Health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"   ✅ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   📄 Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
        return False
    
    # Test 2: CORS test endpoint
    print("\n2. Testing CORS endpoint...")
    try:
        response = requests.get(f"{base_url}/api/test-cors")
        print(f"   ✅ CORS test: {response.status_code}")
        if response.status_code == 200:
            print(f"   📄 Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}")
        return False
    
    # Test 3: OPTIONS preflight request
    print("\n3. Testing OPTIONS preflight...")
    try:
        response = requests.options(f"{base_url}/api/test-cors")
        print(f"   ✅ OPTIONS test: {response.status_code}")
        print(f"   📋 CORS headers:")
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
            'Access-Control-Max-Age': response.headers.get('Access-Control-Max-Age')
        }
        for header, value in cors_headers.items():
            print(f"      {header}: {value}")
    except Exception as e:
        print(f"   ❌ OPTIONS test failed: {e}")
        return False
    
    # Test 4: Signup endpoint (without data)
    print("\n4. Testing signup endpoint...")
    try:
        response = requests.post(f"{base_url}/api/signup", 
                               json={}, 
                               headers={'Content-Type': 'application/json'})
        print(f"   ✅ Signup endpoint: {response.status_code}")
        if response.status_code == 400:
            print(f"   📄 Expected error response: {response.json()}")
        else:
            print(f"   ⚠️  Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ❌ Signup test failed: {e}")
        return False
    
    # Test 5: Login endpoint (without data)
    print("\n5. Testing login endpoint...")
    try:
        response = requests.post(f"{base_url}/api/login", 
                               json={}, 
                               headers={'Content-Type': 'application/json'})
        print(f"   ✅ Login endpoint: {response.status_code}")
        if response.status_code == 401:
            print(f"   📄 Expected error response: {response.json()}")
        else:
            print(f"   ⚠️  Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ❌ Login test failed: {e}")
        return False
    
    # Test 6: Root endpoint
    print("\n6. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   ✅ Root endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"   📄 Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ❌ Root test failed: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ All tests completed successfully!")
    return True

def test_frontend_config():
    """Test frontend environment configuration"""
    print("\n🔍 Testing Frontend Configuration")
    print("=" * 60)
    
    # Check if VITE_API_URL is set
    api_url = os.getenv('VITE_API_URL')
    if api_url:
        print(f"✅ VITE_API_URL is set: {api_url}")
    else:
        print("❌ VITE_API_URL is not set")
        print("   Please set VITE_API_URL in your frontend environment")
    
    return True

def main():
    """Main test function"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:5000"
    
    print("🚀 CORS and API Configuration Test")
    print("=" * 60)
    
    # Test backend
    backend_ok = test_backend(base_url)
    
    # Test frontend config
    frontend_ok = test_frontend_config()
    
    print("\n" + "=" * 60)
    if backend_ok and frontend_ok:
        print("🎉 All tests passed! Your deployment should work correctly.")
        print("\n📋 Next steps:")
        print("1. Deploy your backend to Render")
        print("2. Set VITE_API_URL in your frontend environment")
        print("3. Deploy your frontend to Render")
        print("4. Test the signup/login functionality")
    else:
        print("❌ Some tests failed. Please check the issues above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 