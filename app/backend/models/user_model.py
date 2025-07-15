from db import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile fields
    name = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
    
    # Contact information
    phone = db.Column(db.String(20), nullable=True)
    
    # Social links (stored as JSON)
    socials = db.Column(db.Text, nullable=True)  # JSON string
    
    # Skills (stored as JSON)
    skills = db.Column(db.Text, nullable=True)  # JSON string
    
    # Experience (stored as JSON)
    experience = db.Column(db.Text, nullable=True)  # JSON string
    
    # Education (stored as JSON)
    education = db.Column(db.Text, nullable=True)  # JSON string
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_socials(self):
        """Get social links as list"""
        if self.socials:
            try:
                return json.loads(self.socials)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_socials(self, socials_list):
        """Set social links from list"""
        self.socials = json.dumps(socials_list) if socials_list else None
    
    def get_skills(self):
        """Get skills as list"""
        if self.skills:
            try:
                return json.loads(self.skills)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_skills(self, skills_list):
        """Set skills from list"""
        self.skills = json.dumps(skills_list) if skills_list else None
    
    def get_experience(self):
        """Get experience as list"""
        if self.experience:
            try:
                return json.loads(self.experience)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_experience(self, experience_list):
        """Set experience from list"""
        self.experience = json.dumps(experience_list) if experience_list else None
    
    def get_education(self):
        """Get education as list"""
        if self.education:
            try:
                return json.loads(self.education)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_education(self, education_list):
        """Set education from list"""
        self.education = json.dumps(education_list) if education_list else None
    
    def to_dict(self):
        """Convert user to dictionary for API response"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'title': self.title,
            'location': self.location,
            'bio': self.bio,
            'avatar': self.avatar,
            'phone': self.phone,
            'socials': self.get_socials(),
            'skills': self.get_skills(),
            'experience': self.get_experience(),
            'education': self.get_education(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def update_profile(self, profile_data):
        """Update profile fields from dictionary"""
        allowed_fields = [
            'name', 'title', 'location', 'bio', 'phone',
            'socials', 'skills', 'experience', 'education'
        ]
        
        for field in allowed_fields:
            if field in profile_data:
                if field in ['socials', 'skills', 'experience', 'education']:
                    getattr(self, f'set_{field}')(profile_data[field])
                else:
                    setattr(self, field, profile_data[field])
        
        self.updated_at = datetime.utcnow() 