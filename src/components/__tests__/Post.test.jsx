import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Post from '../Post';

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({ user: null }),
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Post', () => {
  const mockPost = {
    id: 1,
    content: 'This is a test post',
    created_at: '2024-01-01T12:00:00Z',
    author: {
      id: 1,
      username: 'testuser',
      description: 'Test user description',
    },
    replies_count: 0,
    parent_id: null,
  };

  it('should render post content', () => {
    renderWithRouter(<Post post={mockPost} />);
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
  });

  it('should display author username', () => {
    renderWithRouter(<Post post={mockPost} />);
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should display author description', () => {
    renderWithRouter(<Post post={mockPost} />);
    expect(screen.getByText('Test user description')).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    renderWithRouter(<Post post={mockPost} />);
    // Date formatting is tested separately, just check it renders some date text
    // The formatDate function returns relative time like "2 hours ago" or absolute date
    const dateElement = screen.getByText(/\d/); // Should contain at least one number
    expect(dateElement).toBeInTheDocument();
  });

  it('should show reply link when no replies', () => {
    renderWithRouter(<Post post={mockPost} />);
    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  it('should show reply count when replies exist', () => {
    const postWithReplies = { ...mockPost, replies_count: 5 };
    renderWithRouter(<Post post={postWithReplies} />);
    expect(screen.getByText('5 replies')).toBeInTheDocument();
  });

  it('should show singular reply count', () => {
    const postWithOneReply = { ...mockPost, replies_count: 1 };
    renderWithRouter(<Post post={postWithOneReply} />);
    expect(screen.getByText('1 reply')).toBeInTheDocument();
  });

  it('should show "View thread" link for replies', () => {
    const replyPost = { ...mockPost, parent_id: 10 };
    renderWithRouter(<Post post={replyPost} />);
    expect(screen.getByText('View thread')).toBeInTheDocument();
  });

  it('should not render when post is null', () => {
    const { container } = renderWithRouter(<Post post={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when post is undefined', () => {
    const { container } = renderWithRouter(<Post post={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should link to post detail page', () => {
    renderWithRouter(<Post post={mockPost} />);
    const postLink = screen.getByText('This is a test post').closest('a');
    expect(postLink).toHaveAttribute('href', '/posts/1');
  });

  it('should link to user profile', () => {
    renderWithRouter(<Post post={mockPost} />);
    const userLink = screen.getByText('@testuser');
    expect(userLink).toHaveAttribute('href', '/users/1');
  });

  it('should not display description when author has no description', () => {
    const postWithoutDescription = {
      ...mockPost,
      author: { id: 1, username: 'testuser' },
    };
    renderWithRouter(<Post post={postWithoutDescription} />);
    expect(screen.queryByText('Test user description')).not.toBeInTheDocument();
  });
});

