"use client"

import {
	BadgeCheck,
	CheckCircle2,
	Clock,
	Edit,
	FileText,
	HelpCircle,
	LogOut,
	Save,
	Settings,
	Shield,
	UserCircle,
	Upload,
	X,
} from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"

import LogoutModal from "@/components/LogoutModal"
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	useLogout,
	useLogoutAll,
	useUpdateProfile,
	useUploadProfilePicture,
} from "@/hooks/useAuth"
import { User } from "@/lib/api"
import type { ProfilePictureUploadRef } from "@/components/ProfilePictureUpload"
import { env } from "@/env"

interface UserProfileProps {
	user: User
}

export default function UserProfile({ user }: UserProfileProps) {
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [showUploadModal, setShowUploadModal] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		firstName: user.firstName,
		lastName: user.lastName,
		currentRole: user.currentRole || "",
		yearsOfExperience: user.yearsOfExperience?.toString() || "",
	})
	const uploadRef = useRef<ProfilePictureUploadRef>(null)
	const { mutate: logout, isPending: isLoggingOut } = useLogout()
	const { mutate: logoutAll, isPending: isLoggingOutAll } = useLogoutAll()
	const {
		mutate: uploadProfilePicture,
		isPending: isUploading,
	} = useUploadProfilePicture()
	const {
		mutate: updateProfile,
		isPending: isUpdatingProfile,
	} = useUpdateProfile()

	const handleLogout = () => {
		logout()
	}

	const handleLogoutAll = () => {
		logoutAll()
	}

	const handleFileChange = (file: File | null) => {
		setSelectedFile(file)
	}

	const handleUploadClick = () => {
		setShowUploadModal(true)
		setSelectedFile(null)
	}

	const justUploadedRef = useRef(false)
	
	useEffect(() => {
		if (selectedFile && !isUploading && justUploadedRef.current) {
			setShowUploadModal(false)
			setSelectedFile(null)
			uploadRef.current?.clearFile()
			justUploadedRef.current = false
		}
	}, [isUploading, selectedFile])

	const handleConfirmUpload = () => {
		if (selectedFile && !isUploading) {
			justUploadedRef.current = true
			uploadProfilePicture(selectedFile)
		}
	}

	const handleCancelUpload = () => {
		setShowUploadModal(false)
		setSelectedFile(null)
		uploadRef.current?.clearFile()
	}

	const handleEdit = () => {
		setFormData({
			firstName: user.firstName,
			lastName: user.lastName,
			currentRole: user.currentRole || "",
			yearsOfExperience: user.yearsOfExperience?.toString() || "",
		})
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setFormData({
			firstName: user.firstName,
			lastName: user.lastName,
			currentRole: user.currentRole || "",
			yearsOfExperience: user.yearsOfExperience?.toString() || "",
		})
	}

	const handleSave = () => {
		updateProfile({
			firstName: formData.firstName,
			lastName: formData.lastName,
			currentRole: formData.currentRole || null,
			yearsOfExperience: formData.yearsOfExperience
				? parseFloat(formData.yearsOfExperience)
				: null,
		})
		setIsEditing(false)
	}

	const isLoading = isLoggingOut || isLoggingOutAll || isUpdatingProfile

	// Profile picture URL - Cloudinary URLs are already full URLs, local paths need API URL prefix
	const profilePictureUrl = user.profilePicture
		? user.profilePicture.startsWith("http")
			? user.profilePicture
			: `${env.NEXT_PUBLIC_API_URL}${user.profilePicture}`
		: null

	return (
		<div className="w-full space-y-6">
			<div className="relative overflow-hidden bg-white dark:bg-zinc-900 -2xl">
				<div className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10"></div>

				<div className="relative p-8">
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-4">
							<div className="relative group">
								{profilePictureUrl ? (
									<div className="relative w-20 h-20  overflow-hidden border-4 border-gray-200 dark:border-gray-700">
										<Image
											src={profilePictureUrl}
											alt={`${user.firstName} ${user.lastName}`}
											fill
											sizes="80px"
											className="object-cover"
											unoptimized={
												profilePictureUrl.includes("localhost") ||
												profilePictureUrl.includes("127.0.0.1")
											}
										/>
									</div>
								) : (
									<div className="flex items-center justify-center w-20 h-20  bg-linear-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold">
										{user.firstName.charAt(0)}
										{user.lastName.charAt(0)}
									</div>
								)}
								<button
									onClick={handleUploadClick}
									disabled={isUploading}
									className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity "
									title="Upload profile picture"
								>
									<Upload className="w-5 h-5 text-white" />
								</button>
							</div>

							<div>
								{isEditing ? (
									<div className="space-y-2">
										<div className="flex gap-2">
											<Input
												type="text"
												value={formData.firstName}
												onChange={(e) =>
													setFormData({ ...formData, firstName: e.target.value })
												}
												placeholder="First name"
												className="w-32"
											/>
											<Input
												type="text"
												value={formData.lastName}
												onChange={(e) =>
													setFormData({ ...formData, lastName: e.target.value })
												}
												placeholder="Last name"
												className="w-32"
											/>
										</div>
									</div>
								) : (
									<>
										<h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
											{user.firstName} {user.lastName}
										</h2>
										<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
											{user.email}
										</p>
									</>
								)}
								{user.isEmailVerified ? (
									<span className="inline-flex items-center mt-2 px-2.5 py-0.5  text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
										<BadgeCheck className="w-3 h-3 mr-1" />
										Verified
									</span>
								) : (
									<span className="inline-flex items-center mt-2 px-2.5 py-0.5  text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
										<Clock className="w-3 h-3 mr-1" />
										Unverified
									</span>
								)}
							</div>
						</div>

						<div className="flex gap-2">
							{isEditing ? (
								<>
									<Button
										onClick={handleSave}
										disabled={isUpdatingProfile}
										className="hover:scale-105 transition-transform"
									>
										<Save className="w-4 h-4 mr-1" />
										Save
									</Button>
									<Button
										onClick={handleCancelEdit}
										variant="outline"
										disabled={isUpdatingProfile}
										className="hover:scale-105 transition-transform"
									>
										<X className="w-4 h-4 mr-1" />
										Cancel
									</Button>
								</>
							) : (
								<>
									<Button
										onClick={handleEdit}
										variant="outline"
										className="hover:scale-105 transition-transform"
									>
										<Edit className="w-4 h-4 mr-1" />
										Edit Profile
									</Button>
									<Button
										onClick={() => setShowLogoutModal(true)}
										variant="destructive"
										className="hover:scale-105 transition-transform"
									>
										<LogOut className="w-4 h-4" />
										Sign out
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white dark:bg-zinc-900 -2xl p-6 space-y-4">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
						<UserCircle className="w-5 h-5 mr-2 text-blue-600" />
						Account Details
					</h3>

					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Email
							</span>
							<span className="text-sm text-zinc-900 dark:text-white">
								{user.email}
							</span>
						</div>

						{isEditing ? (
							<>
								<div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800 ">
									<Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
										Current Role
									</Label>
									<Input
										type="text"
										value={formData.currentRole}
										onChange={(e) =>
											setFormData({ ...formData, currentRole: e.target.value })
										}
										placeholder="e.g., Software Engineer"
										className="w-full"
									/>
								</div>
								<div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800 ">
									<Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
										Years of Experience
									</Label>
									<Input
										type="number"
										min="0"
										step="0.5"
										value={formData.yearsOfExperience}
										onChange={(e) =>
											setFormData({
												...formData,
												yearsOfExperience: e.target.value,
											})
										}
										placeholder="e.g., 5"
										className="w-full"
									/>
								</div>
							</>
						) : (
							<>
								{user.currentRole && (
									<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
										<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
											Current Role
										</span>
										<span className="text-sm text-zinc-900 dark:text-white">
											{user.currentRole}
										</span>
									</div>
								)}
								{user.yearsOfExperience !== undefined && user.yearsOfExperience !== null && (
									<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
										<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
											Years of Experience
										</span>
										<span className="text-sm text-zinc-900 dark:text-white">
											{user.yearsOfExperience} {user.yearsOfExperience === 1 ? "year" : "years"}
										</span>
									</div>
								)}
							</>
						)}

						<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								User ID
							</span>
							<span className="text-xs font-mono text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-700 px-2 py-1 ">
								{user.id.slice(0, 8)}...
							</span>
						</div>

						{user.createdAt && (
							<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
								<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
									Member since
								</span>
								<span className="text-sm text-zinc-900 dark:text-white">
									{new Date(user.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
						)}

						{user.updatedAt && (
							<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
								<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
									Last updated
								</span>
								<span className="text-sm text-zinc-900 dark:text-white">
									{new Date(user.updatedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="bg-white dark:bg-zinc-900 -2xl p-6 space-y-4">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
						<CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
						Connection Status
					</h3>

					<div className="space-y-3">
						<div className="p-4 bg-green-50 dark:bg-green-900/20  border border-green-200 dark:border-green-800">
							<div className="flex items-center">
								<div className="shrink-0">
									<div className="w-3 h-3 bg-green-500  animate-pulse"></div>
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-green-800 dark:text-green-400">
										Connected to server
									</p>
									<p className="text-xs text-green-600 dark:text-green-500 mt-1">
										Authentication active
									</p>
								</div>
							</div>
						</div>

						<div className="p-4 bg-blue-50 dark:bg-blue-900/20  border border-blue-200 dark:border-blue-800">
							<div className="flex items-center">
								<Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								<div className="ml-3">
									<p className="text-sm font-medium text-blue-800 dark:text-blue-400">
										Secure session
									</p>
									<p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
										Protected with JWT tokens
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white dark:bg-zinc-900 -2xl p-6">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
					Quick Actions
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Button
						variant="outline"
						className="flex flex-col items-center justify-center h-auto p-4"
					>
						<UserCircle className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
						<span className="text-xs font-medium">Edit Profile</span>
					</Button>

					<Button
						variant="outline"
						className="flex flex-col items-center justify-center h-auto p-4"
					>
						<Settings className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
						<span className="text-xs font-medium">Settings</span>
					</Button>

					<Link href="/logs" className="w-full">
						<Button
							variant="outline"
							className="w-full flex flex-col items-center justify-center h-auto p-4"
						>
							<FileText className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
							<span className="text-xs font-medium">Logs</span>
						</Button>
					</Link>

					<Button
						variant="outline"
						className="flex flex-col items-center justify-center h-auto p-4"
					>
						<HelpCircle className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
						<span className="text-xs font-medium">Help</span>
					</Button>
				</div>
			</div>

			{showUploadModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-zinc-900 -2xl p-6 max-w-md w-full">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
								Upload Profile Picture
							</h3>
							<button
								onClick={() => setShowUploadModal(false)}
								className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
								aria-label="Close"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<ProfilePictureUpload
							ref={uploadRef}
							onFileChange={handleFileChange}
							currentPictureUrl={profilePictureUrl || undefined}
							disabled={isUploading}
						/>
						<div className="mt-4 flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={handleCancelUpload}
								disabled={isUploading}
							>
								Cancel
							</Button>
							<Button
								onClick={handleConfirmUpload}
								disabled={!selectedFile || isUploading}
							>
								{isUploading ? "Uploading..." : "Upload"}
							</Button>
						</div>
					</div>
				</div>
			)}

			<LogoutModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
				onLogout={handleLogout}
				onLogoutAll={handleLogoutAll}
				isLoading={isLoading}
			/>
		</div>
	)
}
