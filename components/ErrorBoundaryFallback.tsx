"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
	error?: Error | null
	onRetry?: () => void
}

export default function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="text-center space-y-4">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
						<AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
					</div>

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

					<div className="flex flex-col gap-3">
						{onRetry && (
							<Button onClick={onRetry} className="w-full">
								Try Again
							</Button>
						)}
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
							className="w-full"
						>
							Refresh Page
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
