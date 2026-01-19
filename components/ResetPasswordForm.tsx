"use client"

import { useState } from "react"
import { Lock, Mail, KeyRound } from "lucide-react"

import { useResetPassword } from "@/hooks/useAuth"

interface ResetPasswordFormProps {
	email: string
	onBack: () => void
}

export default function ResetPasswordForm({
	email,
	onBack,
}: ResetPasswordFormProps) {
	const [otp, setOtp] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [localError, setLocalError] = useState("")
	const { mutate: resetPassword, isPending, error } = useResetPassword()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLocalError("")

		if (!otp.trim()) {
			setLocalError("Please enter the verification code")
			return
		}

		if (newPassword.length < 8) {
			setLocalError("Password must be at least 8 characters")
			return
		}

		if (newPassword !== confirmPassword) {
			setLocalError("Passwords do not match")
			return
		}

		resetPassword(
			{ email, otp, newPassword },
			{
				onSuccess: () => {
					setTimeout(() => {
						onBack()
					}, 1500)
				},
			}
		)
	}

	const displayError = localError || (error instanceof Error ? error.message : null)

	return (
		<div className="w-full max-w-md p-8 space-y-6 bg-white  dark:bg-zinc-900">
			<div>
				<h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white">
					Reset Password
				</h2>
				<p className="mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
					Enter the code sent to <span className="font-medium">{email}</span> and
					your new password.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{displayError && (
					<div className="p-3 text-sm text-red-600 bg-red-50  dark:bg-red-900/20 dark:text-red-400">
						{displayError}
					</div>
				)}

				<div>
					<label
						htmlFor="email-display"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Email
					</label>
					<div className="mt-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail className="h-5 w-5 text-zinc-400" />
						</div>
						<input
							id="email-display"
							type="email"
							value={email}
							disabled
							className="block w-full pl-10 pr-3 py-2 border border-zinc-300   bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 cursor-not-allowed"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="otp"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Verification Code
					</label>
					<div className="mt-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<KeyRound className="h-5 w-5 text-zinc-400" />
						</div>
						<input
							id="otp"
							name="otp"
							type="text"
							inputMode="numeric"
							maxLength={6}
							required
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							className="block w-full pl-10 pr-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-center text-2xl tracking-widest"
							placeholder="000000"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="newPassword"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						New Password
					</label>
					<div className="mt-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock className="h-5 w-5 text-zinc-400" />
						</div>
						<input
							id="newPassword"
							name="newPassword"
							type="password"
							autoComplete="new-password"
							required
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="block w-full pl-10 pr-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Confirm New Password
					</label>
					<div className="mt-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock className="h-5 w-5 text-zinc-400" />
						</div>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							autoComplete="new-password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="block w-full pl-10 pr-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full flex justify-center py-2.5 px-4 border border-transparent   text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isPending ? "Resetting..." : "Reset Password"}
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
