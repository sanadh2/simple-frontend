// This is a SERVER COMPONENT example
// Remove 'use client' to use as Server Component

import { getCurrentUser, isAuthenticated } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

/**
 * Example: Protected Server Component
 * This component fetches user data on the server before rendering
 */
export default async function ServerComponentExample() {
  // Check authentication status
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server Component Example</h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">User Data (Fetched on Server)</h2>
        
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ✓ This data was fetched on the server using Server Components
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
            ✓ No client-side JavaScript needed for initial render
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
            ✓ SEO-friendly and secure (tokens in HTTP-only cookies)
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Public Server Component with Optional Auth
 */
export async function PublicServerComponentExample() {
  // Get user if authenticated, null if not
  const user = await getCurrentUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Public Page</h1>
      
      {user ? (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <p>Welcome back, {user.firstName}!</p>
          <p className="text-sm mt-2">You're logged in as {user.email}</p>
        </div>
      ) : (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
          <p>Welcome, Guest!</p>
          <p className="text-sm mt-2">Please log in to access more features.</p>
        </div>
      )}
    </div>
  );
}

