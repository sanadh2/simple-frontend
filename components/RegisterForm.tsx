"use client"

import { useState } from "react"

import { useRegister } from "@/hooks/useAuth"
import { useVerifyEmailAfterRegistration } from "@/hooks/useEmailVerification"

const MIN_PASSWORD_LENGTH = 8

interface RegisterFormProps {
	onToggleMode: () => void
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [first_name, setfirst_name] = useState("")
	const [last_name, setlast_name] = useState("")
	const [otp, setOtp] = useState("")
	const [showOTP, setShowOTP] = useState(false)
	const [localError, setLocalError] = useState("")
	const { mutate: register, isPending, error, reset } = useRegister()
	const verifyEmail = useVerifyEmailAfterRegistration()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		reset()
		setLocalError("")

		if (showOTP) {
			if (!otp.trim()) {
				setLocalError("Please enter the verification code")
				return
			}

			verifyEmail.mutate(
				{ email, otp },
				{
					onSuccess: () => {
						setEmail("")
						setPassword("")
						setConfirmPassword("")
						setfirst_name("")
						setlast_name("")
						setOtp("")
						setShowOTP(false)
						onToggleMode()
					},
					onError: () => {
						setOtp("")
					},
				}
			)
			return
		}

		if (!first_name.trim() || !last_name.trim()) {
			setLocalError("First name and last name are required")
			return
		}

		if (password !== confirmPassword) {
			setLocalError("Passwords do not match")
			return
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			setLocalError(
				`Password must be at least ${MIN_PASSWORD_LENGTH} characters`
			)
			return
		}

		register(
			{ email, password, first_name, last_name },
			{
				onSuccess: () => {
					setShowOTP(true)
				},
			}
		)
	}

	const displayError =
		localError || (error instanceof Error ? error.message : null)

	return (
		<div className="w-full max-w-md p-8 space-y-6 bg-white  dark:bg-zinc-900">
			<div>
				<h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white">
					{showOTP ? "Verify your email" : "Create account"}
				</h2>
				<p className="mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
					{showOTP
						? `We sent a verification code to ${email}`
						: "Sign up to get started"}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{displayError && (
					<div className="p-3 text-sm text-red-600 bg-red-50  dark:bg-red-900/20 dark:text-red-400">
						{displayError}
					</div>
				)}

				{showOTP ? (
					<>
						<div>
							<label
								htmlFor="otp"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								Verification Code
							</label>
							<input
								id="otp"
								name="otp"
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={6}
								required
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-center text-2xl tracking-widest"
								placeholder="000000"
							/>
						</div>

						<button
							type="submit"
							disabled={verifyEmail.isPending || !otp.trim()}
							className="w-full flex justify-center py-2.5 px-4 border border-transparent   text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{verifyEmail.isPending ? "Verifying..." : "Verify Email"}
						</button>

						<div className="text-center">
							<button
								type="button"
								onClick={() => {
									setShowOTP(false)
									setOtp("")
								}}
								className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
							>
								← Back to registration
							</button>
						</div>
					</>
				) : (
					<>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="first_name"
									className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
								>
									First name
								</label>
								<input
									id="first_name"
									name="first_name"
									type="text"
									autoComplete="given-name"
									required
									value={first_name}
									onChange={(e) => setfirst_name(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
									placeholder="John"
								/>
							</div>

							<div>
								<label
									htmlFor="last_name"
									className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
								>
									Last name
								</label>
								<input
									id="last_name"
									name="last_name"
									type="text"
									autoComplete="family-name"
									required
									value={last_name}
									onChange={(e) => setlast_name(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
									placeholder="Doe"
								/>
							</div>
						</div>

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
							<label
								htmlFor="password"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
								placeholder="••••••••"
							/>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								Confirm password
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="mt-1 block w-full px-3 py-2 border border-zinc-300   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="w-full flex justify-center py-2.5 px-4 border border-transparent   text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isPending ? "Creating account..." : "Create account"}
						</button>
					</>
				)}
			</form>

			<div className="text-center">
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Already have an account?{" "}
					<button
						onClick={onToggleMode}
						className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
					>
						Sign in
					</button>
				</p>
			</div>
		</div>
	)
}
