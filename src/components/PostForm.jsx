import { useState } from 'react';
import { postsService } from '../services/posts';

export default function PostForm({ onPostCreated, parentId = null }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const maxLength = 200;
  const remaining = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    if (content.length > maxLength) {
      setError(`Post cannot exceed ${maxLength} characters`);
      return;
    }

    setSubmitting(true);
    try {
      await postsService.createPost(content.trim(), parentId);
      setContent('');
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">
        {parentId ? 'Reply to Post' : 'Create New Post'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? 'Write your reply...' : 'What\'s on your mind?'}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        rows={4}
        maxLength={maxLength}
        disabled={submitting}
      />

      <div className="flex items-center justify-between">
        <span className={`text-sm ${remaining < 20 ? 'text-red-600' : 'text-gray-500'}`}>
          {remaining} characters remaining
        </span>
        <button
          type="submit"
          disabled={submitting || !content.trim() || content.length > maxLength}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : parentId ? 'Reply' : 'Post'}
        </button>
      </div>
    </form>
  );
}


