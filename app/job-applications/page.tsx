"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import JobApplicationForm from "@/components/JobApplicationForm"
import JobApplicationsList from "@/components/JobApplicationsList"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

export default function JobApplicationsPage() {
	const [showForm, setShowForm] = useState(false)

	return (
		<div className="container mx-auto py-8 px-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Job Applications
					</h1>
					<p className="text-muted-foreground">
						Track and manage your job applications
					</p>
				</div>
				<Button onClick={() => setShowForm(!showForm)}>
					<Plus className="mr-2 h-4 w-4" />
					{showForm ? "Hide Form" : "Add New Application"}
				</Button>
			</div>

			{showForm && (
				<Card>
					<CardHeader>
						<CardTitle>Add New Job Application</CardTitle>
						<CardDescription>
							Track your job applications and stay organized in your job search
						</CardDescription>
					</CardHeader>
					<CardContent>
						<JobApplicationForm onClose={() => setShowForm(false)} />
					</CardContent>
				</Card>
			)}

			<JobApplicationsList />
		</div>
	)
}
