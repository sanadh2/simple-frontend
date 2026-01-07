'use client';

import { useLogout } from '@/hooks/useAuth';
import { User } from '@/lib/api';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Welcome back!
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-zinc-50 rounded-md dark:bg-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</p>
          <p className="mt-1 text-lg text-zinc-900 dark:text-white">
            {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-md dark:bg-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</p>
          <p className="mt-1 text-lg text-zinc-900 dark:text-white">{user.email}</p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-md dark:bg-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">User ID</p>
          <p className="mt-1 text-sm font-mono text-zinc-900 dark:text-white">{user.id}</p>
        </div>

        {(user.createdAt || user.updatedAt) && (
          <div className="grid grid-cols-2 gap-4">
            {user.createdAt && (
              <div className="p-4 bg-zinc-50 rounded-md dark:bg-zinc-800">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Member since</p>
                <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {user.updatedAt && (
              <div className="p-4 bg-zinc-50 rounded-md dark:bg-zinc-800">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last updated</p>
                <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-center p-4 bg-green-50 rounded-md dark:bg-green-900/20">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
              Successfully connected to server!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

