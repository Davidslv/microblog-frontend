import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users';
import PostList from '../components/PostList';
import Loading from '../components/Loading';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getUser(id);
      setUser(data.user);
      setPosts(data.posts || []);
      setCursor(data.pagination?.cursor);
      setHasNext(data.pagination?.has_next);
      // Check if current user is following this user
      // This would need to be added to the API response
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user. Please try again.');
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      if (following) {
        await usersService.unfollowUser(id);
        setFollowing(false);
      } else {
        await usersService.followUser(id);
        setFollowing(true);
      }
    } catch (err) {
      console.error('Failed to follow/unfollow user:', err);
    }
  };

  const handleLoadMore = async () => {
    if (hasNext && cursor) {
      try {
        const data = await usersService.getUser(id);
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.pagination?.cursor);
        setHasNext(data.pagination?.has_next);
      } catch (err) {
        console.error('Failed to load more posts:', err);
      }
    }
  };

  if (loading && !user) {
    return <Loading />;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'User not found'}
        </div>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === parseInt(id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">@{user.username}</h1>
            {user.description && (
              <p className="text-gray-600 mb-4">{user.description}</p>
            )}
            <div className="text-sm text-gray-500">
              <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
            </div>
          </div>
          {currentUser && !isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-lg ${
                following
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      <PostList
        posts={posts}
        loading={false}
        hasNext={hasNext}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}


