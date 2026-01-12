"use client"

import {
	Bookmark,
	FileText,
	Home,
	LogOut,
	Menu,
	Moon,
	Sun,
	X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLogout, useProfile } from "@/hooks/useAuth"

export default function Navbar() {
	const pathname = usePathname()
	const { data: user, isLoading } = useProfile()
	const { mutate: logout, isPending: isLoggingOut } = useLogout()
	const { theme, setTheme } = useTheme()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const isActive = (path: string) => pathname === path

	const navLinks = [
		{ href: "/", label: "Home", icon: Home },
		{ href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
		{ href: "/logs", label: "Logs", icon: FileText },
	]

	const handleLogout = () => {
		logout()
		setIsMobileMenuOpen(false)
	}

	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-zinc-950/60">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
								A
							</div>
							<span className="text-xl font-bold text-zinc-900 dark:text-white hidden sm:inline-block">
								Auth App
							</span>
						</Link>
					</div>

					{user && (
						<>
							<div className="hidden md:flex items-center space-x-1">
								{navLinks.map((link) => {
									const Icon = link.icon
									return (
										<Link key={link.href} href={link.href}>
											<Button
												variant={isActive(link.href) ? "default" : "ghost"}
												className={`flex items-center space-x-2 ${
													isActive(link.href)
														? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
														: ""
												}`}
											>
												<Icon className="h-4 w-4" />
												<span>{link.label}</span>
											</Button>
										</Link>
									)
								})}
							</div>

							<div className="hidden md:flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
									className="p-2"
									aria-label="Toggle theme"
								>
									{theme === "dark" ? (
										<Sun className="h-4 w-4" />
									) : (
										<Moon className="h-4 w-4" />
									)}
								</Button>
								<div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
										{user.firstName.charAt(0)}
										{user.lastName.charAt(0)}
									</div>
									<div className="hidden lg:block">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[120px]">
											{user.email}
										</p>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleLogout}
									disabled={isLoggingOut}
									className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
								>
									<LogOut className="h-4 w-4 mr-2" />
									<span className="hidden lg:inline">Logout</span>
								</Button>
							</div>

							<div className="md:hidden">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
									className="p-2"
								>
									{isMobileMenuOpen ? (
										<X className="h-5 w-5" />
									) : (
										<Menu className="h-5 w-5" />
									)}
								</Button>
							</div>
						</>
					)}

					{!user && !isLoading && (
						<div className="flex items-center space-x-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="p-2"
								aria-label="Toggle theme"
							>
								{theme === "dark" ? (
									<Sun className="h-4 w-4" />
								) : (
									<Moon className="h-4 w-4" />
								)}
							</Button>
							<Link href="/">
								<Button variant="ghost" size="sm">
									Login
								</Button>
							</Link>
						</div>
					)}

					{isLoading && (
						<div className="flex items-center space-x-2">
							<div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
						</div>
					)}
				</div>

				{user && isMobileMenuOpen && (
					<div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 py-4 space-y-2">
						{navLinks.map((link) => {
							const Icon = link.icon
							return (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
										isActive(link.href)
											? "bg-blue-600 text-white dark:bg-blue-500"
											: "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
									}`}
								>
									<Icon className="h-5 w-5" />
									<span className="font-medium">{link.label}</span>
								</Link>
							)
						})}
						<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
							<button
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
							>
								{theme === "dark" ? (
									<>
										<Sun className="h-5 w-5" />
										<span className="font-medium">Light Mode</span>
									</>
								) : (
									<>
										<Moon className="h-5 w-5" />
										<span className="font-medium">Dark Mode</span>
									</>
								)}
							</button>
							<div className="flex items-center space-x-3 px-4 py-2">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
									{user.firstName.charAt(0)}
									{user.lastName.charAt(0)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
										{user.email}
									</p>
								</div>
							</div>
							<button
								onClick={handleLogout}
								disabled={isLoggingOut}
								className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
							>
								<LogOut className="h-5 w-5" />
								<span className="font-medium">Logout</span>
							</button>
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}
