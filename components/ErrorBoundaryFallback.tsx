'use client';

interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

export default function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {error.message}
              </p>
            )}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Don&apos;t worry, you can try again or refresh the page.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

