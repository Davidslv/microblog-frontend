import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportModal from '../ReportModal';
import { reportsService } from '../../services/reports';

// Mock reports service
vi.mock('../../services/reports', () => ({
  reportsService: {
    reportPost: vi.fn(),
  },
}));

describe('ReportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with confirmation message', () => {
    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Report Post')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to report this post/)).toBeInTheDocument();
  });

  it('closes modal when cancel is clicked', () => {
    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when backdrop is clicked', () => {
    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const backdrop = screen.getByText('Report Post').closest('.fixed');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close modal when modal content is clicked', () => {
    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const modalContent = screen.getByText('Report Post');
    fireEvent.click(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('submits report successfully', async () => {
    reportsService.reportPost.mockResolvedValue({ message: 'Report submitted' });

    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByText('Report');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(reportsService.reportPost).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Report Submitted')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('displays error message on failure', async () => {
    const errorMessage = 'You have already reported this post';
    reportsService.reportPost.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByText('Report');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('displays generic error message when error has no response', async () => {
    reportsService.reportPost.mockRejectedValue(new Error('Network error'));

    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByText('Report');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElement = screen.queryByText(/Failed to submit report|Network error/);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    reportsService.reportPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByText('Report');
    fireEvent.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
    });
  });

  it('disables buttons while loading', async () => {
    reportsService.reportPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ReportModal postId={1} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const submitButton = screen.getByText('Report');
    const cancelButton = screen.getByText('Cancel');

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});

