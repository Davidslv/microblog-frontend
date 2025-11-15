import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsService } from '../services/posts';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [filter, setFilter] = useState('timeline');
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async (nextCursor = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsService.getPosts(filter, nextCursor);

      if (nextCursor) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setCursor(data.pagination.cursor);
      setHasNext(data.pagination.has_next);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts. Please try again.');
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, user]);

  const handleLoadMore = () => {
    if (hasNext && cursor) {
      loadPosts(cursor);
    }
  };

  const handlePostCreated = () => {
    // Reload posts from the beginning
    setCursor(null);
    loadPosts();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>

      {user && (
        <>
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setFilter('timeline')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'mine'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'following'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Following
            </button>
          </div>

          <PostForm onPostCreated={handlePostCreated} />
        </>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <PostList
        posts={posts}
        loading={loading}
        hasNext={hasNext}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}


