"use client"

import { useState } from "react"
import { Mail } from "lucide-react"

import { useRequestPasswordReset } from "@/hooks/useAuth"

interface ForgotPasswordFormProps {
	onSuccess: (email: string) => void
	onBack: () => void
}

export default function ForgotPasswordForm({
	onSuccess,
	onBack,
}: ForgotPasswordFormProps) {
	const [email, setEmail] = useState("")
	const {
		mutate: requestPasswordReset,
		isPending,
		error,
	} = useRequestPasswordReset()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email.trim()) {
			return
		}

		requestPasswordReset(email, {
			onSuccess: () => {
				onSuccess(email)
			},
		})
	}

	return (
		<div className="w-full max-w-md p-8 space-y-6 bg-white  dark:bg-zinc-900">
			<div>
				<h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white">
					Forgot Password?
				</h2>
				<p className="mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
					Enter your email address and we&apos;ll send you a code to reset your
					password.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="p-3 text-sm text-red-600 bg-red-50  dark:bg-red-900/20 dark:text-red-400">
						{error instanceof Error ? error.message : "Request failed"}
					</div>
				)}

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Email address
					</label>
					<div className="mt-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail className="h-5 w-5 text-zinc-400" />
						</div>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="block w-full pl-10 pr-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
							placeholder="you@example.com"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full flex justify-center py-2.5 px-4 border border-transparent   text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isPending ? "Sending..." : "Send Reset Code"}
				</button>
			</form>

			<div className="text-center">
				<button
					onClick={onBack}
					className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
				>
					← Back to sign in
				</button>
			</div>
		</div>
	)
}
