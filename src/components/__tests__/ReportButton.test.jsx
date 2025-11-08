import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportButton from '../ReportButton';
import ReportModal from '../ReportModal';

// Mock ReportModal
vi.mock('../ReportModal', () => ({
  default: ({ postId, onClose, onSuccess }) => (
    <div data-testid="report-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={onSuccess}>Submit</button>
      <span>Post ID: {postId}</span>
    </div>
  ),
}));

describe('ReportButton', () => {
  it('renders report button', () => {
    render(<ReportButton postId={1} />);
    expect(screen.getByText('Report')).toBeInTheDocument();
  });

  it('opens modal when clicked', () => {
    render(<ReportButton postId={1} />);
    const button = screen.getByText('Report');
    fireEvent.click(button);
    expect(screen.getByTestId('report-modal')).toBeInTheDocument();
  });

  it('closes modal when onClose is called', () => {
    render(<ReportButton postId={1} />);
    const button = screen.getByText('Report');
    fireEvent.click(button);
    expect(screen.getByTestId('report-modal')).toBeInTheDocument();
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument();
  });

  it('calls onReportSuccess when report is successful', () => {
    const onReportSuccess = vi.fn();
    render(<ReportButton postId={1} onReportSuccess={onReportSuccess} />);
    const button = screen.getByText('Report');
    fireEvent.click(button);
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(onReportSuccess).toHaveBeenCalled();
  });

  it('passes correct postId to modal', () => {
    render(<ReportButton postId={123} />);
    const button = screen.getByText('Report');
    fireEvent.click(button);
    expect(screen.getByText('Post ID: 123')).toBeInTheDocument();
  });
});

