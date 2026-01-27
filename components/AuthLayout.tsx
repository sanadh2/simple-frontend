"use client"

import { type ReactNode } from "react"
import Image from "next/image"

interface AuthLayoutProps {
	children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
			<main className="relative flex-1 flex flex-col items-center justify-center p-4">
				<div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
					<div className="inline-flex items-center justify-center w-16 h-16 mb-4 overflow-hidden">
						<Image
							src="/logo.svg"
							alt="Job Application Tracker"
							width={48}
							height={48}
							className="h-10 w-10 object-contain"
							priority
						/>
					</div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						Job Application Tracker
					</h1>
					<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
						Sign in to track applications, interviews, and follow-ups
					</p>
				</div>

				<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
					{children}
				</div>
			</main>
		</div>
	)
}
