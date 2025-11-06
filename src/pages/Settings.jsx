import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users';
import Loading from '../components/Loading';

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setDescription(user.description || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const userData = {
        user: {
          description: description.trim() || '',
        },
      };

      // Only include password if provided
      if (password) {
        userData.user.password = password;
        userData.user.password_confirmation = passwordConfirmation;
      }

      const data = await usersService.updateUser(user.id, userData);
      setUser(data.user);
      setPassword('');
      setPasswordConfirmation('');
      setSuccess('Settings updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error
        || err.response?.data?.errors?.join(', ')
        || err.message
        || 'Failed to update settings. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setDeleteConfirm(false);
      return;
    }

    setDeleting(true);
    try {
      await usersService.deleteUser(user.id);
      // Logout and redirect to home
      navigate('/');
      window.location.reload(); // Force reload to clear auth state
    } catch (err) {
      const errorMessage = err.response?.data?.error
        || err.message
        || 'Failed to delete account. Please try again.';
      setError(errorMessage);
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Description (max 120 characters)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={120}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <small className="block mt-1 text-sm text-gray-500">
              Tell others about yourself
            </small>
            <small className="block mt-1 text-sm text-gray-400">
              {description.length}/120 characters
            </small>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <small className="block mt-1 text-sm text-gray-500">
              Minimum 6 characters
            </small>
          </div>

          {/* Password Confirmation */}
          {password && (
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Settings'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/users/${user.id}`)}
              className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
          </div>
        </form>

        <hr className="my-8 border-gray-200" />

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
          <p className="text-red-800 mb-4">
            Once you delete your account, there is no going back. Your posts will remain but will show as "Deleted User".
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting
              ? 'Deleting...'
              : deleteConfirm
              ? 'Confirm Delete Account'
              : 'Delete Account'}
          </button>
          {deleteConfirm && (
            <button
              onClick={() => setDeleteConfirm(false)}
              className="ml-4 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

