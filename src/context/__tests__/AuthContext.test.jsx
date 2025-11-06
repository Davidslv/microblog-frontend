import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/auth';

vi.mock('../../services/auth', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, loading, login, signup, logout } = useAuth();
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {user && <div data-testid="user">{user.username}</div>}
      <button onClick={() => login('test', 'pass')}>Login</button>
      <button onClick={() => signup({ username: 'test', password: 'pass' })}>Signup</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    authService.isAuthenticated.mockReturnValue(false);
    authService.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });

    renderWithProvider();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should check authentication on mount when token exists', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });

    renderWithProvider();

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('should not check authentication when no token exists', async () => {
    authService.isAuthenticated.mockReturnValue(false);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('should clear token and user on invalid token', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockRejectedValue(new Error('Invalid token'));

    renderWithProvider();

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
    });

    await waitFor(() => {
      expect(screen.queryByTestId('user')).not.toBeInTheDocument();
    });
  });

  it('should handle login successfully', async () => {
    authService.isAuthenticated.mockReturnValue(false);
    authService.login.mockResolvedValue({
      user: { id: 1, username: 'testuser' },
      token: 'test-token',
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test', 'pass');
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('should handle signup and auto-login', async () => {
    authService.isAuthenticated.mockReturnValue(false);
    authService.signup.mockResolvedValue({
      user: { id: 1, username: 'newuser' },
    });
    authService.login.mockResolvedValue({
      user: { id: 1, username: 'newuser' },
      token: 'test-token',
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const signupButton = screen.getByText('Signup');
    signupButton.click();

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        username: 'test',
        password: 'pass',
      });
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test', 'pass');
    });
  });

  it('should handle logout', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });
    authService.logout.mockResolvedValue();

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('user')).not.toBeInTheDocument();
    });
  });

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );
    }).toThrow('useAuth must be used within AuthProvider');

    consoleError.mockRestore();
  });
});

