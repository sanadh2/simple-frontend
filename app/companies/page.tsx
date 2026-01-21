"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Building2, Plus, Search, X } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanies } from "@/hooks/useCompanies"
import type { CompanySize, FundingStage } from "@/lib/api"

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
	{ value: "startup", label: "Startup" },
	{ value: "small", label: "Small (1-50)" },
	{ value: "medium", label: "Medium (51-200)" },
	{ value: "large", label: "Large (201-1000)" },
	{ value: "enterprise", label: "Enterprise (1000+)" },
]

const FUNDING_OPTIONS: { value: FundingStage; label: string }[] = [
	{ value: "bootstrapped", label: "Bootstrapped" },
	{ value: "seed", label: "Seed" },
	{ value: "series-a", label: "Series A" },
	{ value: "series-b", label: "Series B" },
	{ value: "series-c", label: "Series C" },
	{ value: "series-d", label: "Series D" },
	{ value: "ipo", label: "IPO" },
	{ value: "acquired", label: "Acquired" },
	{ value: "unknown", label: "Unknown" },
]

const SORT_OPTIONS = [
	{ value: "createdAt:desc", label: "Recently Added" },
	{ value: "createdAt:asc", label: "Oldest First" },
	{ value: "name:asc", label: "Name (A-Z)" },
	{ value: "name:desc", label: "Name (Z-A)" },
]

const SKELETON_COUNT = 6

export default function CompaniesPage() {
	const [showForm, setShowForm] = useState(false)
	const [search, setSearch] = useState("")
	const [size, setSize] = useState<CompanySize | "__all__">("__all__")
	const [fundingStage, setFundingStage] = useState<FundingStage | "__all__">(
		"__all__"
	)
	const [sortBy, setSortBy] = useState("createdAt:desc")
	const [page, setPage] = useState(1)

	const { sortField, sortOrder } = useMemo(() => {
		const [field, order] = sortBy.split(":")
		return { sortField: field, sortOrder: order as "asc" | "desc" }
	}, [sortBy])

	const filters = useMemo(() => {
		const params: {
			search?: string
			size?: CompanySize
			funding_stage?: FundingStage
			sortBy?: string
			sortOrder?: "asc" | "desc"
			page?: number
			limit?: number
		} = {
			page,
			limit: 20,
			sortBy: sortField,
			sortOrder,
		}

		if (search) {
			params.search = search
		}
		if (size && size !== "__all__") {
			params.size = size
		}
		if (fundingStage && fundingStage !== "__all__") {
			params.funding_stage = fundingStage
		}

		return params
	}, [search, size, fundingStage, sortField, sortOrder, page])

	const { data, isLoading } = useCompanies(filters)

	const clearFilters = () => {
		setSearch("")
		setSize("__all__")
		setFundingStage("__all__")
		setSortBy("createdAt:desc")
		setPage(1)
	}

	const hasActiveFilters =
		search ||
		size !== "__all__" ||
		fundingStage !== "__all__" ||
		sortBy !== "createdAt:desc"

	return (
		<div className="container mx-auto py-8 px-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Company Research Hub
					</h1>
					<p className="text-muted-foreground">
						Track and research companies you&apos;re interested in
					</p>
				</div>
				<Button onClick={() => setShowForm(!showForm)}>
					<Plus className="mr-2 h-4 w-4" />
					{showForm ? "Hide Form" : "Add New Company"}
				</Button>
			</div>

			{showForm && (
				<Card>
					<CardHeader>
						<CardTitle>Add New Company</CardTitle>
						<CardDescription>
							Create a company profile to track research and link applications
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CompanyForm onClose={() => setShowForm(false)} />
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Filters & Search</CardTitle>
					<CardDescription>
						Filter and search through your companies
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
										placeholder="Company name..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="pl-9"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="size">Company Size</Label>
								<Select
									value={size}
									onValueChange={(value) =>
										setSize(value as CompanySize | "__all__")
									}
								>
									<SelectTrigger id="size">
										<SelectValue placeholder="All Sizes" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__all__">All Sizes</SelectItem>
										{SIZE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="funding">Funding Stage</Label>
								<Select
									value={fundingStage}
									onValueChange={(value) =>
										setFundingStage(value as FundingStage | "__all__")
									}
								>
									<SelectTrigger id="funding">
										<SelectValue placeholder="All Stages" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__all__">All Stages</SelectItem>
										{FUNDING_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
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
						</div>

						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters} className="mt-2">
								<X className="mr-2 h-4 w-4" />
								Clear Filters
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: SKELETON_COUNT }, () => (
						<Card key={crypto.randomUUID()}>
							<CardHeader>
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-2/3" />
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<>
					{data && data.companies.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{data.companies.map((company) => (
								<Link key={company._id} href={`/companies/${company._id}`}>
									<Card className="cursor-pointer h-full">
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-2">
													<Building2 className="h-5 w-5 text-muted-foreground" />
													<CardTitle className="text-xl">
														{company.name}
													</CardTitle>
												</div>
											</div>
											<CardDescription>
												{company.industry ?? "No industry specified"}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{company.size && (
													<Badge variant="secondary">{company.size}</Badge>
												)}
												{company.funding_stage && (
													<Badge variant="outline">
														{company.funding_stage}
													</Badge>
												)}
												{company.application_count !== undefined &&
													company.application_count > 0 && (
														<div className="text-sm text-muted-foreground mt-2">
															{company.application_count} application
															{company.application_count !== 1 ? "s" : ""}
														</div>
													)}
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-lg font-medium mb-2">No companies found</p>
								<p className="text-muted-foreground">
									{hasActiveFilters
										? "Try adjusting your filters"
										: "Get started by adding your first company"}
								</p>
							</CardContent>
						</Card>
					)}

					{data && data.totalPages > 1 && (
						<div className="flex items-center justify-center gap-2">
							<Button
								variant="outline"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {data.currentPage} of {data.totalPages}
							</span>
							<Button
								variant="outline"
								onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
								disabled={page === data.totalPages}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	)
}
