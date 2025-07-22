from flask import Flask, request
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from db import db
from flask_jwt_extended import JWTManager
import os
import sys

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Simple and effective CORS configuration
CORS(app, 
     origins="*",  # Allow all origins
     supports_credentials=False,  # Set to False for simplicity
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

db.init_app(app)
jwt = JWTManager(app)

# Import models (after db.init_app)
from models.user_model import User
from models.post import Post
from models.like import Like
from models.comment import Comment

# Register blueprints
from api.auth import auth_bp
from api.profile import profile_bp
from api.posts import posts_bp
from api.comments import comments_bp
from api.feed import feed_bp
from api.jobs import jobs_bp
from api.messaging import messaging_bp

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(feed_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(messaging_bp)

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'message': 'Backend is running'}, 200

# Test CORS endpoint
@app.route('/api/test-cors', methods=['GET', 'POST', 'OPTIONS'])
def test_cors():
    """Test CORS endpoint"""
    if request.method == 'OPTIONS':
        return {'message': 'CORS preflight successful'}, 200
    return {'message': 'CORS test successful', 'method': request.method}, 200

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return {'message': 'Prok Backend API', 'status': 'running'}, 200

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Determine port
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False)