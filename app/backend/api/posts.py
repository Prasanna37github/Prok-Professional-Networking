from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.post import Post
from models.user_model import User
from models.like import Like
from db import db
import os
import uuid
from datetime import datetime
import magic

posts_bp = Blueprint('posts', __name__)

# Configure upload settings
ALLOWED_EXTENSIONS = {
    'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
    'video': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'},
    'audio': {'mp3', 'wav', 'ogg', 'aac', 'flac'}
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename, file_type):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, set())

def get_file_type(file):
    """Detect file type using magic numbers"""
    try:
        mime = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Reset file pointer
        
        if mime.startswith('image/'):
            return 'image'
        elif mime.startswith('video/'):
            return 'video'
        elif mime.startswith('audio/'):
            return 'audio'
        else:
            return None
    except Exception:
        return None

@posts_bp.route('/api/posts/', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get form data
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        allow_comments = request.form.get('allow_comments', 'true').lower() == 'true'
        is_public = request.form.get('is_public', 'true').lower() == 'true'
        
        # Validate required fields
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Handle media upload
        media_url = None
        media_type = None
        
        if 'media' in request.files:
            file = request.files['media']
            if file and file.filename:
                # Check file size
                file.seek(0, 2)  # Seek to end
                file_size = file.tell()
                file.seek(0)  # Reset to beginning
                
                if file_size > MAX_FILE_SIZE:
                    return jsonify({'error': f'File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit'}), 400
                
                # Detect file type
                detected_type = get_file_type(file)
                if not detected_type:
                    return jsonify({'error': 'Unsupported file type'}), 400
                
                # Validate extension
                if not allowed_file(file.filename, detected_type):
                    return jsonify({'error': f'Unsupported {detected_type} format'}), 400
                
                # Generate unique filename
                file_extension = file.filename.rsplit('.', 1)[1].lower()
                unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
                
                # Create upload directory if it doesn't exist
                upload_dir = os.path.join(current_app.root_path, 'uploads', 'posts')
                os.makedirs(upload_dir, exist_ok=True)
                
                # Save file
                file_path = os.path.join(upload_dir, unique_filename)
                file.save(file_path)
                
                media_url = f"/uploads/posts/{unique_filename}"
                media_type = detected_type
        
        # Create post
        post = Post(
            user_id=current_user_id,
            title=title,
            content=content,
            media_url=media_url,
            media_type=media_type,
            allow_comments=allow_comments,
            is_public=is_public
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'message': 'Post created successfully',
            'post': post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating post: {str(e)}")
        return jsonify({'error': 'Failed to create post'}), 500

@posts_bp.route('/api/posts/', methods=['GET'])
@jwt_required()
def get_posts():
    """Get all posts (with pagination, search, and filtering)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'newest')  # newest, oldest, most_liked, most_commented
        filter_by = request.args.get('filter_by', 'all')  # all, public, private
        
        # Build query
        query = Post.query
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.join(User).filter(
                db.or_(
                    Post.title.ilike(search_term),
                    Post.content.ilike(search_term),
                    User.name.ilike(search_term),
                    User.username.ilike(search_term)
                )
            )
        
        # Apply visibility filter
        if filter_by == 'public':
            query = query.filter_by(is_public=True)
        elif filter_by == 'private':
            query = query.filter_by(is_public=False)
        # 'all' shows all posts (no filter)
        
        # Apply sorting
        if sort_by == 'oldest':
            query = query.order_by(Post.created_at.asc())
        elif sort_by == 'most_liked':
            query = query.outerjoin(Like).group_by(Post.id).order_by(db.func.count(Like.id).desc())
        elif sort_by == 'most_commented':
            from models.comment import Comment
            query = query.outerjoin(Comment).group_by(Post.id).order_by(db.func.count(Comment.id).desc())
        else:  # newest (default)
            query = query.order_by(Post.created_at.desc())
        
        # Get posts with pagination
        posts = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'posts': [post.to_dict() for post in posts.items],
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page,
            'has_next': posts.has_next,
            'has_prev': posts.has_prev
        }), 200
        
    except Exception as e:
        print(f"Error fetching posts: {str(e)}")
        return jsonify({'error': 'Failed to fetch posts'}), 500

@posts_bp.route('/api/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    """Get a specific post by ID"""
    try:
        post = Post.query.get_or_404(post_id)
        
        if not post.is_public:
            current_user_id = get_jwt_identity()
            if post.user_id != current_user_id:
                return jsonify({'error': 'Post not found'}), 404
        
        return jsonify({'post': post.to_dict()}), 200
        
    except Exception as e:
        print(f"Error fetching post: {str(e)}")
        return jsonify({'error': 'Failed to fetch post'}), 500

@posts_bp.route('/api/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Update a post"""
    try:
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        
        # Check if user owns the post
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'title' in data:
            post.title = data['title'].strip()
        if 'content' in data:
            post.content = data['content'].strip()
        if 'allow_comments' in data:
            post.allow_comments = data['allow_comments']
        if 'is_public' in data:
            post.is_public = data['is_public']
        
        post.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Post updated successfully',
            'post': post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating post: {str(e)}")
        return jsonify({'error': 'Failed to update post'}), 500

@posts_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Delete a post"""
    try:
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        
        # Check if user owns the post
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete associated media file if exists
        if post.media_url:
            try:
                file_path = os.path.join(current_app.root_path, post.media_url.lstrip('/'))
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting media file: {str(e)}")
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting post: {str(e)}")
        return jsonify({'error': 'Failed to delete post'}), 500

# Serve uploaded files
@posts_bp.route('/uploads/posts/<filename>')
def serve_post_media(filename):
    """Serve uploaded post media files"""
    try:
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'posts')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        print(f"Error serving media file: {str(e)}")
        return jsonify({'error': 'File not found'}), 404

@posts_bp.route('/api/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    """Like or unlike a post"""
    try:
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        
        # Check if user already liked the post
        existing_like = Like.query.filter_by(
            user_id=current_user_id, 
            post_id=post_id
        ).first()
        
        if existing_like:
            # Unlike the post
            db.session.delete(existing_like)
            action = 'unliked'
        else:
            # Like the post
            new_like = Like(user_id=current_user_id, post_id=post_id)
            db.session.add(new_like)
            action = 'liked'
        
        db.session.commit()
        
        return jsonify({
            'message': f'Post {action} successfully',
            'liked': action == 'liked',
            'like_count': len(post.likes)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error liking/unliking post: {str(e)}")
        return jsonify({'error': 'Failed to like/unlike post'}), 500

@posts_bp.route('/api/posts/<int:post_id>/like', methods=['GET'])
@jwt_required()
def get_post_like_status(post_id):
    """Get like status for current user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if user liked the post
        existing_like = Like.query.filter_by(
            user_id=current_user_id, 
            post_id=post_id
        ).first()
        
        return jsonify({
            'liked': existing_like is not None
        }), 200
        
    except Exception as e:
        print(f"Error getting like status: {str(e)}")
        return jsonify({'error': 'Failed to get like status'}), 500 