import Post from './Post';
import Loading from './Loading';

export default function PostList({ posts, loading, hasNext, onLoadMore }) {
  if (loading && posts.length === 0) {
    return <Loading />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No posts yet. Be the first to post!</p>
      </div>
    );
  }

  // Filter out redacted posts (silent redaction - they should not appear)
  // Backend should already filter them, but we add a safety check here
  const visiblePosts = posts.filter(post => !post.redacted);

  if (visiblePosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div>
      {visiblePosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}

      {loading && posts.length > 0 && (
        <div className="mt-4">
          <Loading />
        </div>
      )}

      {hasNext && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}


