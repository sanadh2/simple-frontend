"use client"

import Image from "next/image"
import Link from "next/link"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Navbar() {
	return (
		<header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
			<SidebarTrigger className="-ml-1" />
			<div className="flex items-center gap-2">
				<Link href="/" className="flex items-center space-x-2">
					<div className="flex h-8 w-8 items-center justify-center overflow-hidden">
						<Image
							width={32}
							height={32}
							src="/logo.svg"
							alt="Job Application Tracker"
							className="h-full w-full object-contain"
							priority
						/>
					</div>
					<span className="text-xl font-bold text-zinc-900 dark:text-white hidden sm:inline-block">
						Job Application Tracker
					</span>
				</Link>
			</div>
		</header>
	)
}
