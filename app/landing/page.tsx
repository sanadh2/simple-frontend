import Image from "next/image"
import Link from "next/link"
import { BarChart3, CalendarDays, CheckCircle2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LandingPage() {
	return (
		<div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
			<header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
				<Link href="/landing" className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-white/70 ring-1 ring-border backdrop-blur dark:bg-zinc-900/60">
						<Image
							src="/logo.svg"
							alt="Job Application Tracker"
							width={32}
							height={32}
							className="h-7 w-7 object-contain"
							priority
						/>
					</div>
					<span className="text-sm font-semibold tracking-tight">
						Job Application Tracker
					</span>
				</Link>

				<div className="flex items-center gap-2">
					<Button asChild variant="ghost">
						<Link href="/auth">Sign in</Link>
					</Button>
					<Button asChild>
						<Link href="/auth">Create account</Link>
					</Button>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
				<div className="grid gap-10 lg:grid-cols-2 lg:items-center">
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground shadow-sm backdrop-blur">
							<Sparkles className="size-4 text-primary" />
							<span>Stay organized throughout your job search</span>
						</div>

						<h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
							Track applications, interviews, and follow-ups in one place
						</h1>
						<p className="text-pretty text-base text-muted-foreground sm:text-lg">
							Job Application Tracker helps you keep momentum: log every
							application, see what’s working, and never miss a follow-up.
						</p>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<Button asChild size="lg">
								<Link href="/auth">Get started</Link>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href="/auth">Sign in</Link>
							</Button>
						</div>

						<ul className="grid gap-3 pt-2 text-sm text-muted-foreground sm:grid-cols-2">
							<li className="flex items-start gap-2">
								<CheckCircle2 className="mt-0.5 size-4 text-primary" />
								<span>Clean dashboard overview</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle2 className="mt-0.5 size-4 text-primary" />
								<span>Fast search & filters</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle2 className="mt-0.5 size-4 text-primary" />
								<span>Interview calendar</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle2 className="mt-0.5 size-4 text-primary" />
								<span>Analytics that improve outcomes</span>
							</li>
						</ul>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Card className="bg-background/70 backdrop-blur">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<BarChart3 className="size-4 text-primary" />
									See what’s working
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Spot trends in response rates and optimize how/when you apply.
							</CardContent>
						</Card>

						<Card className="bg-background/70 backdrop-blur">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<CalendarDays className="size-4 text-primary" />
									Never miss a follow-up
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Keep interviews and reminders visible so nothing slips.
							</CardContent>
						</Card>

						<Card className="bg-background/70 backdrop-blur sm:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<CheckCircle2 className="size-4 text-primary" />
									All your context in one record
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Store job links, notes, contacts, and status history so you can
								move faster and stay consistent.
							</CardContent>
						</Card>
					</div>
				</div>

				<footer className="mt-16 border-t pt-8 text-sm text-muted-foreground">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p>© {new Date().getFullYear()} Job Application Tracker</p>
						<div className="flex items-center gap-4">
							<Link className="hover:text-foreground" href="/auth">
								Sign in
							</Link>
						</div>
					</div>
				</footer>
			</main>
		</div>
	)
}
