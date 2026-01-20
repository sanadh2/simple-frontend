"use client"

import JobApplicationForm from "@/components/JobApplicationForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function JobApplicationsPage() {
	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Add New Job Application</CardTitle>
						<CardDescription>
							Track your job applications and stay organized in your job search
						</CardDescription>
					</CardHeader>
					<CardContent>
						<JobApplicationForm />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
