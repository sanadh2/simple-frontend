# TanStack Query Integration Guide

This guide explains how to use TanStack Query in the authentication app.

## Overview

TanStack Query (formerly React Query) is integrated to handle all server state management, providing:

- Automatic caching and background updates
- Loading and error states
- Request deduplication
- Optimistic updates
- DevTools for debugging

## Architecture

### Query Client Setup

The query client is configured in `lib/queryClient.ts`:

```typescript
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10, // 10 minutes
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
})
```

### Provider Setup

The `QueryProvider` wraps the entire app in `app/layout.tsx`:

```typescript
<QueryProvider>
  {children}
</QueryProvider>
```

## Available Hooks

### 1. useProfile() - Query Hook

Fetches and caches the current user's profile.

```typescript
import { useProfile } from '@/hooks/useAuth';

function MyComponent() {
  const { data: user, isLoading, error, refetch } = useProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

**Features:**

- Automatically fetches user profile on mount
- Attempts token refresh if profile fetch fails
- Caches user data to prevent unnecessary requests
- Returns null if no access token exists

### 2. useLogin() - Mutation Hook

Handles user login.

```typescript
import { useLogin } from '@/hooks/useAuth';

function LoginForm() {
  const { mutate: login, isPending, error, reset } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    reset(); // Clear previous errors
    login({
      email: 'user@example.com',
      password: 'password123'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error.message}</div>}
      <button disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**What it does:**

- Sends login request to backend
- Stores access and refresh tokens in localStorage
- Updates profile query cache with user data
- Triggers re-render of components using `useProfile()`

### 3. useRegister() - Mutation Hook

Handles user registration.

```typescript
import { useRegister } from '@/hooks/useAuth';

function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    register({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error.message}</div>}
      <button disabled={isPending}>
        {isPending ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
```

**What it does:**

- Sends registration request to backend
- Stores tokens in localStorage on success
- Updates profile query cache
- User is immediately logged in after registration

### 4. useLogout() - Mutation Hook

Handles user logout.

```typescript
import { useLogout } from '@/hooks/useAuth';

function LogoutButton() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <button onClick={() => logout()} disabled={isPending}>
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

**What it does:**

- Sends logout request to backend
- Removes tokens from localStorage
- Clears all auth-related query cache
- Components using `useProfile()` automatically update

### 5. useLogoutAll() - Mutation Hook

Logs out from all devices.

```typescript
import { useLogoutAll } from '@/hooks/useAuth';

function LogoutAllButton() {
  const { mutate: logoutAll } = useLogoutAll();

  return (
    <button onClick={() => logoutAll()}>
      Logout from all devices
    </button>
  );
}
```

### 6. useRefreshToken() - Mutation Hook

Manually refresh the access token.

```typescript
import { useRefreshToken } from '@/hooks/useAuth';

function RefreshButton() {
  const { mutate: refreshToken, isPending } = useRefreshToken();

  return (
    <button onClick={() => refreshToken()} disabled={isPending}>
      Refresh Token
    </button>
  );
}
```

**Note:** Token refresh is automatically handled by `useProfile()` when needed.

## Query Keys

Query keys are centralized in `hooks/useAuth.ts`:

```typescript
export const authKeys = {
	all: ["auth"] as const,
	profile: () => [...authKeys.all, "profile"] as const,
}
```

This allows for easy query invalidation and refetching:

```typescript
import { useQueryClient } from "@tanstack/react-query"
import { authKeys } from "@/hooks/useAuth"

function MyComponent() {
	const queryClient = useQueryClient()

	const handleAction = () => {
		// Invalidate and refetch profile
		queryClient.invalidateQueries({ queryKey: authKeys.profile() })

		// Or clear all auth queries
		queryClient.removeQueries({ queryKey: authKeys.all })
	}
}
```

## Common Patterns

### Protected Component

```typescript
import { useProfile } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { data: user, isLoading } = useProfile();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <ProtectedContent user={user} />;
}
```

### Conditional Rendering Based on Auth State

```typescript
function App() {
  const { data: user, isLoading } = useProfile();

  if (isLoading) return <LoadingSkeleton />;

  return user ? <Dashboard /> : <AuthPage />;
}
```

### Handling Errors

```typescript
function LoginForm() {
	const { mutate: login, error, reset } = useLogin()

	useEffect(() => {
		if (error) {
			// Show toast notification
			toast.error(error.message)

			// Clear error after 5 seconds
			const timer = setTimeout(reset, 5000)
			return () => clearTimeout(timer)
		}
	}, [error, reset])

	// ...
}
```

### Loading States

```typescript
function MyComponent() {
  const { data: user, isLoading, isFetching } = useProfile();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // isLoading: true only on initial load (no cached data)
  // isFetching: true whenever fetching (including background refetch)
  // isPending: true while mutation is in progress

  if (isLoading) return <FullPageLoader />;

  return (
    <div>
      {isFetching && <BackgroundRefreshIndicator />}
      <UserInfo user={user} />
      <button disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
```

## React Query DevTools

The DevTools are automatically included in development mode. Look for the React Query icon in the bottom-left corner of your app.

Features:

- View all queries and their state
- See cached data
- Manually refetch queries
- Invalidate cache
- Monitor mutations
- Track network requests

## Best Practices

1. **Use query keys consistently** - Always use the exported `authKeys` object

2. **Handle loading and error states** - Always check `isLoading` and `error`

3. **Clear errors before retry** - Call `reset()` before submitting a form again

4. **Don't store server state in useState** - Let TanStack Query manage all server data

5. **Invalidate related queries** - When data changes, invalidate related queries to refetch

6. **Use optimistic updates** - For better UX, update UI before server confirms

## Troubleshooting

### Query not refetching

- Check if `staleTime` is set too high
- Use `refetch()` to manually trigger
- Use `invalidateQueries()` to mark data as stale

### Mutations not updating UI

- Ensure `onSuccess` callback updates query cache
- Use `setQueryData` to manually update cache
- Use `invalidateQueries` to refetch related data

### Multiple network requests

- Check if query keys are consistent
- Use `enabled` option to prevent unnecessary queries
- Review component mounting behavior

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Quick Start Guide](https://tanstack.com/query/latest/docs/react/quick-start)
- [DevTools Guide](https://tanstack.com/query/latest/docs/react/devtools)
