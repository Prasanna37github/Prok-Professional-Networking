from flask import Flask
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from db import db
from flask_jwt_extended import JWTManager

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
from models.user import User

# Register blueprints
from api.auth import auth_bp
app.register_blueprint(auth_bp)

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
    
    # Run the app
    app.run(debug=True)