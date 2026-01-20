"use client"

import { UserCircle } from "lucide-react"

import ErrorFallback from "@/components/ErrorBoundaryFallback"
import LoadingSpinner from "@/components/LoadingSpinner"
import UserProfile from "@/components/UserProfile"
import { useProfile } from "@/hooks/useAuth"

export default function ProfilePage() {
	const { data: user, isLoading, error, refetch } = useProfile()

	if (error && !user) {
		return <ErrorFallback error={error} onRetry={() => refetch()} />
	}

	if (isLoading) {
		return <LoadingSpinner text="Loading profile..." />
	}

	if (!user) {
		return (
			<div className="flex  bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
				<div className="w-full max-w-4xl mx-auto my-auto">
					<div className="bg-white dark:bg-zinc-900  p-8 text-center">
						<UserCircle className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
							Not authenticated
						</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							Please log in to view your profile.
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex  bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
			<div className="w-full max-w-4xl mx-auto my-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
				<UserProfile user={user} />
			</div>
		</div>
	)
}
