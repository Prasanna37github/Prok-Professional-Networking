#!/usr/bin/env python3
"""
Database initialization script
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app, db
from models.user_model import User

def init_database():
    """Initialize the database and create tables"""
    print("🗄️ Initializing database...")
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Check if we have any users
        user_count = User.query.count()
        print(f"📊 Current user count: {user_count}")
        
        # Create a test user if none exist
        if user_count == 0:
            print("👤 Creating test user...")
            test_user = User(
                username="testuser",
                email="test@example.com"
            )
            test_user.set_password("testpass123")
            
            try:
                db.session.add(test_user)
                db.session.commit()
                print("✅ Test user created successfully!")
                print("   Username: testuser")
                print("   Email: test@example.com")
                print("   Password: testpass123")
            except Exception as e:
                print(f"❌ Error creating test user: {e}")
                db.session.rollback()
        else:
            print("ℹ️ Users already exist in database")
        
        # List all tables
        print("\n📋 Database tables:")
        for table in db.metadata.tables:
            print(f"   - {table}")

if __name__ == "__main__":
    init_database() 