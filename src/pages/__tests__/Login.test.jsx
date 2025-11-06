import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it('should render login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('should handle form input', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('should call login on form submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({});
    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText(/Enter your username/i), 'testuser');
    await user.type(screen.getByPlaceholderText(/Enter your password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });
    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText(/Enter your username/i), 'testuser');
    await user.type(screen.getByPlaceholderText(/Enter your password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state while submitting', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValue(loginPromise);

    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText(/Enter your username/i), 'testuser');
    await user.type(screen.getByPlaceholderText(/Enter your password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByText('Logging in...')).toBeInTheDocument();

    resolveLogin({});
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
    });
  });

  it('should link to signup page', () => {
    renderWithRouter(<Login />);
    const signupLink = screen.getByRole('link', { name: /Sign up/i });
    expect(signupLink).toHaveAttribute('href', '/signup');
  });
});

