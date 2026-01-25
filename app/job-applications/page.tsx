"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, RotateCw, Search, X } from "lucide-react"

import JobApplicationForm from "@/components/JobApplicationForm"
import JobApplicationsList from "@/components/JobApplicationsList"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useJobApplications } from "@/hooks/useJobApplications"
import type { JobStatus } from "@/lib/api"

const STATUS_OPTIONS: { value: JobStatus | ""; label: string }[] = [
	{ value: "All", label: "All Statuses" },
	{ value: "Wishlist", label: "Wishlist" },
	{ value: "Applied", label: "Applied" },
	{ value: "Interview Scheduled", label: "Interview Scheduled" },
	{ value: "Interviewing", label: "Interviewing" },
	{ value: "Offer", label: "Offer" },
	{ value: "Rejected", label: "Rejected" },
	{ value: "Accepted", label: "Accepted" },
	{ value: "Withdrawn", label: "Withdrawn" },
]

const SORT_OPTIONS = [
	{ value: "application_date:desc", label: "Date (Newest)" },
	{ value: "application_date:asc", label: "Date (Oldest)" },
	{ value: "company_name:asc", label: "Company (A-Z)" },
	{ value: "company_name:desc", label: "Company (Z-A)" },
	{ value: "salary_range:desc", label: "Salary (High-Low)" },
	{ value: "salary_range:asc", label: "Salary (Low-High)" },
]

const DATE_FILTER_PREFIX: Record<string, string> = {
	All: "Created",
	"": "Created",
	Wishlist: "Wishlisted",
	Applied: "Applied",
	"Interview Scheduled": "Interview scheduled",
	Interviewing: "Interviewing",
	Offer: "Offer",
	Rejected: "Rejected",
	Accepted: "Accepted",
	Withdrawn: "Withdrawn",
}

function JobApplicationsPageContent() {
	const searchParams = useSearchParams()
	const openForm = searchParams.get("openForm") === "1"
	const prefill = useMemo(() => {
		const company = searchParams.get("company") ?? ""
		const title = searchParams.get("title") ?? ""
		const url =
			searchParams.get("job_posting_url") ?? searchParams.get("url") ?? ""
		const description = searchParams.get("description") ?? ""
		if (!company && !title && !url && !description) {
			return undefined
		}
		const p: Record<string, string> = {}
		if (company) {
			p.company_name = company
		}
		if (title) {
			p.job_title = title
		}
		if (url) {
			p.job_posting_url = url
		}
		if (description) {
			p.job_description = description
		}
		return p
	}, [searchParams])

	const [showForm, setShowForm] = useState(openForm)
	const [search, setSearch] = useState("")
	const [status, setStatus] = useState<JobStatus | "">("")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")
	const [sortBy, setSortBy] = useState("application_date:desc")

	const { sortField, sortOrder } = useMemo(() => {
		const [field, order] = sortBy.split(":")
		return { sortField: field, sortOrder: order as "asc" | "desc" }
	}, [sortBy])

	const filters = useMemo(() => {
		const params: {
			search?: string
			status?: JobStatus
			startDate?: string
			endDate?: string
			sortBy?: string
			sortOrder?: "asc" | "desc"
			limit?: number
		} = {
			limit: 50,
			sortBy: sortField,
			sortOrder,
		}

		if (search) {
			params.search = search
		}
		if (status) {
			params.status = status
		}
		if (startDate) {
			params.startDate = startDate
		}
		if (endDate) {
			params.endDate = endDate
		}

		return params
	}, [search, status, startDate, endDate, sortField, sortOrder])

	const { data, isLoading, error, refetch } = useJobApplications(filters)

	const clearFilters = () => {
		setSearch("")
		setStatus("")
		setStartDate("")
		setEndDate("")
		setSortBy("application_date:desc")
	}

	const hasActiveFilters =
		search ||
		status !== "All" ||
		startDate ||
		endDate ||
		sortBy !== "application_date:desc"

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
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => refetch()}
						disabled={isLoading}
						title="Refresh"
					>
						<RotateCw
							className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</Button>
					<Button onClick={() => setShowForm(!showForm)}>
						<Plus className="mr-2 h-4 w-4" />
						{showForm ? "Hide Form" : "Add New Application"}
					</Button>
				</div>
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
						<JobApplicationForm
							onClose={() => setShowForm(false)}
							prefill={prefill}
						/>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Filters & Search</CardTitle>
					<CardDescription>
						Filter and search through your job applications
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="space-y-2">
								<Label htmlFor="search">Search</Label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										id="search"
										placeholder="Company or job title..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="pl-9"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={status}
									onValueChange={(value) => setStatus(value as JobStatus | "")}
								>
									<SelectTrigger id="status">
										<SelectValue placeholder="All Statuses" />
									</SelectTrigger>
									<SelectContent>
										{STATUS_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="startDate">
									{DATE_FILTER_PREFIX[status] ?? "Created"} from
								</Label>
								<Input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="endDate">
									{DATE_FILTER_PREFIX[status] ?? "Created"} to
								</Label>
								<Input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<div className="space-y-2 flex-1 max-w-xs">
								<Label htmlFor="sortBy">Sort By</Label>
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger id="sortBy">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										{SORT_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{hasActiveFilters && (
								<Button
									variant="outline"
									onClick={clearFilters}
									className="mt-6"
								>
									<X className="mr-2 h-4 w-4" />
									Clear Filters
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<JobApplicationsList
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
			/>
		</div>
	)
}

export default function JobApplicationsPage() {
	return (
		<Suspense
			fallback={
				<LoadingSpinner text="Loading job applications..." fullScreen={false} />
			}
		>
			<JobApplicationsPageContent />
		</Suspense>
	)
}
