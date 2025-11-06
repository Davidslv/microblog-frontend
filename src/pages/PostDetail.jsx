import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsService } from '../services/posts';
import Post from '../components/Post';
import PostForm from '../components/PostForm';
import Loading from '../components/Loading';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsService.getPost(id);
      setPost(data.post);
      setReplies(data.replies || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load post. Please try again.');
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyCreated = () => {
    loadPost();
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Post not found'}
        </div>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {post.parent_id && (
        <Link
          to={`/posts/${post.parent_id}`}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← View parent post
        </Link>
      )}

      <Post post={post} />

      {user && (
        <div className="mt-6">
          <PostForm parentId={post.id} onPostCreated={handleReplyCreated} />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Replies</h2>
          {replies.map((reply) => (
            <div key={reply.id} className="ml-8 mb-4">
              <Post post={reply} />
            </div>
          ))}
        </div>
      )}

      <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
        ← Back to Feed
      </Link>
    </div>
  );
}

