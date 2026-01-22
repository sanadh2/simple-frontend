import type { Metadata } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ConditionalSidebar } from "@/components/ConditionalSidebar"
import { Toaster } from "@/components/ui/sonner"
import { env } from "@/env"
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
						<ConditionalSidebar>{children}</ConditionalSidebar>
						<Toaster />
					</QueryProvider>
				</ThemeProvider>
				{env.NODE_ENV === "production" ? (
					<>
						<SpeedInsights />
						<Analytics />
					</>
				) : null}
			</body>
		</html>
	)
}
