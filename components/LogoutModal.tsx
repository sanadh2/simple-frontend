"use client"

import {
	AlertTriangle,
	ChevronRight,
	Loader2,
	LogOut,
	Smartphone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

interface LogoutModalProps {
	isOpen: boolean
	onClose: () => void
	onLogout: () => void
	onLogoutAll: () => void
	isLoading?: boolean
}

export default function LogoutModal({
	isOpen,
	onClose,
	onLogout,
	onLogoutAll,
	isLoading = false,
}: LogoutModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center space-x-3 mb-2">
						<div className="flex items-center justify-center w-12 h-12  bg-yellow-100 dark:bg-yellow-900/20">
							<AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
						</div>
						<div>
							<DialogTitle>Sign Out</DialogTitle>
							<DialogDescription className="text-left">
								Choose your sign out option
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-3 pt-2">
					<Button
						onClick={onLogout}
						disabled={isLoading}
						variant="outline"
						className="w-full h-auto p-4 flex items-center justify-between border-2 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 group"
					>
						<div className="flex items-center space-x-3">
							<div className="flex items-center justify-center w-10 h-10  bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
								<Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="text-left">
								<p className="font-medium text-zinc-900 dark:text-white">
									This device only
								</p>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Stay signed in on other devices
								</p>
							</div>
						</div>
						<ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
					</Button>

					<Button
						onClick={onLogoutAll}
						disabled={isLoading}
						variant="outline"
						className="w-full h-auto p-4 flex items-center justify-between border-2 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 group"
					>
						<div className="flex items-center space-x-3">
							<div className="flex items-center justify-center w-10 h-10  bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
								<LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
							</div>
							<div className="text-left">
								<p className="font-medium text-zinc-900 dark:text-white">
									All devices
								</p>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									Sign out everywhere for security
								</p>
							</div>
						</div>
						<ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
					</Button>
				</div>

				<div className="pt-2">
					<Button
						onClick={onClose}
						disabled={isLoading}
						variant="ghost"
						className="w-full"
					>
						Cancel
					</Button>
				</div>

				{isLoading && (
					<div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center ">
						<div className="flex flex-col items-center space-y-3">
							<Loader2 className="h-10 w-10 animate-spin text-blue-600" />
							<p className="text-sm font-medium text-zinc-900 dark:text-white">
								Signing out...
							</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
