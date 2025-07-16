#!/usr/bin/env python3
"""
Create test data for the Prok Professional Networking app
"""

from main import app, db
from models.user_model import User
from models.post import Post
from models.like import Like
from datetime import datetime, timedelta
import random

def create_test_data():
    """Create test users, posts, and likes"""
    with app.app_context():
        # Clear existing data
        print("🗑️ Cleared existing data")
        Like.query.delete()
        Post.query.delete()
        User.query.delete()
        db.session.commit()
        
        # Create test users
        print("✅ Created test users")
        user1 = User(
            username="aatham_ansari",
            email="aatham@example.com",
            name="Aatham Ansari",
            title="Software Engineer",
            location="San Francisco, CA",
            bio="Passionate about technology and innovation",
            phone="+1-555-0123",
            socials='[{"platform": "linkedin", "url": "https://linkedin.com/in/aatham"}]',
            skills='["JavaScript", "React", "Node.js", "Python"]',
            experience='[{"title": "Software Engineer", "company": "Tech Corp", "duration": "2020-2023"}]',
            education='[{"degree": "BS Computer Science", "school": "Stanford University", "year": "2020"}]'
        )
        user1.set_password("password123")
        
        user2 = User(
            username="john_doe",
            email="john@example.com",
            name="John Doe",
            title="Product Manager",
            location="New York, NY",
            bio="Product management enthusiast",
            phone="+1-555-0456",
            socials='[{"platform": "linkedin", "url": "https://linkedin.com/in/johndoe"}]',
            skills='["Product Management", "Agile", "User Research", "Data Analysis"]',
            experience='[{"title": "Product Manager", "company": "Startup Inc", "duration": "2019-2023"}]',
            education='[{"degree": "MBA", "school": "Harvard Business School", "year": "2019"}]'
        )
        user2.set_password("password123")
        
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()
        
        # Create test posts that match the image
        print("✅ Created test posts")
        
        # Post Title 5 (from image)
        post1 = Post(
            title="Post Title 5",
            content="This is the content of post 5. It contains some sample text to demonstrate the layout and styling of the post list component.",
            user_id=user1.id,
            is_public=True,
            allow_comments=True,
            media_url="/uploads/posts/sample-image-1.jpg",
            media_type="image",
            created_at=datetime.now() - timedelta(days=1)
        )
        
        # Post Title 6 (from image)
        post2 = Post(
            title="Post Title 6",
            content="This is the content of post 6. It contains some sample text to demonstrate the layout and styling of the post list component.",
            user_id=user1.id,
            is_public=True,
            allow_comments=True,
            created_at=datetime.now() - timedelta(days=5)
        )
        
        # Post Title 7 (from image)
        post3 = Post(
            title="Post Title 7",
            content="This is the content of post 7. It contains some sample text to demonstrate the layout and styling of the post list component.",
            user_id=user1.id,
            is_public=True,
            allow_comments=True,
            created_at=datetime.now() - timedelta(days=2)
        )
        
        # Additional posts for variety
        post4 = Post(
            title="Technology Insights",
            content="Exploring the latest trends in software development and how they impact our industry.",
            user_id=user2.id,
            is_public=True,
            allow_comments=True,
            created_at=datetime.now() - timedelta(hours=6)
        )
        
        post5 = Post(
            title="Business Strategy",
            content="Key insights into modern business strategies and their implementation in today's market.",
            user_id=user2.id,
            is_public=True,
            allow_comments=True,
            created_at=datetime.now() - timedelta(hours=12)
        )
        
        db.session.add_all([post1, post2, post3, post4, post5])
        db.session.commit()
        
        # Create likes to match the image counts
        print("✅ Created test likes")
        
        # Create additional users for likes
        users_for_likes = []
        for i in range(1200):  # Create 1200 users for likes (249+326+426+50+75 = 1126 total likes needed)
            user = User(
                username=f"likeuser{i}",
                email=f"likeuser{i}@example.com",
                name=f"Like User {i}",
                title="User",
                location="Unknown",
                bio="",
                phone="",
                socials='[]',
                skills='[]',
                experience='[]',
                education='[]'
            )
            user.set_password("password123")
            users_for_likes.append(user)
        
        db.session.add_all(users_for_likes)
        db.session.commit()
        
        # Post 1: 249 likes (from image)
        for i in range(249):
            like = Like(user_id=users_for_likes[i].id, post_id=post1.id)
            db.session.add(like)
        
        # Post 2: 326 likes (from image)
        for i in range(326):
            like = Like(user_id=users_for_likes[i + 249].id, post_id=post2.id)
            db.session.add(like)
        
        # Post 3: 426 likes (from image)
        for i in range(426):
            like = Like(user_id=users_for_likes[i + 249 + 326].id, post_id=post3.id)
            db.session.add(like)
        
        # Add some likes to other posts
        for i in range(50):
            like = Like(user_id=users_for_likes[i + 249 + 326 + 426].id, post_id=post4.id)
            db.session.add(like)
        
        for i in range(75):
            like = Like(user_id=users_for_likes[i + 249 + 326 + 426 + 50].id, post_id=post5.id)
            db.session.add(like)
        
        db.session.commit()
        
        # Print summary
        print("\n📊 Test Data Summary:")
        print(f"Users: {User.query.count()}")
        print(f"Posts: {Post.query.count()}")
        print(f"Likes: {Like.query.count()}")
        
        print("\n👤 Test Users:")
        for user in User.query.all():
            print(f"Username: {user.username}, Password: password123")
        
        print("\n✅ Test data created successfully!")

if __name__ == "__main__":
    create_test_data() 