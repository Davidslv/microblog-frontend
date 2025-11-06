import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navigation', () => {
  const mockLogout = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useNavigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  it('should render navigation links when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });

    renderWithRouter(<Navigation />);
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('should render user info when authenticated', () => {
    const mockUser = { id: 1, username: 'testuser' };
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });

    renderWithRouter(<Navigation />);
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Feed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('should link to user profile when authenticated', () => {
    const mockUser = { id: 1, username: 'testuser' };
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });

    renderWithRouter(<Navigation />);
    const profileLink = screen.getByText('@testuser');
    expect(profileLink).toHaveAttribute('href', '/users/1');
  });

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, username: 'testuser' };
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });

    renderWithRouter(<Navigation />);
    await user.click(screen.getByRole('button', { name: /Logout/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should display brand name', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderWithRouter(<Navigation />);
    expect(screen.getByText('Microblog')).toBeInTheDocument();
  });

  it('should link brand to home page', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderWithRouter(<Navigation />);
    const brandLink = screen.getByText('Microblog');
    expect(brandLink).toHaveAttribute('href', '/');
  });
});

