interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  text = 'Loading...', 
  fullScreen = true 
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent [animation-direction:reverse] [animation-duration:1.5s]"></div>
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}

