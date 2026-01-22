"use client"

import { Suspense, useState } from "react"

import AuthLayout from "@/components/AuthLayout"
import LoadingSpinner from "@/components/LoadingSpinner"
import LoginForm from "@/components/LoginForm"
import RegisterForm from "@/components/RegisterForm"

function AuthContent() {
	const [isLoginMode, setIsLoginMode] = useState(true)

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
