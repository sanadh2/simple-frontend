# Server Functions Guide

This guide explains the server-side authentication functions and how to use them in your Next.js app.

## Overview

The app now has **two authentication approaches**:

1. **Client-side (TanStack Query + fetch)** - Direct API calls from browser
2. **Server-side (Server Actions + cookies)** - Server-side calls with HTTP-only cookies

## File Structure

```
client/
├── lib/
│   └── auth-server.ts          # Server-side API client utilities
├── actions/
│   └── auth-actions.ts         # Next.js Server Actions
├── hooks/
│   ├── useAuth.ts             # Client-side hooks (localStorage)
│   └── useServerAuth.ts       # Server-side hooks (cookies + actions)
```

## Server-Side Files

### 1. `lib/auth-server.ts`

Server-only utilities that can ONLY be imported in Server Components or Server Actions.

**Key Functions:**

```typescript
// Get current user (server-side)
const user = await getCurrentUser()

// Check if authenticated
const isAuth = await isAuthenticated()

// Cookie management
await setAuthCookies(accessToken, refreshToken)
await clearAuthCookies()
const token = await getAccessToken()
```

**Server API Client:**

```typescript
import { serverApiClient } from "@/lib/auth-server"

// Use in Server Components or Server Actions
const response = await serverApiClient.getProfile()
const loginResponse = await serverApiClient.login(email, password)
```

### 2. `actions/auth-actions.ts`

Next.js Server Actions that can be called from Client Components.

**Available Actions:**

```typescript
"use server"

// Login
const result = await loginAction(email, password)

// Register
const result = await registerAction(email, password, firstName, lastName)

// Logout
await logoutAction()

// Get profile
const result = await getProfileAction()

// Refresh token
const result = await refreshTokenAction()

// Check auth status
const result = await checkAuthAction()
```

### 3. `hooks/useServerAuth.ts`

Client-side hooks that use Server Actions (alternative to `useAuth.ts`).

**Available Hooks:**

```typescript
// Login with Server Actions
const { mutate: login } = useServerLogin()

// Register with Server Actions
const { mutate: register } = useServerRegister()

// Logout with Server Actions
const { mutate: logout } = useServerLogout()

// Refresh token with Server Actions
const { mutate: refreshToken } = useServerRefreshToken()
```

## Usage Examples

### Example 1: Server Component

Use server-side functions directly in Server Components:

```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Example 2: Protected Server Component

```typescript
// app/profile/page.tsx
import { getCurrentUser, isAuthenticated } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  const user = await getCurrentUser();

  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
```

### Example 3: Client Component with Server Actions

```typescript
// components/LoginFormServer.tsx
'use client';

import { useState } from 'react';
import { useServerLogin } from '@/hooks/useServerAuth';

export default function LoginFormServer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useServerLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error.message}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 4: Using Server Actions Directly

```typescript
'use client';

import { loginAction } from '@/actions/auth-actions';

export default function DirectLoginForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await loginAction(email, password);

    if (result.success) {
      console.log('Logged in:', result.data);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Example 5: API Route Handler

```typescript
// app/api/user/route.ts
import { getCurrentUser } from "@/lib/auth-server"
import { NextResponse } from "next/server"

export async function GET() {
	const user = await getCurrentUser()

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	return NextResponse.json({ user })
}
```

### Example 6: Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
	const accessToken = request.cookies.get("accessToken")?.value

	// Redirect to login if not authenticated
	if (!accessToken && request.nextUrl.pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/login", request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/dashboard/:path*", "/profile/:path*"],
}
```

## Client vs Server Auth: When to Use What?

### Use Client-Side Auth (`useAuth.ts`) When:

- ✅ Building a pure SPA (Single Page Application)
- ✅ Need to support older browsers
- ✅ Want more control over token storage
- ✅ Building a standalone client app
- ✅ Don't need SSR for authenticated pages

### Use Server-Side Auth (`auth-server.ts` + actions) When:

- ✅ Building with Next.js App Router
- ✅ Need Server-Side Rendering (SSR) for protected pages
- ✅ Want more secure cookie-based auth
- ✅ Need to fetch user data before page renders
- ✅ Want to use middleware for protection
- ✅ Building SEO-friendly authenticated pages

## Security: Cookies vs localStorage

### Server-Side (Cookies) ✅ More Secure

- **HTTP-only cookies** - JavaScript can't access tokens
- **Secure flag** - Only sent over HTTPS in production
- **SameSite** - CSRF protection
- **Server-side validation** - Tokens validated on server

### Client-Side (localStorage) ⚠️ Less Secure

- **XSS vulnerable** - JavaScript can access tokens
- **Manual management** - Developer must handle security
- **Client-side validation** - Tokens validated on client

## Migration Guide

### Switching from Client to Server Auth

**Before (Client-side):**

```typescript
import { useLogin } from "@/hooks/useAuth"

const { mutate: login } = useLogin()
login({ email, password })
```

**After (Server-side):**

```typescript
import { useServerLogin } from "@/hooks/useServerAuth"

const { mutate: login } = useServerLogin()
login({ email, password })
```

### Using Both Approaches

You can use both! For example:

- Server-side for initial page load
- Client-side for subsequent interactions

```typescript
// Server Component - Initial load
import { getCurrentUser } from '@/lib/auth-server';

export default async function Page() {
  const initialUser = await getCurrentUser();

  return <ClientComponent initialUser={initialUser} />;
}

// Client Component - Client interactions
'use client';
import { useProfile } from '@/hooks/useAuth';

function ClientComponent({ initialUser }) {
  const { data: user } = useProfile();

  // Use server data initially, then client data
  const currentUser = user || initialUser;

  return <div>{currentUser?.email}</div>;
}
```

## Best Practices

1. **Use `'use server'` directive** - Always add to Server Actions
2. **Use `server-only` package** - Import in server-only files
3. **Validate on server** - Never trust client data
4. **Use HTTP-only cookies** - For production apps
5. **Implement CSRF protection** - Use SameSite cookies
6. **Handle errors gracefully** - Show user-friendly messages
7. **Revalidate paths** - After mutations that change data
8. **Use middleware** - For route protection

## Troubleshooting

### Cookies not working

- Check `sameSite` and `secure` settings
- Ensure frontend and backend on same domain (or CORS configured)
- Check browser dev tools → Application → Cookies

### Server Actions not found

- Ensure `'use server'` directive at top of file
- Check Next.js version (Server Actions require Next.js 13.4+)
- Verify file is in `actions/` directory

### "server-only" errors

- Don't import server-only files in Client Components
- Use Server Actions to call server functions from client

## Additional Resources

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Server-only Package](https://www.npmjs.com/package/server-only)
