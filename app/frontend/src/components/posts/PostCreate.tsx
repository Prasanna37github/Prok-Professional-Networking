import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from './api';
import { useTheme } from '../../context/ThemeContext';
import type { PostData } from './api';

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useTheme();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allowComments, setAllowComments] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  
  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [dragActive, setDragActive] = useState(false);

  // Rich text editor state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors({ media: 'Unsupported file type. Please upload images, videos, or audio files.' });
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ media: 'File size must be less than 10MB.' });
      return;
    }
    
    setSelectedFile(file);
    setErrors({ ...errors, media: '' });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const postData: PostData = {
        title: title.trim(),
        content: content.trim(),
        media: selectedFile || undefined,
        allow_comments: allowComments,
        is_public: isPublic,
      };

      await postsApi.createPost(postData);
      
      // Redirect to dashboard page
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create post' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBold = () => {
    setIsBold(!isBold);
    // In a real implementation, you would use a rich text editor library
    // For now, we'll just toggle the state
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
    // In a real implementation, you would use a rich text editor library
    // For now, we'll just toggle the state
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkMarkdown = `[${linkText}](${linkUrl})`;
      const textArea = document.getElementById('content-textarea') as HTMLTextAreaElement;
      if (textArea) {
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const newContent = content.substring(0, start) + linkMarkdown + content.substring(end);
        setContent(newContent);
        setLinkUrl('');
        setLinkText('');
        setShowLinkModal(false);
      }
    }
  };

  const insertImage = () => {
    // This would typically open a file picker
    // For now, we'll just add a placeholder
    const imageMarkdown = `![Image description](image-url)`;
    const textArea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
      setContent(newContent);
      setShowImageModal(false);
    }
  };

  const renderPreview = () => (
    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg border ${isDarkMode ? 'border-gray-600 text-white' : 'text-black'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Post Preview</h3>
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded border ${isDarkMode ? 'border-gray-600 text-white' : 'text-black'}`}>
        <h2 className="text-xl font-bold mb-3">{title || 'Post Title'}</h2>
        
        <div className="prose max-w-none mb-4">
          <div 
            className={`${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''}`}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {content || 'Post content will appear here...'}
          </div>
        </div>
        
        {selectedFile && (
          <div className="mt-4">
            {selectedFile.type.startsWith('image/') ? (
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Preview" 
                className="max-w-full h-auto rounded"
              />
            ) : selectedFile.type.startsWith('video/') ? (
              <video 
                src={URL.createObjectURL(selectedFile)} 
                controls 
                className="max-w-full h-auto rounded"
              />
            ) : selectedFile.type.startsWith('audio/') ? (
              <audio 
                src={URL.createObjectURL(selectedFile)} 
                controls 
                className="w-full"
              />
            ) : null}
          </div>
        )}
        
        <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Comments: {allowComments ? 'Allowed' : 'Disabled'}</p>
          <p>Visibility: {isPublic ? 'Public' : 'Private'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Post</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </button>
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {isPreviewMode ? (
          renderPreview()
        ) : (
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              
              {/* Rich Text Toolbar */}
              <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded-t-lg border border-gray-300">
                <button
                  onClick={toggleBold}
                  className={`p-2 rounded ${isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
                  title="Bold"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.6 10.8c.8-.8 1.4-1.8 1.4-3.2 0-2.8-2.2-5-5-5H6v14h4.2c2.8 0 5-2.2 5-5 0-1.4-.6-2.4-1.6-2.8zM8 4h2.2c1.6 0 3 1.4 3 3s-1.4 3-3 3H8V4zm2.2 12H8v-4h2.2c1.6 0 3 1.4 3 3s-1.4 3-3 3z"/>
                  </svg>
                </button>
                <button
                  onClick={toggleItalic}
                  className={`p-2 rounded ${isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
                  title="Italic"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2h8v2h-2.5l-3 12h2.5v2H4v-2h2.5l3-12H8V2z"/>
                  </svg>
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                
                {/* More Options Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="p-2 rounded hover:bg-gray-200" 
                    title="More options"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </button>
                  
                  {showMoreOptions && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setShowLinkModal(true);
                          setShowMoreOptions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>Insert Link</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowImageModal(true);
                          setShowMoreOptions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Add Image</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <textarea
                id="content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={8}
                className={`w-full px-3 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${
                  errors.content ? 'border-red-500' : ''
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Media Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports images, videos, and audio up to 10MB
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept="image/*,video/*,audio/*"
                className="hidden"
              />
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {errors.media && (
                <p className="mt-1 text-sm text-red-600">{errors.media}</p>
              )}
            </div>

            {/* Post Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Post Settings
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Comments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public Post</span>
                </label>
              </div>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link Insert Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text to display"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Insert Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <p className="text-gray-600 mb-4">
              This will insert a placeholder for an image. You can upload images using the media section below.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Insert Placeholder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreate; 