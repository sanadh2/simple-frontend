"use client"

import { redirect } from "next/navigation"

import DashboardOverview from "@/components/DashboardOverview"
import ErrorFallback from "@/components/ErrorBoundaryFallback"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useProfile } from "@/hooks/useAuth"

export default function Home() {
	const { data: user, isLoading, error, refetch } = useProfile()

	if (error && !user) {
		return <ErrorFallback error={error} onRetry={() => refetch()} />
	}

	if (isLoading) {
		return <LoadingSpinner text="Checking authentication..." />
	}

	if (!user) {
		redirect("/auth")
	}
	return <DashboardOverview />
}
