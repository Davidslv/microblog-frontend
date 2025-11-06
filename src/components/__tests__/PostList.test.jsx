import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostList from '../PostList';
import Post from '../Post';
import Loading from '../Loading';

vi.mock('../Post', () => ({
  default: vi.fn(({ post }) => <div data-testid={`post-${post.id}`}>{post.content}</div>),
}));

vi.mock('../Loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}));

describe('PostList', () => {
  const mockPosts = [
    { id: 1, content: 'First post', author: { id: 1, username: 'user1' } },
    { id: 2, content: 'Second post', author: { id: 2, username: 'user2' } },
  ];

  it('should render list of posts', () => {
    render(<PostList posts={mockPosts} loading={false} hasNext={false} onLoadMore={vi.fn()} />);
    expect(screen.getByTestId('post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-2')).toBeInTheDocument();
  });

  it('should show loading indicator when loading and no posts', () => {
    render(<PostList posts={[]} loading={true} hasNext={false} onLoadMore={vi.fn()} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should show empty state when no posts and not loading', () => {
    render(<PostList posts={[]} loading={false} hasNext={false} onLoadMore={vi.fn()} />);
    expect(screen.getByText('No posts yet. Be the first to post!')).toBeInTheDocument();
  });

  it('should show loading indicator when loading more posts', () => {
    render(<PostList posts={mockPosts} loading={true} hasNext={true} onLoadMore={vi.fn()} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should show "Load More" button when hasNext is true', () => {
    render(<PostList posts={mockPosts} loading={false} hasNext={true} onLoadMore={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument();
  });

  it('should not show "Load More" button when hasNext is false', () => {
    render(<PostList posts={mockPosts} loading={false} hasNext={false} onLoadMore={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Load More/i })).not.toBeInTheDocument();
  });

  it('should not show "Load More" button when loading', () => {
    render(<PostList posts={mockPosts} loading={true} hasNext={true} onLoadMore={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Load More/i })).not.toBeInTheDocument();
  });

  it('should call onLoadMore when "Load More" button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnLoadMore = vi.fn();
    render(<PostList posts={mockPosts} loading={false} hasNext={true} onLoadMore={mockOnLoadMore} />);

    await user.click(screen.getByRole('button', { name: /Load More/i }));
    expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
  });

  it('should render posts in order', () => {
    render(<PostList posts={mockPosts} loading={false} hasNext={false} onLoadMore={vi.fn()} />);
    const posts = screen.getAllByTestId(/post-/);
    expect(posts[0]).toHaveTextContent('First post');
    expect(posts[1]).toHaveTextContent('Second post');
  });
});

