"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	useSendVerificationOTP,
	useVerifyEmail,
	useVerifyEmailAndLogin,
} from "@/hooks/useEmailVerification"
import { useProfile } from "@/hooks/useAuth"

interface EmailVerificationModalProps {
	open: boolean
	onVerified: () => void
	email?: string | null
	isLoginFlow?: boolean
}

export function EmailVerificationModal({
	open,
	onVerified,
	email: propEmail,
	isLoginFlow = false,
}: EmailVerificationModalProps) {
	const { data: user } = useProfile()
	const [otp, setOtp] = useState("")
	const sendOTP = useSendVerificationOTP()
	const verifyEmail = useVerifyEmail()
	const verifyEmailAndLogin = useVerifyEmailAndLogin()

	const email = propEmail || user?.email || ""

	const handleSendOTP = () => {
		if (isLoginFlow) {
			toast.info("Please try logging in again", {
				description: "Enter your password again to receive a new verification code.",
			})
			return
		}
		sendOTP.mutate()
	}

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!otp.trim() || !email) {
			return
		}

		try {
			if (isLoginFlow) {
				await verifyEmailAndLogin.mutateAsync({ email, otp })
			} else {
				await verifyEmail.mutateAsync(otp)
			}
			setOtp("")
			onVerified()
		} catch (error) {
			setOtp("")
		}
	}

	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent
				className="sm:max-w-md"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle>Verify Your Email</DialogTitle>
					<DialogDescription>
						We sent a verification code to{" "}
						<span className="font-medium">{email}</span>
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleVerify} className="space-y-4">
					<div>
						<Label htmlFor="otp">Verification Code</Label>
						<Input
							id="otp"
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={6}
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							placeholder="Enter 6-digit code"
							className="mt-1 text-center text-2xl tracking-widest"
							required
							autoFocus
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={
							(verifyEmail.isPending || verifyEmailAndLogin.isPending) ||
							!otp.trim()
						}
					>
						{verifyEmail.isPending || verifyEmailAndLogin.isPending
							? "Verifying..."
							: "Verify Email"}
					</Button>
				</form>

				<div className="text-center space-y-2">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Didn&apos;t receive the code?
					</p>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleSendOTP}
						disabled={sendOTP.isPending}
						className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
					>
						{sendOTP.isPending ? "Sending..." : "Resend Code"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
