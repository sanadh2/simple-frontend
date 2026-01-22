"use client"

import { useState } from "react"
import { type Control, useForm, useWatch } from "react-hook-form"
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

interface ProsConsListProps {
	control: Control<CompanyFormValues>
	setValue: (name: "pros" | "cons", value: string[]) => void
	name: "pros" | "cons"
	label: string
	bgColor: string
	placeholder: string
}

function ProsConsList({
	control,
	setValue,
	name,
	label,
	bgColor,
	placeholder,
}: ProsConsListProps) {
	const [input, setInput] = useState("")
	const items = useWatch({ control, name })

	const addItem = () => {
		if (input.trim()) {
			setValue(name, [...items, input.trim()])
			setInput("")
		}
	}

	const removeItem = (index: number) => {
		setValue(
			name,
			items.filter((_, i) => i !== index)
		)
	}

	return (
		<div className="space-y-4">
			<Label>{label}</Label>
			<div className="space-y-2">
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault()
								addItem()
							}
						}}
						placeholder={placeholder}
					/>
					<Button type="button" onClick={addItem} size="icon">
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<div className="space-y-2">
					{items.map((item, index) => {
						return (
							<div
								key={`${name}-${item}`}
								className={`flex items-center justify-between p-2 ${bgColor} rounded-md`}
							>
								<span className="text-sm">{item}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => removeItem(index)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

interface CompanyBasicFieldsProps {
	control: Control<CompanyFormValues>
}

function CompanyBasicFields({ control }: CompanyBasicFieldsProps) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<FormField
				control={control}
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
				control={control}
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
				control={control}
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
								<SelectItem value="__not_specified__">Not specified</SelectItem>
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
				control={control}
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
								<SelectItem value="__not_specified__">Not specified</SelectItem>
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
				control={control}
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
	)
}

interface CompanyTextFieldsProps {
	control: Control<CompanyFormValues>
}

function CompanyTextFields({ control }: CompanyTextFieldsProps) {
	return (
		<>
			<FormField
				control={control}
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
				control={control}
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
		</>
	)
}

interface CompanyFormActionsProps {
	isPending: boolean
	isUpdate: boolean
	onClose: () => void
}

function CompanyFormActions({
	isPending,
	isUpdate,
	onClose,
}: CompanyFormActionsProps) {
	const getButtonText = () => {
		if (isPending) {
			return "Saving..."
		}
		return isUpdate ? "Update Company" : "Create Company"
	}

	return (
		<div className="flex gap-2">
			<Button type="submit" disabled={isPending} className="flex-1">
				{getButtonText()}
			</Button>
			<Button type="button" variant="outline" onClick={onClose}>
				Cancel
			</Button>
		</div>
	)
}

function buildPayload(data: CompanyFormValues) {
	return {
		...data,
		size: data.size ?? undefined,
		funding_stage: data.funding_stage ?? undefined,
		glassdoor_url: data.glassdoor_url ?? undefined,
		industry: data.industry ?? undefined,
		culture_notes: data.culture_notes ?? undefined,
		interview_process_overview: data.interview_process_overview ?? undefined,
	}
}

function getDefaultValues(company?: Company): CompanyFormValues {
	if (!company) {
		return {
			name: "",
			size: "",
			industry: "",
			funding_stage: "",
			glassdoor_url: "",
			culture_notes: "",
			pros: [],
			cons: [],
			interview_process_overview: "",
		}
	}

	return {
		name: company.name,
		size: company.size,
		industry: company.industry,
		funding_stage: company.funding_stage,
		glassdoor_url: company.glassdoor_url,
		culture_notes: company.culture_notes,
		pros: company.pros,
		cons: company.cons,
		interview_process_overview: company.interview_process_overview,
	}
}

function handleFormSuccess(
	form: ReturnType<typeof useForm<CompanyFormValues>>,
	onClose: () => void
) {
	form.reset()
	onClose()
}

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
		defaultValues: getDefaultValues(company),
	})

	const handleUpdate = async (payload: ReturnType<typeof buildPayload>) => {
		if (!company) {
			return
		}
		await updateCompany.mutateAsync(
			{ id: company._id, data: payload },
			{
				onSuccess: () => handleFormSuccess(form, onClose),
			}
		)
	}

	const handleCreate = async (payload: ReturnType<typeof buildPayload>) => {
		await createCompany.mutateAsync(payload, {
			onSuccess: () => handleFormSuccess(form, onClose),
		})
	}

	const onSubmit = async (data: CompanyFormValues) => {
		const payload = buildPayload(data)
		if (company) {
			await handleUpdate(payload)
		} else {
			await handleCreate(payload)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<CompanyBasicFields control={form.control} />

				<CompanyTextFields control={form.control} />

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<ProsConsList
						control={form.control}
						setValue={form.setValue}
						name="pros"
						label="Pros"
						bgColor="bg-green-50 dark:bg-green-950/20"
						placeholder="Add a pro..."
					/>
					<ProsConsList
						control={form.control}
						setValue={form.setValue}
						name="cons"
						label="Cons"
						bgColor="bg-red-50 dark:bg-red-950/20"
						placeholder="Add a con..."
					/>
				</div>

				<CompanyFormActions
					isPending={createCompany.isPending || updateCompany.isPending}
					isUpdate={!!company}
					onClose={onClose}
				/>
			</form>
		</Form>
	)
}
