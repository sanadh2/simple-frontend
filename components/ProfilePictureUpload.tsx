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
import Image from "next/image"
import type { FilePondFile, FilePondInitialFile } from "filepond"
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import FilePondPluginImagePreview from "filepond-plugin-image-preview"
import { Cloud } from "lucide-react"

import { cn } from "@/lib/utils"

import "filepond/dist/filepond.min.css"
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css"

registerPlugin(
	FilePondPluginImagePreview,
	FilePondPluginFileValidateType,
	FilePondPluginFileValidateSize
)

const BYTES_PER_KB = 1024
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * BYTES_PER_MB

interface FilePondError {
	main?: string
	message?: string
	type?: string
}

interface ProfilePictureUploadProps {
	onFileChange?: (file: File | null) => void
	currentPictureUrl?: string
	className?: string
	disabled?: boolean
	error?: string
}

export interface ProfilePictureUploadRef {
	clearFile: () => void
	getFile: () => File | null
}

export const ProfilePictureUpload = forwardRef<
	ProfilePictureUploadRef,
	ProfilePictureUploadProps
>(
	(
		{ onFileChange, currentPictureUrl, className, disabled = false, error },
		ref
	) => {
		const [file, setFile] = useState<File | null>(null)
		const [filePondFiles, setFilePondFiles] = useState<
			Array<string | Blob | FilePondInitialFile>
		>([])
		const [isDragActive, setIsDragActive] = useState(false)
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

		const { getRootProps, getInputProps, isDragReject } = useDropzone({
			onDrop,
			accept: {
				"image/jpeg": [".jpg", ".jpeg"],
				"image/png": [".png"],
				"image/webp": [".webp"],
			},
			maxSize: MAX_SIZE_BYTES,
			maxFiles: 1,
			disabled,
			onDragEnter: () => setIsDragActive(true),
			onDragLeave: () => setIsDragActive(false),
			onDropAccepted: () => setIsDragActive(false),
			onDropRejected: () => setIsDragActive(false),
		})

		const acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"]

		return (
			<div className={cn("space-y-4", className)}>
				<style jsx global>{`
					.filepond--credits {
						display: none;
					}
					.filepond-profile-picture .filepond--root {
						font-family: inherit;
					}
					.filepond-profile-picture .filepond--drop-label {
						color: #6b7280;
						font-size: 0.875rem;
					}
					.filepond-profile-picture .filepond--panel-root {
						border: 2px dashed #d1d5db;
						border-radius: 0.5rem;
						background-color: #f9fafb;
					}
					.filepond-profile-picture .filepond--panel-root:hover {
						border-color: #9ca3af;
					}
					.filepond-profile-picture .filepond--item {
						background-color: #ffffff;
						border: 1px solid #e5e7eb;
						border-radius: 0.375rem;
					}
					.filepond-profile-picture .filepond--image-preview-wrapper {
						border-radius: 0.5rem;
					}
				`}</style>

				{/* Current Profile Picture Display */}
				{currentPictureUrl && !file && (
					<div className="relative inline-block">
						<div className="relative w-32 h-32  overflow-hidden border-4 border-gray-200 dark:border-gray-700">
							<Image
								src={currentPictureUrl}
								alt="Profile picture"
								fill
								sizes="128px"
								className="object-cover"
								unoptimized={
									currentPictureUrl.includes("localhost") ||
									currentPictureUrl.includes("127.0.0.1")
								}
							/>
						</div>
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
						maxFileSize="5MB"
						acceptedFileTypes={acceptedFileTypes}
						allowImagePreview
						allowFileTypeValidation
						allowFileSizeValidation
						allowRevert={false}
						allowRemove
						allowReplace
						allowReorder={false}
						allowProcess={false}
						instantUpload={false}
						labelIdle='Drag & drop your picture or <span class="filepond--label-action">Browse</span>'
						labelFileTypeNotAllowed="File type not allowed. Please upload JPEG, PNG, or WebP."
						labelMaxFileSizeExceeded="File size exceeds 5MB"
						labelMaxFileSize="Maximum file size is 5MB"
						labelFileProcessing="Uploading..."
						labelFileProcessingComplete="Upload complete"
						labelFileProcessingAborted="Upload cancelled"
						labelFileRemoveError="Error during remove"
						labelFileLoading="Loading..."
						labelFileLoadError="Error during load"
						server={null}
						disabled={disabled}
						className="filepond-profile-picture"
					/>
				</div>

				{/* Dropzone Overlay */}
				<div
					{...getRootProps()}
					className={cn(
						"border-2 border-dashed  p-6 text-center transition-colors cursor-pointer",
						isDragActive && !isDragReject && "border-blue-400 bg-blue-50",
						isDragReject && "border-red-400 bg-red-50",
						!isDragActive &&
							!isDragReject &&
							"border-gray-300 hover:border-gray-400",
						disabled && "opacity-50 cursor-not-allowed",
						"hidden"
					)}
				>
					<input {...getInputProps()} />
					<div className="flex flex-col items-center gap-2">
						<Cloud className="h-8 w-8 text-gray-400" />
						<div className="text-sm text-gray-600">
							<span className="font-medium">
								Drag & drop your picture or click to browse
							</span>
						</div>
						<div className="text-xs text-gray-500">
							JPEG, PNG, or WebP up to 5MB
						</div>
					</div>
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

ProfilePictureUpload.displayName = "ProfilePictureUpload"
