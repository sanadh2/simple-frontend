import type { Metadata } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/providers/QueryProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"

import "./globals.css"

const bricolageGrotesque = Bricolage_Grotesque({
	variable: "--font-bricolage-grotesque",
	subsets: ["latin"],
	display: "swap",
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Job Application Tracker",
	description: "Track and manage your job applications",
	icons: {
		icon: "/logo.svg",
		apple: "/logo.svg",
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${bricolageGrotesque.variable} ${geistMono.variable} font-sans antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>
						<SidebarProvider>
							<AppSidebar />
							<SidebarInset>
								<Navbar />
								<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
									{children}
								</div>
							</SidebarInset>
						</SidebarProvider>
						<Toaster />
					</QueryProvider>
				</ThemeProvider>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	)
}
