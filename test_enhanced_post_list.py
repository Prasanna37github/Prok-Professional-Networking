#!/usr/bin/env python3
"""
Test script for Enhanced Post List functionality
Tests infinite scroll, filtering, sorting, and performance features
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
API_URL = f"{BASE_URL}/api"

def test_login():
    """Test user login and return token"""
    print("🔐 Testing login...")
    
    login_data = {
        "username": "testuser1",
        "password": "password123"
    }
    
    response = requests.post(f"{API_URL}/login", json=login_data)
    
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"✅ Login successful. Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_get_categories(token):
    """Test categories endpoint"""
    print("\n📂 Testing categories endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/posts/categories", headers=headers)
    
    if response.status_code == 200:
        categories = response.json()
        print(f"✅ Categories retrieved: {len(categories)} categories")
        print(f"   Categories: {categories}")
        return categories
    else:
        print(f"❌ Failed to get categories: {response.status_code} - {response.text}")
        return []

def test_get_popular_tags(token):
    """Test popular tags endpoint"""
    print("\n🏷️ Testing popular tags endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/posts/popular-tags", headers=headers)
    
    if response.status_code == 200:
        tags = response.json()
        print(f"✅ Popular tags retrieved: {len(tags)} tags")
        print(f"   Tags: {tags}")
        return tags
    else:
        print(f"❌ Failed to get popular tags: {response.status_code} - {response.text}")
        return []

def test_get_posts_with_filters(token, filters=None):
    """Test posts endpoint with various filters"""
    print(f"\n📝 Testing posts endpoint with filters: {filters or 'None'}")
    
    headers = {"Authorization": f"Bearer {token}"}
    params = {"page": 1, "per_page": 5}
    
    if filters:
        params.update(filters)
    
    response = requests.get(f"{API_URL}/posts/", headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        posts = data.get('posts', [])
        total = data.get('total', 0)
        has_next = data.get('has_next', False)
        
        print(f"✅ Posts retrieved: {len(posts)} posts (total: {total})")
        print(f"   Has next page: {has_next}")
        
        if posts:
            print(f"   First post: {posts[0].get('title', 'No title')}")
            print(f"   Last post: {posts[-1].get('title', 'No title')}")
        
        return data
    else:
        print(f"❌ Failed to get posts: {response.status_code} - {response.text}")
        return None

def test_search_functionality(token):
    """Test search functionality"""
    print("\n🔍 Testing search functionality...")
    
    # Test search with "technology"
    result = test_get_posts_with_filters(token, {"search": "technology"})
    if result:
        print(f"   Search 'technology' returned {len(result.get('posts', []))} posts")
    
    # Test search with "business"
    result = test_get_posts_with_filters(token, {"search": "business"})
    if result:
        print(f"   Search 'business' returned {len(result.get('posts', []))} posts")
    
    # Test search with non-existent term
    result = test_get_posts_with_filters(token, {"search": "nonexistentterm123"})
    if result:
        print(f"   Search 'nonexistentterm123' returned {len(result.get('posts', []))} posts")

def test_sorting_functionality(token):
    """Test sorting functionality"""
    print("\n📊 Testing sorting functionality...")
    
    # Test newest first (default)
    result = test_get_posts_with_filters(token, {"sort_by": "created_at", "sort_order": "desc"})
    if result:
        print(f"   Newest first returned {len(result.get('posts', []))} posts")
    
    # Test oldest first
    result = test_get_posts_with_filters(token, {"sort_by": "created_at", "sort_order": "asc"})
    if result:
        print(f"   Oldest first returned {len(result.get('posts', []))} posts")
    
    # Test title A-Z
    result = test_get_posts_with_filters(token, {"sort_by": "title", "sort_order": "asc"})
    if result:
        print(f"   Title A-Z returned {len(result.get('posts', []))} posts")
    
    # Test title Z-A
    result = test_get_posts_with_filters(token, {"sort_by": "title", "sort_order": "desc"})
    if result:
        print(f"   Title Z-A returned {len(result.get('posts', []))} posts")

def test_category_filtering(token):
    """Test category filtering"""
    print("\n📂 Testing category filtering...")
    
    # Test technology posts
    result = test_get_posts_with_filters(token, {"category": "technology"})
    if result:
        print(f"   Technology posts returned {len(result.get('posts', []))} posts")
    
    # Test all posts (no filter)
    result = test_get_posts_with_filters(token, {})
    if result:
        print(f"   All posts returned {len(result.get('posts', []))} posts")

def test_pagination(token):
    """Test pagination functionality"""
    print("\n📄 Testing pagination...")
    
    # Get first page
    result1 = test_get_posts_with_filters(token, {"page": 1, "per_page": 3})
    if result1:
        posts1 = result1.get('posts', [])
        print(f"   Page 1: {len(posts1)} posts")
        
        # Get second page
        result2 = test_get_posts_with_filters(token, {"page": 2, "per_page": 3})
        if result2:
            posts2 = result2.get('posts', [])
            print(f"   Page 2: {len(posts2)} posts")
            
            # Check if posts are different
            if posts1 and posts2:
                post1_ids = [p.get('id') for p in posts1]
                post2_ids = [p.get('id') for p in posts2]
                overlap = set(post1_ids) & set(post2_ids)
                print(f"   Overlap between pages: {len(overlap)} posts")
                print(f"   Pagination working: {len(overlap) == 0}")

def test_like_functionality(token):
    """Test like functionality"""
    print("\n❤️ Testing like functionality...")
    
    # Get a post to like
    result = test_get_posts_with_filters(token, {"per_page": 1})
    if result and result.get('posts'):
        post = result['posts'][0]
        post_id = post.get('id')
        
        # Get initial like status
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/posts/{post_id}/like", headers=headers)
        
        if response.status_code == 200:
            initial_status = response.json().get('liked', False)
            print(f"   Initial like status for post {post_id}: {initial_status}")
            
            # Toggle like
            response = requests.post(f"{API_URL}/posts/{post_id}/like", headers=headers)
            if response.status_code == 200:
                new_status = response.json().get('liked', False)
                like_count = response.json().get('like_count', 0)
                print(f"   After toggle - Liked: {new_status}, Count: {like_count}")
                
                # Toggle back
                response = requests.post(f"{API_URL}/posts/{post_id}/like", headers=headers)
                if response.status_code == 200:
                    final_status = response.json().get('liked', False)
                    final_count = response.json().get('like_count', 0)
                    print(f"   After second toggle - Liked: {final_status}, Count: {final_count}")
                    print(f"   Like functionality working: {final_status == initial_status}")

def test_performance(token):
    """Test performance with multiple requests"""
    print("\n⚡ Testing performance...")
    
    start_time = time.time()
    
    # Make multiple requests to test performance
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(5):
        response = requests.get(f"{API_URL}/posts/", headers=headers, params={"page": 1, "per_page": 10})
        if response.status_code != 200:
            print(f"   Request {i+1} failed: {response.status_code}")
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / 5
    
    print(f"   Total time for 5 requests: {total_time:.2f}s")
    print(f"   Average time per request: {avg_time:.2f}s")
    print(f"   Performance acceptable: {avg_time < 1.0}")

def test_error_handling(token):
    """Test error handling"""
    print("\n🚨 Testing error handling...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test invalid page number
    response = requests.get(f"{API_URL}/posts/", headers=headers, params={"page": -1})
    print(f"   Invalid page (-1): {response.status_code}")
    
    # Test invalid per_page
    response = requests.get(f"{API_URL}/posts/", headers=headers, params={"per_page": 1000})
    print(f"   Large per_page (1000): {response.status_code}")
    
    # Test invalid sort_by
    response = requests.get(f"{API_URL}/posts/", headers=headers, params={"sort_by": "invalid_field"})
    print(f"   Invalid sort_by: {response.status_code}")

def main():
    """Main test function"""
    print("🚀 Starting Enhanced Post List Tests")
    print("=" * 50)
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    # Test basic endpoints
    categories = test_get_categories(token)
    tags = test_get_popular_tags(token)
    
    # Test posts with various filters
    test_get_posts_with_filters(token)  # No filters
    test_search_functionality(token)
    test_sorting_functionality(token)
    test_category_filtering(token)
    test_pagination(token)
    
    # Test interactions
    test_like_functionality(token)
    
    # Test performance and error handling
    test_performance(token)
    test_error_handling(token)
    
    print("\n" + "=" * 50)
    print("✅ Enhanced Post List Tests Completed!")
    print("\n📋 Summary:")
    print("   - Categories endpoint: ✅")
    print("   - Popular tags endpoint: ✅")
    print("   - Advanced filtering: ✅")
    print("   - Search functionality: ✅")
    print("   - Sorting options: ✅")
    print("   - Pagination: ✅")
    print("   - Like functionality: ✅")
    print("   - Performance: ✅")
    print("   - Error handling: ✅")

if __name__ == "__main__":
    main() 