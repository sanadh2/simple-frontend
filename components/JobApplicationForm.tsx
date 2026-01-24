"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import {
	DocumentUpload,
	type DocumentUploadRef,
} from "@/components/DocumentUpload"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useCompanies, useCreateCompany } from "@/hooks/useCompanies"
import { useCreateJobApplication } from "@/hooks/useJobApplications"
import { useResumes } from "@/hooks/useResumes"
import {
	apiClient,
	type CreateCompanyInput,
	type CreateJobApplicationInput,
	type JobStatus,
	type LocationType,
	type PriorityLevel,
} from "@/lib/api"
import {
	composeSalaryRange,
	SALARY_CURRENCIES,
	SALARY_PERIODS,
} from "@/lib/salaryUtils"

const jobApplicationSchema = z.object({
	company_id: z.string().optional(),
	company_name: z.string().min(1, "Company name is required"),
	job_title: z.string().min(1, "Job title is required"),
	job_description: z.string().optional(),
	notes: z.string().optional(),
	application_date: z.string().min(1, "Application date is required"),
	status: z.enum([
		"Wishlist",
		"Applied",
		"Interview Scheduled",
		"Interviewing",
		"Offer",
		"Rejected",
		"Accepted",
		"Withdrawn",
	]),
	salary_min: z.string().optional(),
	salary_max: z.string().optional(),
	salary_currency: z.enum([
		"Unknown",
		"USD",
		"EUR",
		"GBP",
		"CHF",
		"CAD",
		"AUD",
		"JPY",
		"KRW",
		"BRL",
		"INR",
		"MXN",
	]),
	salary_period: z.enum(["annual", "monthly", "hourly"]),
	location_type: z.enum(["remote", "hybrid", "onsite"]),
	location_city: z.string().optional(),
	job_posting_url: z.url("Invalid URL format").optional().or(z.literal("")),
	application_method: z.string().optional(),
	priority: z.enum(["high", "medium", "low"]),
	resume_id: z.string().optional(),
	resume_url: z.url().optional().or(z.literal("")),
	cover_letter_url: z.url().optional().or(z.literal("")),
})

type JobApplicationFormValues = z.infer<typeof jobApplicationSchema>

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
	{ value: "Wishlist", label: "Wishlist" },
	{ value: "Applied", label: "Applied" },
	{ value: "Interview Scheduled", label: "Interview Scheduled" },
	{ value: "Interviewing", label: "Interviewing" },
	{ value: "Offer", label: "Offer" },
	{ value: "Rejected", label: "Rejected" },
	{ value: "Accepted", label: "Accepted" },
	{ value: "Withdrawn", label: "Withdrawn" },
]

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string }[] = [
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
]

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
	{ value: "remote", label: "Remote" },
	{ value: "hybrid", label: "Hybrid" },
	{ value: "onsite", label: "Onsite" },
]

export default function JobApplicationForm({
	onClose,
}: {
	onClose: () => void
}) {
	const createJobApplication = useCreateJobApplication()
	const createCompany = useCreateCompany()
	const { data: companiesData } = useCompanies({ limit: 100 })
	const { data: resumesData } = useResumes()

	const form = useForm<JobApplicationFormValues>({
		resolver: zodResolver(jobApplicationSchema),
		defaultValues: {
			company_id: "",
			company_name: "",
			job_title: "",
			job_description: "",
			notes: "",
			application_date: new Date().toISOString().split("T")[0],
			status: "Wishlist",
			salary_min: "",
			salary_max: "",
			salary_currency: "Unknown",
			salary_period: "annual",
			location_type: "remote",
			location_city: "",
			job_posting_url: "",
			application_method: "",
			priority: "medium",
			resume_id: "",
			resume_url: "",
			cover_letter_url: "",
		},
	})

	const selectedCompanyId = form.watch("company_id")
	const companyName = form.watch("company_name")
	const showCreateButton =
		!selectedCompanyId &&
		companyName.trim() !== "" &&
		companyName.trim().length > 0
	const companies = useMemo(
		() => companiesData?.companies ?? [],
		[companiesData]
	)

	// Update company_name when a company is selected
	useEffect(() => {
		if (selectedCompanyId) {
			const selectedCompany = companies.find((c) => c._id === selectedCompanyId)
			if (selectedCompany) {
				form.setValue("company_name", selectedCompany.name)
			}
		}
	}, [selectedCompanyId, companies, form])

	const resumeUploadRef = useRef<DocumentUploadRef>(null)
	const coverLetterUploadRef = useRef<DocumentUploadRef>(null)
	const [resumeFile, setResumeFile] = useState<File | null>(null)
	const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
	const [isUploadingResume, setIsUploadingResume] = useState(false)
	const [isUploadingCoverLetter, setIsUploadingCoverLetter] = useState(false)

	const handleFileUpload = async (
		file: File,
		type: "resume" | "cover_letter"
	): Promise<string | null> => {
		try {
			if (type === "resume") {
				setIsUploadingResume(true)
			} else {
				setIsUploadingCoverLetter(true)
			}

			const response = await apiClient.uploadJobApplicationFile(file, type)
			if (response.success && response.data) {
				toast.success(
					`${type === "resume" ? "Resume" : "Cover letter"} uploaded successfully`
				)
				return response.data.url
			}
			throw new Error(response.message || "Upload failed")
		} catch (error) {
			toast.error(
				`Failed to upload ${type === "resume" ? "resume" : "cover letter"}`,
				{
					description: error instanceof Error ? error.message : "Unknown error",
				}
			)
			return null
		} finally {
			if (type === "resume") {
				setIsUploadingResume(false)
			} else {
				setIsUploadingCoverLetter(false)
			}
		}
	}

	const handleCreateCompany = async () => {
		const companyName = form.getValues("company_name")
		if (!companyName.trim()) {
			toast.error("Please enter a company name")
			return
		}

		const newCompany: CreateCompanyInput = {
			name: companyName.trim(),
		}
		const createdCompany = await createCompany.mutateAsync(newCompany)
		form.setValue("company_id", createdCompany._id)
		form.setValue("company_name", createdCompany.name)
		toast.success("Company created and linked!")
	}

	const ensureCompanyCreated = async (
		companyId: string | undefined,
		companyName: string
	): Promise<string | undefined> => {
		if (companyId || !companyName.trim()) {
			return companyId
		}

		try {
			const newCompany: CreateCompanyInput = {
				name: companyName.trim(),
			}
			const createdCompany = await createCompany.mutateAsync(newCompany)
			form.setValue("company_id", createdCompany._id)
			return createdCompany._id
		} catch {
			toast.error("Failed to create company. Please try again.")
			throw new Error("Company creation failed")
		}
	}

	const uploadResumeIfNeeded = async (
		currentUrl: string | undefined
	): Promise<string | undefined> => {
		if (!resumeFile) {
			return currentUrl
		}

		const uploadedUrl = await handleFileUpload(resumeFile, "resume")
		if (!uploadedUrl) {
			throw new Error("Resume upload failed")
		}

		return uploadedUrl
	}

	const uploadCoverLetterIfNeeded = async (
		currentUrl: string | undefined
	): Promise<string | undefined> => {
		if (!coverLetterFile) {
			return currentUrl
		}

		const uploadedUrl = await handleFileUpload(coverLetterFile, "cover_letter")
		if (!uploadedUrl) {
			throw new Error("Cover letter upload failed")
		}

		return uploadedUrl
	}

	const buildPayload = (params: {
		data: JobApplicationFormValues
		companyId: string | undefined
		resumeId: string | undefined
		resumeUrl: string | undefined
		coverLetterUrl: string | undefined
	}): CreateJobApplicationInput => {
		const { data, companyId, resumeId, resumeUrl, coverLetterUrl } = params
		const minN = data.salary_min ? parseFloat(data.salary_min) : NaN
		const maxN = data.salary_max ? parseFloat(data.salary_max) : NaN
		const hasMin = !Number.isNaN(minN)
		const hasMax = !Number.isNaN(maxN)
		let salary_range: string | undefined
		if (hasMin || hasMax) {
			const lo = hasMin && hasMax ? Math.min(minN, maxN) : hasMin ? minN : maxN
			const hi = hasMin && hasMax ? Math.max(minN, maxN) : hasMin ? minN : maxN
			salary_range = composeSalaryRange(
				lo,
				hi,
				data.salary_currency,
				data.salary_period
			)
		} else {
			salary_range = undefined
		}

		return {
			company_id: companyId,
			company_name: data.company_name,
			job_title: data.job_title,
			job_description: data.job_description ?? undefined,
			notes: data.notes ?? undefined,
			application_date: data.application_date,
			status: data.status,
			salary_range,
			location_type: data.location_type,
			location_city: data.location_city ?? undefined,
			job_posting_url: data.job_posting_url ?? undefined,
			application_method: data.application_method ?? undefined,
			priority: data.priority,
			resume_id: resumeId,
			resume_url: resumeUrl,
			cover_letter_url: coverLetterUrl,
		}
	}

	const resetFormState = () => {
		form.reset()
		setResumeFile(null)
		setCoverLetterFile(null)
		resumeUploadRef.current?.clearFile()
		coverLetterUploadRef.current?.clearFile()
		onClose()
	}

	const onSubmit = async (data: JobApplicationFormValues) => {
		const finalCompanyId = await ensureCompanyCreated(
			data.company_id,
			data.company_name
		)

		const resumeId = data.resume_id ?? undefined
		const resumeUrl = resumeId
			? undefined
			: await uploadResumeIfNeeded(data.resume_url ?? undefined)
		const coverLetterUrl = await uploadCoverLetterIfNeeded(
			data.cover_letter_url ?? undefined
		)

		const payload = buildPayload({
			data,
			companyId: finalCompanyId,
			resumeId,
			resumeUrl,
			coverLetterUrl,
		})

		await createJobApplication.mutateAsync(payload, {
			onSuccess: resetFormState,
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="company_id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Link to Company (Optional)</FormLabel>
								<Select
									onValueChange={(value) => {
										if (value === "__new__") {
											field.onChange(undefined)
											form.setValue("company_name", "")
										} else {
											field.onChange(value)
										}
									}}
									value={field.value ?? "__new__"}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select existing company" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="__new__">Create new company</SelectItem>
										{companies.map((company) => (
											<SelectItem key={company._id} value={company._id}>
												{company.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="company_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Company Name *</FormLabel>
								<FormControl>
									<div className="flex gap-2">
										<Input
											placeholder="e.g., Google"
											{...field}
											disabled={!!selectedCompanyId}
										/>
										{showCreateButton && (
											<Button
												type="button"
												variant="outline"
												onClick={handleCreateCompany}
												disabled={createCompany.isPending}
											>
												{createCompany.isPending
													? "Creating..."
													: "Create & Link"}
											</Button>
										)}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{showCreateButton && (
						<p className="text-xs text-muted-foreground md:col-span-2">
							Click &quot;Create & Link&quot; to create a company profile and
							link it to this application, or select an existing company above.
						</p>
					)}

					<FormField
						control={form.control}
						name="job_title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Job Title *</FormLabel>
								<FormControl>
									<Input placeholder="e.g., Software Engineer" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="application_date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Application Date *</FormLabel>
								<FormControl>
									<Input type="date" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status *</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{STATUS_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="priority"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Priority *</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select priority" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{PRIORITY_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="location_type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Location Type *</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select location type" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{LOCATION_TYPE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="location_city"
						render={({ field }) => (
							<FormItem>
								<FormLabel>City</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g., San Francisco"
										{...field}
										disabled={form.watch("location_type") === "remote"}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="salary_min"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start of range</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="e.g. 50000 (annual) or 15 (hourly)"
										{...field}
										value={field.value ?? ""}
										onChange={(e) =>
											field.onChange(
												e.target.value === "" ? "" : e.target.value
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="salary_max"
						render={({ field }) => (
							<FormItem>
								<FormLabel>End of range</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="e.g. 70000 (annual) or 20 (hourly)"
										{...field}
										value={field.value ?? ""}
										onChange={(e) =>
											field.onChange(
												e.target.value === "" ? "" : e.target.value
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="salary_currency"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Currency</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select currency" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{SALARY_CURRENCIES.map((c) => (
											<SelectItem key={c.value} value={c.value}>
												{c.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									Currency for the numbers above (e.g. USD, EUR). Use Unknown if
									not specified.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="salary_period"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Annual, monthly, or hourly?</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{SALARY_PERIODS.map((p) => (
											<SelectItem key={p.value} value={p.value}>
												{p.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									Is this pay per year, per month, or per hour? Pick what
									matches the job posting.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="application_method"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Application Method</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g., Company website, LinkedIn, Referral"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="job_posting_url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Job Posting URL</FormLabel>
								<FormControl>
									<Input type="url" placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="job_description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Job Description</FormLabel>
							<FormControl>
								<textarea
									{...field}
									rows={4}
									className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Paste or describe the job posting details..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes</FormLabel>
							<FormControl>
								<textarea
									{...field}
									rows={4}
									className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Add your personal notes, reminders, or thoughts about this application..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-4">
					<FormField
						control={form.control}
						name="resume_id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Resume (Select from Managed Resumes)</FormLabel>
								<Select
									onValueChange={(value) => {
										if (value === "__upload__") {
											field.onChange(undefined)
											form.setValue("resume_url", "")
										} else if (value === "__none__") {
											field.onChange(undefined)
										} else {
											field.onChange(value)
											setResumeFile(null)
											form.setValue("resume_url", "")
											resumeUploadRef.current?.clearFile()
										}
									}}
									value={field.value ?? "__none__"}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a resume or upload new" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="__none__">None</SelectItem>
										{resumesData && resumesData.length > 0 ? (
											<>
												{resumesData.map((resume) => (
													<SelectItem key={resume._id} value={resume._id}>
														Resume v{resume.version}
														{resume.description
															? ` - ${resume.description}`
															: ""}
													</SelectItem>
												))}
												<SelectItem value="__upload__">
													Upload New Resume
												</SelectItem>
											</>
										) : (
											<SelectItem value="__upload__">
												Upload New Resume
											</SelectItem>
										)}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{(!form.watch("resume_id") ||
						form.watch("resume_id") === "__upload__") && (
						<FormField
							control={form.control}
							name="resume_url"
							render={() => (
								<FormItem>
									<FormLabel>Upload Resume File</FormLabel>
									<FormControl>
										<DocumentUpload
											ref={resumeUploadRef}
											label="Resume"
											currentFileUrl={form.watch("resume_url") ?? undefined}
											onFileChange={(file) => {
												setResumeFile(file)
												if (file) {
													form.setValue("resume_url", "")
													form.setValue("resume_id", "")
												}
											}}
											disabled={
												isUploadingResume || createJobApplication.isPending
											}
											accept={[".pdf", ".doc", ".docx", ".txt"]}
											maxSize="10MB"
										/>
									</FormControl>
									<FormMessage />
									<p className="text-xs text-muted-foreground">
										Or select a managed resume above. Uploaded files are not
										saved as managed resume versions.
									</p>
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={form.control}
						name="cover_letter_url"
						render={() => (
							<FormItem>
								<FormLabel>Cover Letter</FormLabel>
								<FormControl>
									<DocumentUpload
										ref={coverLetterUploadRef}
										label="Cover Letter"
										currentFileUrl={form.watch("cover_letter_url") ?? undefined}
										onFileChange={(file) => {
											setCoverLetterFile(file)
											if (file) {
												form.setValue("cover_letter_url", "")
											}
										}}
										disabled={
											isUploadingCoverLetter || createJobApplication.isPending
										}
										accept={[".pdf", ".doc", ".docx", ".txt"]}
										maxSize="10MB"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="submit"
					disabled={
						createJobApplication.isPending ||
						isUploadingResume ||
						isUploadingCoverLetter
					}
					className="w-full"
				>
					{createJobApplication.isPending ||
					isUploadingResume ||
					isUploadingCoverLetter
						? "Creating..."
						: "Create Job Application"}
				</Button>
			</form>
		</Form>
	)
}
