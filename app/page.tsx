'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  const { data: user, isLoading } = useProfile();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
      {user ? (
        <UserProfile user={user} />
      ) : (
        <>
          {isLoginMode ? (
            <LoginForm onToggleMode={() => setIsLoginMode(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
          )}
        </>
      )}
    </div>
  );
}
