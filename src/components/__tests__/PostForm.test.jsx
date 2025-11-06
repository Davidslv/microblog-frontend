import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostForm from '../PostForm';
import { postsService } from '../../services/posts';

vi.mock('../../services/posts', () => ({
  postsService: {
    createPost: vi.fn(),
  },
}));

describe('PostForm', () => {
  const mockOnPostCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<PostForm onPostCreated={mockOnPostCreated} />);
    expect(screen.getByPlaceholderText(/What's on your mind/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post/i })).toBeInTheDocument();
  });

  it('should show character counter', () => {
    render(<PostForm onPostCreated={mockOnPostCreated} />);
    expect(screen.getByText(/200 characters remaining/i)).toBeInTheDocument();
  });

  it('should update character counter as user types', async () => {
    const user = userEvent.setup();
    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Hello');

    expect(screen.getByText(/195 characters remaining/i)).toBeInTheDocument();
  });

  it('should show warning when approaching limit', async () => {
    const user = userEvent.setup();
    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    const longText = 'a'.repeat(181);
    await user.type(textarea, longText);

    const counter = screen.getByText(/19 characters remaining/i);
    expect(counter).toHaveClass('text-red-600');
  });

  it('should disable submit button when content is empty', () => {
    render(<PostForm onPostCreated={mockOnPostCreated} />);
    const submitButton = screen.getByRole('button', { name: /Post/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when content is valid', async () => {
    const user = userEvent.setup();
    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Valid post content');

    const submitButton = screen.getByRole('button', { name: /Post/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable submit button when content exceeds limit', async () => {
    const user = userEvent.setup();
    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    const longText = 'a'.repeat(201);
    await user.type(textarea, longText);

    const submitButton = screen.getByRole('button', { name: /Post/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call createPost on submit', async () => {
    const user = userEvent.setup();
    postsService.createPost.mockResolvedValue({ post: { id: 1, content: 'Test post' } });

    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Test post');
    await user.click(screen.getByRole('button', { name: /Post/i }));

    await waitFor(() => {
      expect(postsService.createPost).toHaveBeenCalledWith('Test post', null);
    });
  });

  it('should call onPostCreated callback after successful post', async () => {
    const user = userEvent.setup();
    postsService.createPost.mockResolvedValue({ post: { id: 1, content: 'Test post' } });

    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Test post');
    await user.click(screen.getByRole('button', { name: /Post/i }));

    await waitFor(() => {
      expect(mockOnPostCreated).toHaveBeenCalled();
    });
  });

  it('should clear form after successful post', async () => {
    const user = userEvent.setup();
    postsService.createPost.mockResolvedValue({ post: { id: 1, content: 'Test post' } });

    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Test post');
    await user.click(screen.getByRole('button', { name: /Post/i }));

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should show error message on failure', async () => {
    const user = userEvent.setup();
    postsService.createPost.mockRejectedValue({
      response: { data: { error: 'Failed to create post' } },
    });

    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Test post');
    await user.click(screen.getByRole('button', { name: /Post/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create post')).toBeInTheDocument();
    });
  });

  it('should show validation error for empty content', async () => {
    const user = userEvent.setup();
    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, '   '); // Only whitespace
    await user.click(screen.getByRole('button', { name: /Post/i }));

    await waitFor(() => {
      expect(screen.getByText('Post content cannot be empty')).toBeInTheDocument();
    });
  });

  it('should show validation error for content exceeding limit', async () => {
    const user = userEvent.setup();
    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    const longText = 'a'.repeat(201);
    await user.type(textarea, longText);
    await user.click(screen.getByRole('button', { name: /Post/i }));

    await waitFor(() => {
      expect(screen.getByText(/Post cannot exceed 200 characters/i)).toBeInTheDocument();
    });
  });

  it('should show reply mode when parentId is provided', () => {
    render(<PostForm onPostCreated={mockOnPostCreated} parentId={1} />);
    expect(screen.getByText('Reply to Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write your reply/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reply/i })).toBeInTheDocument();
  });

  it('should call createPost with parentId when replying', async () => {
    const user = userEvent.setup();
    postsService.createPost.mockResolvedValue({ post: { id: 2, content: 'Reply', parent_id: 1 } });

    render(<PostForm onPostCreated={mockOnPostCreated} parentId={1} />);

    const textarea = screen.getByPlaceholderText(/Write your reply/i);
    await user.type(textarea, 'Reply content');
    await user.click(screen.getByRole('button', { name: /Reply/i }));

    await waitFor(() => {
      expect(postsService.createPost).toHaveBeenCalledWith('Reply content', 1);
    });
  });

  it('should show loading state while submitting', async () => {
    const user = userEvent.setup();
    let resolvePost;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    postsService.createPost.mockReturnValue(postPromise);

    render(<PostForm onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText(/What's on your mind/i);
    await user.type(textarea, 'Test post');
    await user.click(screen.getByRole('button', { name: /Post/i }));

    expect(screen.getByText('Posting...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    resolvePost({ post: { id: 1, content: 'Test post' } });
    await waitFor(() => {
      expect(screen.queryByText('Posting...')).not.toBeInTheDocument();
    });
  });
});

