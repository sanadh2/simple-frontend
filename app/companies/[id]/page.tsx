"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Building2, ExternalLink, Plus, Trash2 } from "lucide-react"

import CompanyForm from "@/components/CompanyForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompany, useDeleteCompany } from "@/hooks/useCompanies"

const SIZE_LABELS: Record<string, string> = {
	startup: "Startup",
	small: "Small (1-50)",
	medium: "Medium (51-200)",
	large: "Large (201-1000)",
	enterprise: "Enterprise (1000+)",
}

const FUNDING_LABELS: Record<string, string> = {
	bootstrapped: "Bootstrapped",
	seed: "Seed",
	"series-a": "Series A",
	"series-b": "Series B",
	"series-c": "Series C",
	"series-d": "Series D",
	ipo: "IPO",
	acquired: "Acquired",
	unknown: "Unknown",
}

function LoadingState() {
	return (
		<div className="container mx-auto py-8 px-4 space-y-6">
			<Skeleton className="h-10 w-64" />
			<Card>
				<CardHeader>
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-32 mt-2" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-4 w-full mb-2" />
					<Skeleton className="h-4 w-2/3" />
				</CardContent>
			</Card>
		</div>
	)
}

function NotFoundState() {
	return (
		<div className="container mx-auto py-8 px-4">
			<Card>
				<CardContent className="py-12 text-center">
					<p className="text-lg font-medium mb-2">Company not found</p>
					<Button asChild variant="outline">
						<Link href="/companies">Back to Companies</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

function CompanyHeader({
	company,
	showEditForm,
	onToggleEdit,
	onDeleteClick,
	showDeleteDialog,
	onDeleteDialogChange,
	onDeleteConfirm,
	isDeleting,
}: {
	company: { name: string; industry?: string }
	showEditForm: boolean
	onToggleEdit: () => void
	onDeleteClick: () => void
	showDeleteDialog: boolean
	onDeleteDialogChange: (open: boolean) => void
	onDeleteConfirm: () => void
	isDeleting: boolean
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<Building2 className="h-8 w-8 text-muted-foreground" />
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
					<p className="text-muted-foreground">
						{company.industry ?? "No industry specified"}
					</p>
				</div>
			</div>
			<div className="flex gap-2">
				<Button variant="outline" onClick={onToggleEdit}>
					{showEditForm ? "Cancel Edit" : "Edit"}
				</Button>
				<Button variant="destructive" onClick={onDeleteClick}>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</Button>
				<ConfirmDialog
					open={showDeleteDialog}
					onOpenChange={onDeleteDialogChange}
					onConfirm={onDeleteConfirm}
					title="Delete Company"
					description={`Are you sure you want to delete ${company.name}? This will unlink all associated job applications but won't delete them. This action cannot be undone.`}
					confirmText="Delete"
					cancelText="Cancel"
					variant="destructive"
					isLoading={isDeleting}
				/>
			</div>
		</div>
	)
}

function CompanyInfoCard({
	company,
}: {
	company: { size?: string; funding_stage?: string; glassdoor_url?: string }
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Company Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					{company.size && (
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Company Size
							</p>
							<p className="text-lg">{SIZE_LABELS[company.size]}</p>
						</div>
					)}
					{company.funding_stage && (
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Funding Stage
							</p>
							<p className="text-lg">{FUNDING_LABELS[company.funding_stage]}</p>
						</div>
					)}
				</div>
				{company.glassdoor_url && (
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-2">
							Glassdoor
						</p>
						<a
							href={company.glassdoor_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline flex items-center gap-1"
						>
							View on Glassdoor
							<ExternalLink className="h-3 w-3" />
						</a>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

function CultureNotesCard({ cultureNotes }: { cultureNotes?: string }) {
	if (!cultureNotes) {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Culture Notes</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="whitespace-pre-wrap">{cultureNotes}</p>
			</CardContent>
		</Card>
	)
}

function InterviewProcessCard({
	interviewProcess,
}: {
	interviewProcess?: string
}) {
	if (!interviewProcess) {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Interview Process Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="whitespace-pre-wrap">{interviewProcess}</p>
			</CardContent>
		</Card>
	)
}

function ProsConsCard({
	company,
}: {
	company: { pros: string[]; cons: string[] }
}) {
	if (company.pros.length === 0 && company.cons.length === 0) {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Pros & Cons</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{company.pros.length > 0 && (
					<div>
						<h4 className="font-semibold mb-2 text-green-600">Pros</h4>
						<ul className="list-disc list-inside space-y-1">
							{company.pros.map((pro) => (
								<li key={pro}>{pro}</li>
							))}
						</ul>
					</div>
				)}
				{company.cons.length > 0 && (
					<div>
						<h4 className="font-semibold mb-2 text-red-600">Cons</h4>
						<ul className="list-disc list-inside space-y-1">
							{company.cons.map((con) => (
								<li key={con}>{con}</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

function JobApplicationsCard({
	company,
}: {
	company: {
		application_count?: number
		applications?: Array<{
			_id: string
			job_title: string
			status: string
			application_date: string
		}>
		name: string
	}
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Job Applications</CardTitle>
				<CardDescription>
					{company.application_count ?? 0} application
					{company.application_count !== 1 ? "s" : ""} linked
				</CardDescription>
			</CardHeader>
			<CardContent>
				{company.applications && company.applications.length > 0 ? (
					<div className="space-y-3">
						{company.applications.map((app) => (
							<Link
								key={app._id}
								href={`/job-applications?company=${encodeURIComponent(company.name)}`}
							>
								<div className="p-3 border rounded-lg hover:bg-accent transition-colors">
									<p className="font-medium">{app.job_title}</p>
									<div className="flex items-center gap-2 mt-1">
										<Badge variant="outline">{app.status}</Badge>
										<span className="text-xs text-muted-foreground">
											{new Date(app.application_date).toLocaleDateString()}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-4">
						<p className="text-sm text-muted-foreground mb-3">
							No applications linked yet
						</p>
						<Button asChild size="sm" variant="outline">
							<Link href="/job-applications">
								<Plus className="mr-2 h-4 w-4" />
								Add Application
							</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default function CompanyProfilePage() {
	const params = useParams()
	const router = useRouter()
	const companyId = params.id as string
	const [showEditForm, setShowEditForm] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const { data: company, isLoading } = useCompany(companyId, true)
	const deleteCompany = useDeleteCompany()

	const handleDelete = async () => {
		await deleteCompany.mutateAsync(companyId)
		router.push("/companies")
	}

	if (isLoading) {
		return <LoadingState />
	}

	if (!company) {
		return <NotFoundState />
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-6">
			<CompanyHeader
				company={company}
				showEditForm={showEditForm}
				onToggleEdit={() => setShowEditForm(!showEditForm)}
				onDeleteClick={() => setShowDeleteDialog(true)}
				showDeleteDialog={showDeleteDialog}
				onDeleteDialogChange={setShowDeleteDialog}
				onDeleteConfirm={handleDelete}
				isDeleting={deleteCompany.isPending}
			/>

			{showEditForm && (
				<Card>
					<CardHeader>
						<CardTitle>Edit Company</CardTitle>
						<CardDescription>
							Update company information and research notes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CompanyForm
							company={company}
							onClose={() => setShowEditForm(false)}
						/>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<CompanyInfoCard company={company} />
					<CultureNotesCard cultureNotes={company.culture_notes} />
					<InterviewProcessCard
						interviewProcess={company.interview_process_overview}
					/>
					<ProsConsCard company={company} />
				</div>

				<div className="space-y-6">
					<JobApplicationsCard company={company} />
				</div>
			</div>
		</div>
	)
}
