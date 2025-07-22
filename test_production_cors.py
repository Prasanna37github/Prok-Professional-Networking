#!/usr/bin/env python3
"""
Test production CORS configuration
"""

import requests
import json

def test_production_cors():
    """Test the production backend CORS configuration"""
    base_url = "https://prok-backend-pmng.onrender.com"
    
    print(f"🔍 Testing production backend: {base_url}")
    print("=" * 60)
    
    # Test 1: Health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"   ✅ Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   📄 Response: {response.json()}")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 2: OPTIONS preflight for signup
    print("\n2. Testing OPTIONS preflight for signup...")
    try:
        response = requests.options(f"{base_url}/api/signup")
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📋 CORS Headers:")
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        for header, value in cors_headers.items():
            print(f"      {header}: {value}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 3: POST signup (with empty data to test CORS)
    print("\n3. Testing POST signup (CORS test)...")
    try:
        response = requests.post(
            f"{base_url}/api/signup",
            json={},
            headers={'Content-Type': 'application/json'}
        )
        print(f"   ✅ Status: {response.status_code}")
        if response.status_code == 400:
            print(f"   📄 Expected error: {response.json()}")
        else:
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 4: Test with Origin header
    print("\n4. Testing with Origin header...")
    try:
        response = requests.options(
            f"{base_url}/api/signup",
            headers={
                'Origin': 'https://prok-frontend-pmng.onrender.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        )
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📋 Origin Response: {response.headers.get('Access-Control-Allow-Origin')}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")

if __name__ == "__main__":
    test_production_cors() 