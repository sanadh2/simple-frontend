import { redirect } from "next/navigation"

import DashboardOverview from "@/components/DashboardOverview"
import { getIsAuthenticated } from "@/lib/auth-server"

export default async function Home() {
	const isAuthed = await getIsAuthenticated()
	if (!isAuthed) {
		redirect("/landing")
	}

	return <DashboardOverview />
}
