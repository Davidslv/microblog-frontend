import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

export default function Post({ post }) {
  if (!post) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link
            to={`/users/${post.author.id}`}
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            @{post.author.username}
          </Link>
          {post.author.description && (
            <span className="text-gray-500 text-sm">{post.author.description}</span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{formatDate(post.created_at)}</span>
      </div>

      <Link to={`/posts/${post.id}`} className="block">
        <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
      </Link>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <Link
          to={`/posts/${post.id}`}
          className="hover:text-blue-600"
        >
          {post.replies_count > 0 ? (
            <span>{post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}</span>
          ) : (
            <span>Reply</span>
          )}
        </Link>
        {post.parent_id && (
          <Link
            to={`/posts/${post.parent_id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            View thread
          </Link>
        )}
      </div>
    </div>
  );
}


