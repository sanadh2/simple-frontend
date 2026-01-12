# Client - Next.js Authentication Frontend

A modern Next.js frontend with TanStack Query for efficient data fetching and state management.

## Features

- ✨ **Next.js 16** with App Router
- 🔄 **TanStack Query** for server state management
- 🎨 **Tailwind CSS** for styling
- 🔐 **JWT Authentication** with automatic token refresh
- 🌙 **Dark Mode** support
- 📱 **Responsive Design**
- 🛠️ **TypeScript** for type safety
- 🔍 **React Query DevTools** for debugging

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- TanStack Query (React Query)
- Tailwind CSS 4

## Project Structure

```
client/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with QueryProvider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── LoginForm.tsx      # Login form
│   ├── RegisterForm.tsx   # Registration form
│   └── UserProfile.tsx    # User profile display
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication hooks (useProfile, useLogin, etc.)
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── queryClient.ts    # TanStack Query configuration
└── providers/            # React providers
    └── QueryProvider.tsx # TanStack Query provider wrapper
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Start the development server:

```bash
npm run dev
```

The app will run on http://localhost:3001

## TanStack Query Integration

### Query Hooks

**`useProfile()`** - Fetch current user profile

```typescript
const { data: user, isLoading, error } = useProfile()
```

### Mutation Hooks

**`useLogin()`** - Login mutation

```typescript
const { mutate: login, isPending, error } = useLogin()
login({ email, password })
```

**`useRegister()`** - Registration mutation

```typescript
const { mutate: register, isPending, error } = useRegister()
register({ email, password, firstName, lastName })
```

**`useLogout()`** - Logout mutation

```typescript
const { mutate: logout } = useLogout()
logout()
```

**`useLogoutAll()`** - Logout from all devices

```typescript
const { mutate: logoutAll } = useLogoutAll()
logoutAll()
```

**`useRefreshToken()`** - Refresh access token

```typescript
const { mutate: refreshToken } = useRefreshToken()
refreshToken()
```

### Benefits of TanStack Query

- **Automatic Caching**: Queries are cached and shared across components
- **Background Updates**: Data is automatically refetched in the background
- **Stale-While-Revalidate**: Show cached data while fetching fresh data
- **Request Deduplication**: Multiple components requesting same data = single network request
- **Optimistic Updates**: UI updates immediately before server confirmation
- **DevTools**: Built-in developer tools for debugging queries
- **TypeScript Support**: Full type safety with excellent TypeScript support

## Query Configuration

The query client is configured with sensible defaults in `lib/queryClient.ts`:

```typescript
{
  staleTime: 5 minutes,    // Data stays fresh for 5 minutes
  gcTime: 10 minutes,      // Unused data garbage collected after 10 minutes
  retry: 1,                // Retry failed queries once
  refetchOnWindowFocus: false  // Don't refetch when window regains focus
}
```

## Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Flow

1. User enters credentials in LoginForm or RegisterForm
2. Component calls mutation hook (useLogin/useRegister)
3. Mutation sends request to backend API
4. On success:
   - Tokens stored in localStorage
   - User data cached in TanStack Query
   - Profile query automatically updated
   - UI re-renders with authenticated state
5. useProfile() hook provides user data to components
6. On logout:
   - Tokens removed from localStorage
   - All auth queries cleared from cache
   - UI returns to login state

## Development Tools

Open the app and look for the React Query DevTools icon in the bottom corner. Click it to:

- See all active queries and their state
- Manually refetch queries
- Invalidate cached data
- Monitor network requests
- Debug loading and error states

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)

## API Integration

The app connects to the Express backend API. All API calls are handled through:

- `lib/api.ts` - API client with typed methods
- `hooks/useAuth.ts` - React Query hooks for auth operations

## Styling

This app uses Tailwind CSS with a custom configuration:

- Responsive design (mobile-first)
- Dark mode support
- Custom color palette
- Smooth transitions and animations
