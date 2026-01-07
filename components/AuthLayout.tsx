'use client';

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* Logo/Brand */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            SecureAuth
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Full-stack authentication system
          </p>
        </div>

        {/* Content */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400 animate-in fade-in duration-1000 delay-300">
          <p>
            Built with{' '}
            <span className="text-red-500 animate-pulse">♥</span>
            {' '}using Next.js & TanStack Query
          </p>
        </footer>
      </main>
    </div>
  );
}

