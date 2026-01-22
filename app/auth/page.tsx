"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import AuthLayout from "@/components/AuthLayout"
import ErrorFallback from "@/components/ErrorBoundaryFallback"
import LoadingSpinner from "@/components/LoadingSpinner"
import LoginForm from "@/components/LoginForm"
import RegisterForm from "@/components/RegisterForm"
import { useProfile } from "@/hooks/useAuth"

function AuthContent() {
	const { data: user, isLoading, error, refetch } = useProfile()
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isLoginMode, setIsLoginMode] = useState(true)

	useEffect(() => {
		if (!isLoading && user) {
			const redirectPath = searchParams.get("redirect") ?? "/"
			const finalPath = redirectPath !== "/auth" ? redirectPath : "/"
			router.push(finalPath)
		}
	}, [user, isLoading, router, searchParams])

	if (error && !user) {
		return <ErrorFallback error={error} onRetry={() => refetch()} />
	}

	if (isLoading) {
		return <LoadingSpinner text="Checking authentication..." />
	}

	if (user) {
		return <LoadingSpinner text="Redirecting..." />
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
			</div>
		</AuthLayout>
	)
}

export default function AuthPage() {
	return (
		<Suspense fallback={<LoadingSpinner text="Loading..." />}>
			<AuthContent />
		</Suspense>
	)
}
