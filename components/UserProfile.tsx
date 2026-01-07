'use client';

import { useLogout } from '@/hooks/useAuth';
import { User } from '@/lib/api';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10"></div>
        
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold shadow-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              
              {/* User Info */}
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {user.email}
                </p>
                {user.isEmailVerified ? (
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              {isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing out...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Account Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">User ID</span>
              <span className="text-xs font-mono text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                {user.id.slice(0, 8)}...
              </span>
            </div>
            
            {user.createdAt && (
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Member since</span>
                <span className="text-sm text-zinc-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            {user.updatedAt && (
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Last updated</span>
                <span className="text-sm text-zinc-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Connection Status
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">
                    Connected to server
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Authentication active
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Secure session
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    Protected with JWT tokens
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Edit Profile</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Settings</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Security</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
}

