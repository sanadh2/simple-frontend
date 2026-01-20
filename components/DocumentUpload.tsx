"use client"

import React, {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react"
import { useDropzone } from "react-dropzone"
import { FilePond, registerPlugin } from "react-filepond"
import type { FilePondFile, FilePondInitialFile } from "filepond"
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"

import "filepond/dist/filepond.min.css"

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize)

const BYTES_PER_KB = 1024
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB
const DEFAULT_MAX_SIZE_MB = 10
const DEFAULT_MAX_SIZE_BYTES = DEFAULT_MAX_SIZE_MB * BYTES_PER_MB

interface FilePondError {
	main?: string
	message?: string
	type?: string
}

interface DocumentUploadProps {
	onFileChange?: (file: File | null) => void
	currentFileUrl?: string
	className?: string
	disabled?: boolean
	error?: string
	label?: string
	accept?: string[]
	maxSize?: string
}

export interface DocumentUploadRef {
	clearFile: () => void
	getFile: () => File | null
}

export const DocumentUpload = forwardRef<
	DocumentUploadRef,
	DocumentUploadProps
>(
	(
		{
			onFileChange,
			currentFileUrl,
			className,
			disabled = false,
			error,
			label = "Document",
			accept = [".pdf", ".doc", ".docx", ".txt"],
			maxSize = "10MB",
		},
		ref
	) => {
		const [file, setFile] = useState<File | null>(null)

		const [filePondFiles, setFilePondFiles] = useState<
			Array<string | Blob | FilePondInitialFile>
		>([])
		const [filePondError, setFilePondError] = useState<string>("")
		const filePondRef = useRef<FilePond>(null)

		useImperativeHandle(ref, () => ({
			clearFile: () => {
				if (filePondRef.current) {
					filePondRef.current.removeFiles()
				}
				setFile(null)
				setFilePondFiles([])
				setFilePondError("")
				onFileChange?.(null)
			},
			getFile: () => file,
		}))

		const handleFilePondUpdate = (filePondFiles: FilePondFile[]) => {
			setFilePondFiles(
				filePondFiles as unknown as Array<string | Blob | FilePondInitialFile>
			)

			const firstItem = filePondFiles[0]
			let actualFile: File | null = null

			if (firstItem instanceof File) {
				actualFile = firstItem
			} else if (
				typeof firstItem === "object" &&
				"file" in firstItem &&
				firstItem.file instanceof File
			) {
				actualFile = firstItem.file
			}

			setFile(actualFile)
			onFileChange?.(actualFile ?? null)
			setFilePondError("")
		}

		const handleFilePondError = (error: FilePondError | string) => {
			console.error("FilePond error:", error)
			let errorMessage = "An error occurred while adding the file"

			if (typeof error === "string") {
				errorMessage = error
			} else if (typeof error === "object") {
				if (error.main) {
					errorMessage = error.main
				} else if (error.message) {
					errorMessage = error.message
				} else if (error.type) {
					errorMessage = error.type
				}
			}

			setFilePondError(errorMessage)
		}

		const onDrop = useCallback(async (acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0 && filePondRef.current) {
				await filePondRef.current.addFile(acceptedFiles[0])
			}
		}, [])

		const getMimeType = (ext: string): string => {
			if (ext === ".pdf") {
				return "application/pdf"
			}
			if (ext === ".doc") {
				return "application/msword"
			}
			if (ext === ".docx") {
				return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			}
			if (ext === ".txt") {
				return "text/plain"
			}
			return ""
		}

		useDropzone({
			onDrop,
			accept: accept.reduce<Record<string, string[]>>((acc, ext) => {
				const mimeType = getMimeType(ext)
				if (mimeType) {
					acc[mimeType] = []
				}
				return acc
			}, {}),
			maxSize: DEFAULT_MAX_SIZE_BYTES,
			disabled,
			multiple: false,
		})

		const acceptedFileTypes = accept.map(getMimeType).filter(Boolean)

		return (
			<div className={cn("space-y-2", className)}>
				{currentFileUrl && !file && (
					<div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border">
						<FileText className="h-5 w-5 text-muted-foreground" />
						<a
							href={currentFileUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-1 truncate"
						>
							View current {label.toLowerCase()}
						</a>
					</div>
				)}

				<div className="filepond-wrapper">
					<FilePond
						ref={filePondRef}
						files={filePondFiles}
						onupdatefiles={handleFilePondUpdate}
						onerror={handleFilePondError}
						allowMultiple={false}
						maxFiles={1}
						maxFileSize={maxSize}
						acceptedFileTypes={acceptedFileTypes}
						allowFileTypeValidation
						allowFileSizeValidation
						allowRevert={false}
						allowRemove
						allowReplace
						allowReorder={false}
						allowProcess={false}
						instantUpload={false}
						labelIdle={`Drag & drop your ${label.toLowerCase()} or <span class="filepond--label-action">Browse</span>`}
						labelFileTypeNotAllowed={`File type not allowed. Please upload ${accept.join(", ")}.`}
						labelMaxFileSizeExceeded={`File size exceeds ${maxSize}`}
						labelMaxFileSize={`Maximum file size is ${maxSize}`}
						labelFileProcessing="Uploading..."
						labelFileProcessingComplete="Upload complete"
						labelFileProcessingAborted="Upload cancelled"
						labelFileRemoveError="Error during remove"
						labelFileLoading="Loading..."
						labelFileLoadError="Error during load"
						server={null}
						disabled={disabled}
						className="filepond-document"
					/>
				</div>

				{(error ?? filePondError) && (
					<div className="space-y-1">
						{error && <div className="text-xs text-red-500">{error}</div>}
						{filePondError && (
							<div className="text-xs text-red-500">{filePondError}</div>
						)}
					</div>
				)}
			</div>
		)
	}
)

DocumentUpload.displayName = "DocumentUpload"
