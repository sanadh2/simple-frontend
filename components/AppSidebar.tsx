"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
	BarChart3,
	Briefcase,
	Building2,
	FileCheck,
	FileText,
	Home,
	LogOut,
	Moon,
	Sun,
} from "lucide-react"

import LogoutModal from "@/components/LogoutModal"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar"
import { useLogout, useLogoutAll, useProfile } from "@/hooks/useAuth"

export function AppSidebar() {
	const pathname = usePathname()
	const { data: user } = useProfile()
	const { mutate: logout, isPending: isLoggingOut } = useLogout()
	const { mutate: logoutAll, isPending: isLoggingOutAll } = useLogoutAll()
	const { theme, setTheme } = useTheme()
	const [showLogoutModal, setShowLogoutModal] = useState(false)

	const isActive = (path: string) => pathname === path

	const navItems = [
		{
			title: "Home",
			url: "/",
			icon: Home,
		},
		{
			title: "Applications",
			url: "/job-applications",
			icon: Briefcase,
		},
		{
			title: "Analytics",
			url: "/analytics",
			icon: BarChart3,
		},
		{
			title: "Resumes",
			url: "/resumes",
			icon: FileCheck,
		},
		{
			title: "Companies",
			url: "/companies",
			icon: Building2,
		},
		{
			title: "Logs",
			url: "/logs",
			icon: FileText,
		},
	]

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
									<Image
										width={32}
										height={32}
										src="/logo.svg"
										alt="Job Application Tracker"
										className="h-full w-full object-contain"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										Job Application Tracker
									</span>
									<span className="truncate text-xs">Dashboard</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										asChild
										isActive={isActive(item.url)}
										tooltip={item.title}
									>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					{user && (
						<>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									size="lg"
									isActive={isActive("/profile")}
									tooltip="Profile"
								>
									<Link href="/profile">
										<div className="flex aspect-square size-8 items-center justify-center bg-linear-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
											{user.first_name.charAt(0)}
											{user.last_name.charAt(0)}
										</div>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user.first_name} {user.last_name}
											</span>
											<span className="truncate text-xs">{user.email}</span>
										</div>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarSeparator />
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
									tooltip="Toggle theme"
								>
									{theme === "dark" ? (
										<>
											<Sun />
											<span>Light Mode</span>
										</>
									) : (
										<>
											<Moon />
											<span>Dark Mode</span>
										</>
									)}
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => setShowLogoutModal(true)}
									disabled={isLoggingOut || isLoggingOutAll}
									className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
									tooltip="Logout"
								>
									<LogOut />
									<span>Logout</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</>
					)}
				</SidebarMenu>
			</SidebarFooter>
			<LogoutModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
				onLogout={() => logout()}
				onLogoutAll={() => logoutAll()}
				isLoading={isLoggingOut || isLoggingOutAll}
			/>
		</Sidebar>
	)
}
