from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.comment import Comment
from models.post import Post
from models.user_model import User
from db import db
from datetime import datetime

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/api/posts/<int:post_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(post_id):
    """Get all comments for a specific post"""
    try:
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Get comments ordered by creation date (newest first)
        comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'comments': [comment.to_dict() for comment in comments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@comments_bp.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    """Create a new comment on a post"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if comments are allowed on this post
        if not post.allow_comments:
            return jsonify({'error': 'Comments are not allowed on this post'}), 403
        
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Comment content is required'}), 400
        
        # Create new comment
        comment = Comment(
            content=content,
            user_id=current_user_id,
            post_id=post_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'comment': comment.to_dict(),
            'message': 'Comment created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@comments_bp.route('/api/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    """Update a comment (only by the comment author)"""
    try:
        current_user_id = get_jwt_identity()
        
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check if user owns the comment
        if comment.user_id != current_user_id:
            return jsonify({'error': 'You can only edit your own comments'}), 403
        
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Comment content is required'}), 400
        
        comment.content = content
        comment.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'comment': comment.to_dict(),
            'message': 'Comment updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@comments_bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment (only by the comment author)"""
    try:
        current_user_id = get_jwt_identity()
        
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check if user owns the comment
        if comment.user_id != current_user_id:
            return jsonify({'error': 'You can only delete your own comments'}), 403
        
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Comment deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 