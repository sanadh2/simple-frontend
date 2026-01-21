"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useCreateCompany, useUpdateCompany } from "@/hooks/useCompanies"
import type { Company, CompanySize, FundingStage } from "@/lib/api"

const companySchema = z.object({
	name: z.string().min(1, "Company name is required"),
	size: z
		.enum(["startup", "small", "medium", "large", "enterprise"])
		.optional()
		.or(z.literal("")),
	industry: z.string().optional(),
	funding_stage: z
		.enum([
			"bootstrapped",
			"seed",
			"series-a",
			"series-b",
			"series-c",
			"series-d",
			"ipo",
			"acquired",
			"unknown",
		])
		.optional()
		.or(z.literal("")),
	glassdoor_url: z
		.string()
		.url("Invalid URL format")
		.optional()
		.or(z.literal("")),
	culture_notes: z.string().optional(),
	pros: z.array(z.string()),
	cons: z.array(z.string()),
	interview_process_overview: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companySchema>

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

export default function CompanyForm({
	company,
	onClose,
}: {
	company?: Company
	onClose: () => void
}) {
	const createCompany = useCreateCompany()
	const updateCompany = useUpdateCompany()

	const form = useForm<CompanyFormValues>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			name: company?.name ?? "",
			size: company?.size ?? "",
			industry: company?.industry ?? "",
			funding_stage: company?.funding_stage ?? "",
			glassdoor_url: company?.glassdoor_url ?? "",
			culture_notes: company?.culture_notes ?? "",
			pros: company?.pros ?? [],
			cons: company?.cons ?? [],
			interview_process_overview: company?.interview_process_overview ?? "",
		},
	})

	const [proInput, setProInput] = useState("")
	const [conInput, setConInput] = useState("")

	const pros = useWatch({ control: form.control, name: "pros" })
	const cons = useWatch({ control: form.control, name: "cons" })

	const addPro = () => {
		if (proInput.trim()) {
			form.setValue("pros", [...pros, proInput.trim()])
			setProInput("")
		}
	}

	const removePro = (index: number) => {
		form.setValue(
			"pros",
			pros.filter((_, i) => i !== index)
		)
	}

	const addCon = () => {
		if (conInput.trim()) {
			form.setValue("cons", [...cons, conInput.trim()])
			setConInput("")
		}
	}

	const removeCon = (index: number) => {
		form.setValue(
			"cons",
			cons.filter((_, i) => i !== index)
		)
	}

	const getButtonText = () => {
		if (createCompany.isPending || updateCompany.isPending) {
			return "Saving..."
		}
		if (company) {
			return "Update Company"
		}
		return "Create Company"
	}

	const onSubmit = async (data: CompanyFormValues) => {
		const payload = {
			...data,
			size: data.size ?? undefined,
			funding_stage: data.funding_stage ?? undefined,
			glassdoor_url: data.glassdoor_url ?? undefined,
			industry: data.industry ?? undefined,
			culture_notes: data.culture_notes ?? undefined,
			interview_process_overview: data.interview_process_overview ?? undefined,
		}

		if (company) {
			await updateCompany.mutateAsync(
				{ id: company._id, data: payload },
				{
					onSuccess: () => {
						form.reset()
						onClose()
					},
				}
			)
		} else {
			await createCompany.mutateAsync(payload, {
				onSuccess: () => {
					form.reset()
					setProInput("")
					setConInput("")
					onClose()
				},
			})
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Company Name *</FormLabel>
								<FormControl>
									<Input placeholder="e.g., Google" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="industry"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Industry</FormLabel>
								<FormControl>
									<Input placeholder="e.g., Technology" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="size"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Company Size</FormLabel>
								<Select
									onValueChange={(value) =>
										field.onChange(
											value === "__not_specified__" ? undefined : value
										)
									}
									value={field.value ?? "__not_specified__"}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select size" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="__not_specified__">
											Not specified
										</SelectItem>
										{SIZE_OPTIONS.map((option) => (
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
						name="funding_stage"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Funding Stage</FormLabel>
								<Select
									onValueChange={(value) =>
										field.onChange(
											value === "__not_specified__" ? undefined : value
										)
									}
									value={field.value ?? "__not_specified__"}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select funding stage" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="__not_specified__">
											Not specified
										</SelectItem>
										{FUNDING_OPTIONS.map((option) => (
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
						name="glassdoor_url"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Glassdoor URL</FormLabel>
								<FormControl>
									<Input
										type="url"
										placeholder="https://www.glassdoor.com/..."
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="culture_notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Culture Notes</FormLabel>
							<FormControl>
								<textarea
									{...field}
									rows={4}
									className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
									placeholder="Add notes about company culture, values, work environment..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="interview_process_overview"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Interview Process Overview</FormLabel>
							<FormControl>
								<textarea
									{...field}
									rows={4}
									className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
									placeholder="Describe the interview process, stages, timeline..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<Label>Pros</Label>
						<div className="space-y-2">
							<div className="flex gap-2">
								<Input
									value={proInput}
									onChange={(e) => setProInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault()
											addPro()
										}
									}}
									placeholder="Add a pro..."
								/>
								<Button type="button" onClick={addPro} size="icon">
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="space-y-2">
								{pros.map((pro) => (
									<div
										key={pro}
										className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-md"
									>
										<span className="text-sm">{pro}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => {
												const index = pros.indexOf(pro)
												removePro(index)
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<Label>Cons</Label>
						<div className="space-y-2">
							<div className="flex gap-2">
								<Input
									value={conInput}
									onChange={(e) => setConInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault()
											addCon()
										}
									}}
									placeholder="Add a con..."
								/>
								<Button type="button" onClick={addCon} size="icon">
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="space-y-2">
								{cons.map((con) => (
									<div
										key={con}
										className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-md"
									>
										<span className="text-sm">{con}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => {
												const index = cons.indexOf(con)
												removeCon(index)
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						type="submit"
						disabled={createCompany.isPending || updateCompany.isPending}
						className="flex-1"
					>
						{getButtonText()}
					</Button>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	)
}
