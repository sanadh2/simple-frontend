'use client';

import { useState } from 'react';
import { useServerLogin, useServerLogout } from '@/hooks/useServerAuth';

/**
 * Example: Client Component using Server Actions via hooks
 */
export default function ClientServerActionsExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { mutate: login, isPending: isLoggingIn, error: loginError } = useServerLogin();
  const { mutate: logout, isPending: isLoggingOut } = useServerLogout();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Client Component with Server Actions</h1>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Login with Server Actions</h2>

        {loginError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
            {loginError instanceof Error ? loginError.message : 'Login failed'}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            required
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
          />
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoggingIn ? 'Logging in...' : 'Login with Server Action'}
        </button>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          <p>✓ Uses Server Actions (more secure)</p>
          <p>✓ Stores tokens in HTTP-only cookies</p>
          <p>✓ Wrapped with TanStack Query for better UX</p>
        </div>
      </form>

      {/* Logout Button */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Logout</h2>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout with Server Action'}
        </button>
      </div>
    </div>
  );
}

