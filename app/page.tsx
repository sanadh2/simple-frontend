'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import UserProfile from '@/components/UserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorFallback from '@/components/ErrorBoundaryFallback';
import AuthLayout from '@/components/AuthLayout';

export default function Home() {
  const { data: user, isLoading, error, refetch } = useProfile();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner text="Initializing..." />;
  }

  if (error && !user) {
    return <ErrorFallback error={error as Error} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (user) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
        <div className="w-full max-w-4xl mx-auto my-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <UserProfile user={user} />
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="relative">
        <div className="relative overflow-hidden">
          {isLoginMode ? (
            <div
              key="login"
              className="animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <LoginForm onToggleMode={() => setIsLoginMode(false)} />
            </div>
          ) : (
            <div
              key="register"
              className="animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {isLoginMode ? (
              <>
                New here?{' '}
                <button
                  onClick={() => setIsLoginMode(false)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLoginMode(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
