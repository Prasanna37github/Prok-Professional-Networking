from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from db import db
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'message': 'Missing fields'}), 400
    
    # Add default profile fields
    user = User(
        username=username,
        email=email,
        name='',
        title='',
        location='',
        bio='',
        phone='',
        socials='[]',
        skills='[]',
        experience='[]',
        education='[]'
    )
    user.set_password(password)
    try:
        db.session.add(user)
        db.session.commit()
        
        # Create token for the new user (like login)
        token = create_access_token(identity=str(user.id))
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Username or email already exists'}), 400

@auth_bp.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    data = request.get_json()
    username_or_email = data.get('username') or data.get('email')
    password = data.get('password')
    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
    if user and user.check_password(password):
        # Convert user ID to string for JWT
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})
    return jsonify({'message': 'Invalid credentials'}), 401