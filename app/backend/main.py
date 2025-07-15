from flask import Flask
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

# Initialize extensions
CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Import models (after db.init_app)
from models.user_model import User

# Register blueprints
from api.auth import auth_bp
from api.profile import profile_bp

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Determine port
    port = 5000
    # Check for environment variable
    if os.environ.get('PORT'):
        port = int(os.environ['PORT'])
    # Check for command line argument
    elif len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except Exception:
            pass
    # Run the app
    app.run(debug=True, port=port)