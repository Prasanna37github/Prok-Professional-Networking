#!/usr/bin/env python3
"""
Database verification script to check if profile data is stored correctly
"""

import sqlite3
import json
from datetime import datetime

def verify_database():
    """Verify the database structure and data"""
    print("🔍 Verifying Database Structure and Data...\n")
    
    # Connect to the database
    conn = sqlite3.connect('instance/prok_app.db')
    cursor = conn.cursor()
    
    try:
        # Check if the user table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
        if not cursor.fetchone():
            print("❌ User table does not exist!")
            return
        
        print("✅ User table exists")
        
        # Get table schema
        cursor.execute("PRAGMA table_info(user)")
        columns = cursor.fetchall()
        print(f"📋 Table columns: {[col[1] for col in columns]}")
        
        # Get all users
        cursor.execute("SELECT id, username, email, name, title, location, bio, avatar, phone, socials, skills, experience, education, created_at, updated_at FROM user")
        users = cursor.fetchall()
        
        print(f"\n👥 Found {len(users)} users in database:")
        
        for user in users:
            print(f"\n--- User ID: {user[0]} ---")
            print(f"Username: {user[1]}")
            print(f"Email: {user[2]}")
            print(f"Name: {user[3]}")
            print(f"Title: {user[4]}")
            print(f"Location: {user[5]}")
            print(f"Bio: {user[6]}")
            print(f"Avatar: {user[7]}")
            print(f"Phone: {user[8]}")
            
            # Parse JSON fields
            try:
                socials = json.loads(user[9]) if user[9] else []
                skills = json.loads(user[10]) if user[10] else []
                experience = json.loads(user[11]) if user[11] else []
                education = json.loads(user[12]) if user[12] else []
                
                print(f"Socials: {len(socials)} items")
                for social in socials:
                    print(f"  - {social.get('platform', 'Unknown')}: {social.get('url', 'No URL')}")
                
                print(f"Skills: {len(skills)} items")
                for skill in skills:
                    print(f"  - {skill.get('name', 'Unknown')} ({skill.get('level', 'No Level')})")
                
                print(f"Experience: {len(experience)} items")
                for exp in experience:
                    print(f"  - {exp.get('title', 'Unknown')} at {exp.get('company', 'Unknown Company')}")
                
                print(f"Education: {len(education)} items")
                for edu in education:
                    print(f"  - {edu.get('degree', 'Unknown')} in {edu.get('field', 'Unknown Field')} from {edu.get('school', 'Unknown School')}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing JSON data: {e}")
            
            print(f"Created: {user[13]}")
            print(f"Updated: {user[14]}")
            print("-" * 50)
        
        # Check for recent updates
        print(f"\n🕒 Recent updates (last 24 hours):")
        cursor.execute("""
            SELECT username, name, title, updated_at 
            FROM user 
            WHERE updated_at > datetime('now', '-1 day')
            ORDER BY updated_at DESC
        """)
        recent_updates = cursor.fetchall()
        
        if recent_updates:
            for update in recent_updates:
                print(f"  - {update[0]} ({update[1]} - {update[2]}) updated at {update[3]}")
        else:
            print("  No recent updates found")
        
        # Check for users with complete profiles
        print(f"\n📊 Profile Completion Statistics:")
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN name IS NOT NULL AND name != '' THEN 1 ELSE 0 END) as with_name,
                SUM(CASE WHEN title IS NOT NULL AND title != '' THEN 1 ELSE 0 END) as with_title,
                SUM(CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) as with_location,
                SUM(CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) as with_bio,
                SUM(CASE WHEN avatar IS NOT NULL AND avatar != '' THEN 1 ELSE 0 END) as with_avatar
            FROM user
        """)
        stats = cursor.fetchone()
        
        print(f"  Total users: {stats[0]}")
        print(f"  Users with name: {stats[1]}")
        print(f"  Users with title: {stats[2]}")
        print(f"  Users with location: {stats[3]}")
        print(f"  Users with bio: {stats[4]}")
        print(f"  Users with avatar: {stats[5]}")
        
    except Exception as e:
        print(f"❌ Error verifying database: {e}")
    
    finally:
        conn.close()

def check_uploads_directory():
    """Check if uploads directory exists and has files"""
    import os
    
    print(f"\n📁 Checking uploads directory...")
    uploads_dir = 'uploads'
    
    if os.path.exists(uploads_dir):
        files = os.listdir(uploads_dir)
        print(f"✅ Uploads directory exists with {len(files)} files")
        
        if files:
            print("📸 Uploaded images:")
            for file in files:
                file_path = os.path.join(uploads_dir, file)
                file_size = os.path.getsize(file_path)
                print(f"  - {file} ({file_size} bytes)")
    else:
        print("❌ Uploads directory does not exist")

if __name__ == "__main__":
    verify_database()
    check_uploads_directory()
    print(f"\n✅ Database verification complete!") 