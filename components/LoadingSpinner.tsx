import { Loader2 } from 'lucide-react';

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
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}
