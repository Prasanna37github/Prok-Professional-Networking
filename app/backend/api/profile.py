import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image
import magic
from db import db
from models.user_model import User

profile_bp = Blueprint('profile', __name__)
 
# Configuration for file uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
UPLOAD_FOLDER = 'uploads'
THUMBNAIL_SIZE = (150, 150)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_file(file):
    """Validate image file type and size"""
    if not file:
        return False, "No file provided"
    
    if file.content_length and file.content_length > MAX_FILE_SIZE:
        return False, "File size exceeds 5MB limit"
    
    # Check file extension
    if not allowed_file(file.filename):
        return False, "Invalid file type. Only PNG, JPG, JPEG, GIF allowed"
    
    # Check MIME type
    try:
        mime = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Reset file pointer
        if not mime.startswith('image/'):
            return False, "Invalid file type. Only images allowed"
    except Exception:
        return False, "Unable to verify file type"
    
    return True, "Valid file"

def process_image(file, filename):
    """Process and save image with thumbnail"""
    try:
        # Open image with PIL
        image = Image.open(file)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Create upload directory if it doesn't exist
        upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        os.makedirs(upload_path, exist_ok=True)
        
        # Generate unique filename
        file_ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(upload_path, unique_filename)
        
        # Save original image
        image.save(file_path, quality=85, optimize=True)
        
        # Create thumbnail
        thumbnail = image.copy()
        thumbnail.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
        thumbnail_filename = f"thumb_{unique_filename}"
        thumbnail_path = os.path.join(upload_path, thumbnail_filename)
        thumbnail.save(thumbnail_path, quality=85, optimize=True)
        
        return unique_filename
        
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")

@profile_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile by username (query param) or by JWT user ID"""
    try:
        username = request.args.get('username')
        if username:
            user = User.query.filter_by(username=username).first()
        else:
            user_id = int(get_jwt_identity())  # Convert string back to int
            user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'profile': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error retrieving profile: {str(e)}'}), 500

@profile_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'title', 'location', 'bio']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Update profile
        user.update_profile(data)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating profile: {str(e)}'}), 500

@profile_bp.route('/api/profile/image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    """Upload profile image"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if file is present
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Validate file
        is_valid, message = validate_image_file(file)
        if not is_valid:
            return jsonify({'message': message}), 400
        
        # Process and save image
        filename = process_image(file, file.filename)
        
        # Update user avatar
        user.avatar = filename
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile image uploaded successfully',
            'avatar_url': f'/api/profile/image/{filename}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error uploading image: {str(e)}'}), 500

@profile_bp.route('/api/profile/image/<filename>', methods=['GET'])
def serve_image(filename):
    """Serve uploaded images"""
    try:
        upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        return send_from_directory(upload_path, filename)
    except Exception as e:
        return jsonify({'message': 'Image not found'}), 404

@profile_bp.route('/api/profile/skills', methods=['PUT'])
@jwt_required()
def update_skills():
    """Update user skills"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'skills' not in data:
            return jsonify({'message': 'Skills data required'}), 400
        
        user.set_skills(data['skills'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Skills updated successfully',
            'skills': user.get_skills()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating skills: {str(e)}'}), 500

@profile_bp.route('/api/profile/experience', methods=['PUT'])
@jwt_required()
def update_experience():
    """Update user experience"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'experience' not in data:
            return jsonify({'message': 'Experience data required'}), 400
        
        user.set_experience(data['experience'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Experience updated successfully',
            'experience': user.get_experience()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating experience: {str(e)}'}), 500

@profile_bp.route('/api/profile/education', methods=['PUT'])
@jwt_required()
def update_education():
    """Update user education"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'education' not in data:
            return jsonify({'message': 'Education data required'}), 400
        
        user.set_education(data['education'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Education updated successfully',
            'education': user.get_education()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating education: {str(e)}'}), 500

@profile_bp.route('/api/profile/socials', methods=['PUT'])
@jwt_required()
def update_socials():
    """Update user social links"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'socials' not in data:
            return jsonify({'message': 'Social links data required'}), 400
        
        user.set_socials(data['socials'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Social links updated successfully',
            'socials': user.get_socials()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating social links: {str(e)}'}), 500 