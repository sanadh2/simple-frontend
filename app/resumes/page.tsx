"use client"
import { useRef, useState } from "react"
import { format } from "date-fns"
import { Download, Edit, FileText, Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import {
	DocumentUpload,
	type DocumentUploadRef,
} from "@/components/DocumentUpload"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	useCreateResume,
	useDeleteResume,
	useResumeApplications,
	useResumes,
	useUpdateResume,
} from "@/hooks/useResumes"
import { apiClient } from "@/lib/api"

const BYTES_PER_KB = 1024

export default function ResumesPage() {
	const { data: resumes, isLoading } = useResumes()
	const createResume = useCreateResume()
	const updateResume = useUpdateResume()
	const deleteResume = useDeleteResume()

	const [showUploadDialog, setShowUploadDialog] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showApplicationsDialog, setShowApplicationsDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [resumeToDelete, setResumeToDelete] = useState<string | null>(null)
	const [selectedResume, setSelectedResume] = useState<string | null>(null)
	const [description, setDescription] = useState("")
	const [editDescription, setEditDescription] = useState("")
	const [hasFile, setHasFile] = useState(false)
	const resumeUploadRef = useRef<DocumentUploadRef>(null)

	const handleUpload = async () => {
		const file = resumeUploadRef.current?.getFile()
		if (!file) {
			toast.error("Please select a file")
			return
		}

		await createResume.mutateAsync(
			{
				file,
				data: {
					description: description || undefined,
					file_name: file.name,
					file_size: file.size,
				},
			},
			{
				onSuccess: () => {
					setShowUploadDialog(false)
					resumeUploadRef.current?.clearFile()
					setDescription("")
					setHasFile(false)
				},
			}
		)
	}

	const handleEdit = async () => {
		if (!selectedResume) {
			return
		}

		await updateResume.mutateAsync(
			{
				id: selectedResume,
				data: {
					description: editDescription || undefined,
				},
			},
			{
				onSuccess: () => {
					setShowEditDialog(false)
					setSelectedResume(null)
					setEditDescription("")
				},
			}
		)
	}

	const handleDeleteClick = (id: string) => {
		setResumeToDelete(id)
		setShowDeleteDialog(true)
	}

	const handleDeleteConfirm = async () => {
		if (!resumeToDelete) {
			return
		}
		await deleteResume.mutateAsync(resumeToDelete)
		setResumeToDelete(null)
	}

	const handleDownload = async (id: string) => {
		try {
			const response = await apiClient.getResumeDownloadUrl(id)
			if (response.success && response.data) {
				window.open(response.data.url, "_blank")
			}
		} catch (error) {
			toast.error("Failed to download resume", {
				description: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	const openEditDialog = (resume: { _id: string; description?: string }) => {
		setSelectedResume(resume._id)
		setEditDescription(resume.description ?? "")
		setShowEditDialog(true)
	}

	const openApplicationsDialog = (id: string) => {
		setSelectedResume(id)
		setShowApplicationsDialog(true)
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Resume Management</h1>
					<p className="text-muted-foreground mt-2">
						Upload and manage multiple resume versions
					</p>
				</div>
				<Button onClick={() => setShowUploadDialog(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Upload Resume
				</Button>
			</div>

			{isLoading && <div className="text-center py-12">Loading resumes...</div>}
			{!isLoading && (!resumes || resumes.length === 0) && (
				<Card>
					<CardContent className="py-12 text-center">
						<FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
						<p className="text-muted-foreground mb-4">
							Upload your first resume to get started
						</p>
						<Button onClick={() => setShowUploadDialog(true)}>
							<Upload className="mr-2 h-4 w-4" />
							Upload Resume
						</Button>
					</CardContent>
				</Card>
			)}
			{!isLoading && resumes && resumes.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{resumes.map((resume) => (
						<Card key={resume._id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-lg">
											Resume v{resume.version}
										</CardTitle>
										<CardDescription className="mt-1">
											{resume.description ?? "No description"}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="text-sm text-muted-foreground space-y-1">
									{resume.file_name && (
										<div>
											<span className="font-medium">File:</span>{" "}
											{resume.file_name}
										</div>
									)}
									{resume.file_size && (
										<div>
											<span className="font-medium">Size:</span>{" "}
											{(resume.file_size / BYTES_PER_KB).toFixed(2)} KB
										</div>
									)}
									<div>
										<span className="font-medium">Created:</span>{" "}
										{format(new Date(resume.createdAt), "MMM d, yyyy")}
									</div>
									{resume.application_count !== undefined && (
										<div>
											<span className="font-medium">Used in:</span>{" "}
											{resume.application_count} application
											{resume.application_count !== 1 ? "s" : ""}
										</div>
									)}
								</div>

								<div className="flex gap-2 flex-wrap">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDownload(resume._id)}
									>
										<Download className="h-4 w-4 mr-1" />
										Download
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => openEditDialog(resume)}
									>
										<Edit className="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => openApplicationsDialog(resume._id)}
									>
										<FileText className="h-4 w-4 mr-1" />
										Applications
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDeleteClick(resume._id)}
										disabled={deleteResume.isPending}
									>
										<Trash2 className="h-4 w-4 mr-1" />
										Delete
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Upload Dialog */}
			<Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Upload Resume</DialogTitle>
						<DialogDescription>
							Upload a new resume version. Versions are automatically numbered.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="resume-upload">Resume File</Label>
							<DocumentUpload
								ref={resumeUploadRef}
								label="Resume"
								onFileChange={(file) => {
									setHasFile(!!file)
								}}
								disabled={createResume.isPending}
								accept={[".pdf", ".doc", ".docx", ".txt"]}
								maxSize="10MB"
							/>
						</div>
						<div>
							<Label htmlFor="description">Description (Optional)</Label>
							<Input
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="e.g., Updated with new projects, Tailored for tech roles"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowUploadDialog(false)
									resumeUploadRef.current?.clearFile()
									setDescription("")
									setHasFile(false)
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleUpload}
								disabled={!hasFile || createResume.isPending}
							>
								{createResume.isPending ? "Uploading..." : "Upload"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Resume</DialogTitle>
						<DialogDescription>
							Update the description for this resume version.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="edit-description">Description</Label>
							<Input
								id="edit-description"
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
								placeholder="e.g., Updated with new projects"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowEditDialog(false)
									setSelectedResume(null)
									setEditDescription("")
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleEdit} disabled={updateResume.isPending}>
								{updateResume.isPending ? "Saving..." : "Save"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={handleDeleteConfirm}
				title="Delete Resume"
				description="Are you sure you want to delete this resume? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={deleteResume.isPending}
			/>

			{/* Applications Dialog */}
			{selectedResume && (
				<ApplicationsDialog
					resumeId={selectedResume}
					open={showApplicationsDialog}
					onOpenChange={setShowApplicationsDialog}
				/>
			)}
		</div>
	)
}

function ApplicationsDialog({
	resumeId,
	open,
	onOpenChange,
}: {
	resumeId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const { data: applications, isLoading } = useResumeApplications(resumeId)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Applications Using This Resume</DialogTitle>
					<DialogDescription>
						View all job applications that use this resume version.
					</DialogDescription>
				</DialogHeader>
				<div className="max-h-[60vh] overflow-y-auto">
					{isLoading && (
						<div className="text-center py-8">Loading applications...</div>
					)}
					{!isLoading && (!applications || applications.length === 0) && (
						<div className="text-center py-8 text-muted-foreground">
							This resume hasn&apos;t been used in any applications yet.
						</div>
					)}
					{!isLoading && applications && applications.length > 0 && (
						<div className="space-y-2">
							{applications.map((app) => (
								<Card key={app._id}>
									<CardContent className="pt-4">
										<div className="font-semibold">{app.company_name}</div>
										<div className="text-sm text-muted-foreground">
											{app.job_title}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
