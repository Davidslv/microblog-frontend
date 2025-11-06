import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../Signup';
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

describe('Signup', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ signup: mockSignup });
  });

  it('should render signup form', () => {
    renderWithRouter(<Signup />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Choose a username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Choose a password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell us about yourself/i)).toBeInTheDocument();
  });

  it('should handle form input', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    await user.type(screen.getByPlaceholderText(/Choose a username/i), 'newuser');
    await user.type(screen.getByPlaceholderText(/Choose a password/i), 'password123');
    await user.type(screen.getByPlaceholderText(/Tell us about yourself/i), 'Description');

    expect(screen.getByPlaceholderText(/Choose a username/i).value).toBe('newuser');
    expect(screen.getByPlaceholderText(/Choose a password/i).value).toBe('password123');
    expect(screen.getByPlaceholderText(/Tell us about yourself/i).value).toBe('Description');
  });

  it('should call signup on form submit', async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({});
    renderWithRouter(<Signup />);

    await user.type(screen.getByPlaceholderText(/Choose a username/i), 'newuser');
    await user.type(screen.getByPlaceholderText(/Choose a password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123',
        description: '',
      });
    });
  });

  it('should show error message on signup failure', async () => {
    const user = userEvent.setup();
    mockSignup.mockRejectedValue({
      response: { data: { error: 'Username already taken' } },
    });
    renderWithRouter(<Signup />);

    await user.type(screen.getByPlaceholderText(/Choose a username/i), 'existinguser');
    await user.type(screen.getByPlaceholderText(/Choose a password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
  });

  it('should show loading state while submitting', async () => {
    const user = userEvent.setup();
    let resolveSignup;
    const signupPromise = new Promise((resolve) => {
      resolveSignup = resolve;
    });
    mockSignup.mockReturnValue(signupPromise);

    renderWithRouter(<Signup />);

    await user.type(screen.getByPlaceholderText(/Choose a username/i), 'newuser');
    await user.type(screen.getByPlaceholderText(/Choose a password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(screen.getByText('Creating account...')).toBeInTheDocument();

    resolveSignup({});
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });
  });

  it('should link to login page', () => {
    renderWithRouter(<Signup />);
    const loginLink = screen.getByRole('link', { name: /Login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});

