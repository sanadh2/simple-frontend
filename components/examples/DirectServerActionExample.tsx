'use client';

import { useState } from 'react';
import { loginAction, logoutAction, getProfileAction } from '@/actions/auth-actions';

/**
 * Example: Using Server Actions directly (without TanStack Query hooks)
 * This approach gives you full control but requires manual state management
 */
export default function DirectServerActionExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await loginAction(email, password);
      
      if (result.success) {
        setMessage('Login successful!');
        setEmail('');
        setPassword('');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await logoutAction();
      setMessage('Logged out successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await getProfileAction();
      
      if (result.success && result.data) {
        setMessage(`Profile: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        setError(result.error || 'Failed to get profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Direct Server Actions Example</h1>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ This example calls Server Actions directly without TanStack Query.
          You'll need to manage loading, error states, and cache manually.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded">
          <pre className="text-sm whitespace-pre-wrap">{message}</pre>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Login</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Login'}
        </button>
      </form>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Actions</h2>
        
        <div className="flex gap-4">
          <button
            onClick={handleGetProfile}
            disabled={loading}
            className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Get Profile
          </button>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-2">How this works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Server Actions are called directly from client component</li>
          <li>No TanStack Query hooks - pure async/await</li>
          <li>Manual state management for loading, errors, messages</li>
          <li>Full control but more code to write</li>
          <li>Best for simple, one-off actions</li>
        </ul>
      </div>
    </div>
  );
}

