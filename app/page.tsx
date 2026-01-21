"use client"

import { useState } from "react"

import AuthLayout from "@/components/AuthLayout"
import DashboardOverview from "@/components/DashboardOverview"
import ErrorFallback from "@/components/ErrorBoundaryFallback"
import LoadingSpinner from "@/components/LoadingSpinner"
import LoginForm from "@/components/LoginForm"
import RegisterForm from "@/components/RegisterForm"
import { useProfile } from "@/hooks/useAuth"

export default function Home() {
	const { data: user, isLoading, error, refetch } = useProfile()
	const [isLoginMode, setIsLoginMode] = useState(true)

	if (error && !user) {
		return <ErrorFallback error={error} onRetry={() => refetch()} />
	}

	if (isLoading) {
		return <LoadingSpinner text="Checking authentication..." />
	}

	if (user) {
		return <DashboardOverview />
	}

	return (
		<AuthLayout>
			<div className="relative">
				<div className="relative overflow-hidden">
					{isLoginMode ? (
						<div
							key="login"
							className="animate-in fade-in slide-in-from-right-4 duration-500"
						>
							<LoginForm onToggleMode={() => setIsLoginMode(false)} />
						</div>
					) : (
						<div
							key="register"
							className="animate-in fade-in slide-in-from-left-4 duration-500"
						>
							<RegisterForm onToggleMode={() => setIsLoginMode(true)} />
						</div>
					)}
				</div>

				<div className="mt-6 text-center">
					<p className="text-xs text-zinc-500 dark:text-zinc-500">
						{isLoginMode ? (
							<>
								New here?{" "}
								<button
									onClick={() => setIsLoginMode(false)}
									className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
								>
									Create an account
								</button>
							</>
						) : (
							<>
								Already have an account?{" "}
								<button
									onClick={() => setIsLoginMode(true)}
									className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
								>
									Sign in
								</button>
							</>
						)}
					</p>
				</div>
			</div>
		</AuthLayout>
	)
}
