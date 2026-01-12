"use client"

import { Heart, Lock } from "lucide-react"
import { ReactNode } from "react"

interface AuthLayoutProps {
	children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
			</div>

			<main className="relative flex-1 flex flex-col items-center justify-center p-4">
				<div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
					<div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600">
						<Lock className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						SecureAuth
					</h1>
					<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
						Full-stack authentication system
					</p>
				</div>

				<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
					{children}
				</div>

				<footer className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400 animate-in fade-in duration-1000 delay-300">
					<p className="flex items-center justify-center gap-1">
						Built with{" "}
						<Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />{" "}
						using Next.js & TanStack Query
					</p>
				</footer>
			</main>
		</div>
	)
}
