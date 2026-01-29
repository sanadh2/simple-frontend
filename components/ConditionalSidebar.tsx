"use client"

import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface ConditionalSidebarProps {
	children: React.ReactNode
}

export function ConditionalSidebar({ children }: ConditionalSidebarProps) {
	const pathname = usePathname()
	const isPublicNoShellPage = pathname === "/auth" || pathname === "/landing"

	if (isPublicNoShellPage) {
		return children
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Navbar />
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
