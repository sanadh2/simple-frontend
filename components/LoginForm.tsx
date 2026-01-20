"use client"

import { useState } from "react"
import { toast } from "sonner"

import { EmailVerificationModal } from "@/components/EmailVerificationModal"
import ForgotPasswordForm from "@/components/ForgotPasswordForm"
import ResetPasswordForm from "@/components/ResetPasswordForm"
import { useLogin } from "@/hooks/useAuth"

interface LoginFormProps {
	onToggleMode: () => void
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showVerificationModal, setShowVerificationModal] = useState(false)
	const [pendingEmail, setPendingEmail] = useState<string | null>(null)
	const [showForgotPassword, setShowForgotPassword] = useState(false)
	const [resetEmail, setResetEmail] = useState<string | null>(null)
	const { mutate: login, isPending, error, reset } = useLogin()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		reset()
		login(
			{ email, password },
			{
				onSuccess: (data) => {
					if ("requiresVerification" in data) {
						setPendingEmail(email)
						setShowVerificationModal(true)
					}
				},
			}
		)
	}

	const handleVerified = () => {
		setShowVerificationModal(false)
		setPendingEmail(null)
		toast.success("Email verified!", {
			description: "You have been logged in successfully.",
		})
	}

	const handleForgotPasswordSuccess = (email: string) => {
		setResetEmail(email)
		setShowForgotPassword(false)
	}

	const handleBackToLogin = () => {
		setShowForgotPassword(false)
		setResetEmail(null)
		setEmail("")
	}

	if (resetEmail) {
		return <ResetPasswordForm email={resetEmail} onBack={handleBackToLogin} />
	}

	if (showForgotPassword) {
		return (
			<ForgotPasswordForm
				onSuccess={handleForgotPasswordSuccess}
				onBack={handleBackToLogin}
			/>
		)
	}

	return (
		<div className="w-full max-w-md p-8 space-y-6 bg-white  dark:bg-zinc-900">
			<div>
				<h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white">
					Sign in
				</h2>
				<p className="mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
					Welcome back! Please enter your details.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="p-3 text-sm text-red-600 bg-red-50  dark:bg-red-900/20 dark:text-red-400">
						{error instanceof Error ? error.message : "Login failed"}
					</div>
				)}

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Email address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<div className="flex items-center justify-between">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Password
						</label>
						<button
							type="button"
							onClick={() => setShowForgotPassword(true)}
							className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
						>
							Forgot password?
						</button>
					</div>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full flex justify-center py-2.5 px-4 border border-transparent   text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isPending ? "Signing in..." : "Sign in"}
				</button>
			</form>

			<div className="text-center">
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Don&apos;t have an account?{" "}
					<button
						onClick={onToggleMode}
						className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
					>
						Sign up
					</button>
				</p>
			</div>

			<EmailVerificationModal
				open={showVerificationModal}
				onVerified={handleVerified}
				email={pendingEmail}
				isLoginFlow
			/>
		</div>
	)
}
