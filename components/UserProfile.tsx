"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
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
	Upload,
	UserCircle,
	X,
} from "lucide-react"

import LogoutModal from "@/components/LogoutModal"
import type { ProfilePictureUploadRef } from "@/components/ProfilePictureUpload"
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	useLogout,
	useLogoutAll,
	useUpdateProfile,
	useUploadProfilePicture,
} from "@/hooks/useAuth"
import { type User } from "@/lib/api"

const TIMEZONE_FALLBACK = [
	"Africa/Cairo",
	"Africa/Johannesburg",
	"Africa/Lagos",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/New_York",
	"America/Phoenix",
	"America/Sao_Paulo",
	"America/Toronto",
	"Asia/Dubai",
	"Asia/Hong_Kong",
	"Asia/Kolkata",
	"Asia/Seoul",
	"Asia/Shanghai",
	"Asia/Singapore",
	"Asia/Tokyo",
	"Australia/Melbourne",
	"Australia/Sydney",
	"Europe/Amsterdam",
	"Europe/Berlin",
	"Europe/London",
	"Europe/Paris",
	"Europe/Stockholm",
	"Pacific/Auckland",
	"UTC",
] as const

function getTimezones(): string[] {
	if (
		typeof Intl !== "undefined" &&
		"supportedValuesOf" in Intl &&
		typeof (Intl as { supportedValuesOf?: (key: string) => string[] })
			.supportedValuesOf === "function"
	) {
		return (Intl as { supportedValuesOf: (key: string) => string[] })
			.supportedValuesOf("timeZone")
			.slice()
			.sort()
	}
	return [...TIMEZONE_FALLBACK].sort()
}

interface UserProfileProps {
	user: User
}

interface ProfilePictureSectionProps {
	profilePictureUrl: string | null
	user: User
	onUploadClick: () => void
	isUploading: boolean
}

function ProfilePictureSection({
	profilePictureUrl,
	user,
	onUploadClick,
	isUploading,
}: ProfilePictureSectionProps) {
	return (
		<div className="relative group">
			{profilePictureUrl ? (
				<div className="relative w-20 h-20  overflow-hidden border-4 border-gray-200 dark:border-gray-700">
					<Image
						src={profilePictureUrl}
						alt={`${user.first_name} ${user.last_name}`}
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
					{user.first_name.charAt(0)}
					{user.last_name.charAt(0)}
				</div>
			)}
			<button
				onClick={onUploadClick}
				disabled={isUploading}
				className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity "
				title="Upload profile picture"
			>
				<Upload className="w-5 h-5 text-white" />
			</button>
		</div>
	)
}

interface UserNameSectionProps {
	user: User
	isEditing: boolean
	formData: {
		first_name: string
		last_name: string
	}
	onFirstNameChange: (value: string) => void
	onLastNameChange: (value: string) => void
}

function UserNameSection({
	user,
	isEditing,
	formData,
	onFirstNameChange,
	onLastNameChange,
}: UserNameSectionProps) {
	if (isEditing) {
		return (
			<div className="space-y-2">
				<div className="flex gap-2">
					<Input
						type="text"
						value={formData.first_name}
						onChange={(e) => onFirstNameChange(e.target.value)}
						placeholder="First name"
						className="w-32"
					/>
					<Input
						type="text"
						value={formData.last_name}
						onChange={(e) => onLastNameChange(e.target.value)}
						placeholder="Last name"
						className="w-32"
					/>
				</div>
			</div>
		)
	}

	return (
		<>
			<h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
				{user.first_name} {user.last_name}
			</h2>
			<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
				{user.email}
			</p>
			{user.is_email_verified ? (
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
		</>
	)
}

interface ActionButtonsProps {
	isEditing: boolean
	onEdit: () => void
	onSave: () => void
	onCancelEdit: () => void
	onLogout: () => void
	isUpdatingProfile: boolean
}

function ActionButtons({
	isEditing,
	onEdit,
	onSave,
	onCancelEdit,
	onLogout,
	isUpdatingProfile,
}: ActionButtonsProps) {
	if (isEditing) {
		return (
			<>
				<Button onClick={onSave} disabled={isUpdatingProfile} className="">
					<Save className="w-4 h-4 mr-1" />
					Save
				</Button>
				<Button
					onClick={onCancelEdit}
					variant="outline"
					disabled={isUpdatingProfile}
					className=""
				>
					<X className="w-4 h-4 mr-1" />
					Cancel
				</Button>
			</>
		)
	}

	return (
		<>
			<Button onClick={onEdit} variant="outline" className="">
				<Edit className="w-4 h-4 mr-1" />
				Edit Profile
			</Button>
			<Button onClick={onLogout} variant="destructive" className="">
				<LogOut className="w-4 h-4" />
				Sign out
			</Button>
		</>
	)
}

interface AccountDetailsSectionProps {
	user: User
	isEditing: boolean
	formData: {
		currentRole: string
		yearsOfExperience: string
	}
	onCurrentRoleChange: (value: string) => void
	onYearsOfExperienceChange: (value: string) => void
}

function AccountDetailsSection({
	user,
	isEditing,
	formData,
	onCurrentRoleChange,
	onYearsOfExperienceChange,
}: AccountDetailsSectionProps) {
	const ID_DISPLAY_LENGTH = 8

	return (
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
								onChange={(e) => onCurrentRoleChange(e.target.value)}
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
								onChange={(e) => onYearsOfExperienceChange(e.target.value)}
								placeholder="e.g., 5"
								className="w-full"
							/>
						</div>
					</>
				) : (
					<>
						{user.current_role && (
							<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
								<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
									Current Role
								</span>
								<span className="text-sm text-zinc-900 dark:text-white">
									{user.current_role}
								</span>
							</div>
						)}
						{user.years_of_experience !== undefined && (
							<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 ">
								<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
									Years of Experience
								</span>
								<span className="text-sm text-zinc-900 dark:text-white">
									{user.years_of_experience}{" "}
									{user.years_of_experience === 1 ? "year" : "years"}
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
						{user.id.slice(0, ID_DISPLAY_LENGTH)}...
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
	)
}

interface TimezoneSelectProps {
	value: string
	onChange: (value: string) => void
	existingTimezone?: string | null
}

function TimezoneSelect({
	value,
	onChange,
	existingTimezone,
}: TimezoneSelectProps) {
	const options = useMemo(() => {
		const list = getTimezones()
		const existing = existingTimezone
		const merged =
			existing && !list.includes(existing) ? [existing, ...list] : list
		return merged
	}, [existingTimezone])

	const selectValue = value || "__none__"
	const handleChange = (v: string) => onChange(v === "__none__" ? "" : v)

	return (
		<Select value={selectValue} onValueChange={handleChange}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Not set (UTC)" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="__none__">Not set (UTC)</SelectItem>
				{options.map((zone) => (
					<SelectItem key={zone} value={zone}>
						{zone.replace(/_/g, " ")}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

interface ReminderSettingsSectionProps {
	user: User
	isEditing: boolean
	timezone: string
	reminderTime: string
	onTimezoneChange: (value: string) => void
	onReminderTimeChange: (value: string) => void
}

function ReminderSettingsSection({
	user,
	isEditing,
	timezone,
	reminderTime,
	onTimezoneChange,
	onReminderTimeChange,
}: ReminderSettingsSectionProps) {
	return (
		<div className="bg-white dark:bg-zinc-900 -2xl p-6 space-y-4">
			<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
				<Clock className="w-5 h-5 mr-2 text-amber-500" />
				Reminder settings
			</h3>
			<p className="text-sm text-zinc-600 dark:text-zinc-400">
				All reminders (follow-ups, interviews) use your local day. Set a
				preferred hour to receive them, or leave empty for any hour.
			</p>
			<div className="space-y-3">
				{isEditing ? (
					<>
						<div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800">
							<Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Timezone (IANA)
							</Label>
							<TimezoneSelect
								value={timezone}
								onChange={onTimezoneChange}
								existingTimezone={user.timezone?.trim()}
							/>
						</div>
						<div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800">
							<Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Reminder time (local)
							</Label>
							<Input
								type="time"
								value={reminderTime}
								onChange={(e) => onReminderTimeChange(e.target.value)}
								className="w-full"
							/>
							<p className="text-xs text-zinc-500">
								Leave empty to get reminders at any hour when they’re due.
							</p>
						</div>
					</>
				) : (
					<>
						<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Timezone
							</span>
							<span className="text-sm text-zinc-900 dark:text-white">
								{user.timezone?.trim()
									? user.timezone.replace(/_/g, " ")
									: "Not set (UTC)"}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Reminder time
							</span>
							<span className="text-sm text-zinc-900 dark:text-white">
								{user.reminder_time?.trim() ? user.reminder_time : "Any hour"}
							</span>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

function ConnectionStatusSection() {
	return (
		<div className="bg-white dark:bg-zinc-900 -2xl p-6 space-y-4">
			<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
				<CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
				Connection Status
			</h3>

			<div className="space-y-3">
				<div className="p-4 bg-green-50 dark:bg-green-900/20  border border-green-200 dark:border-green-800">
					<div className="flex items-center">
						<div className="shrink-0">
							<div className="w-3 h-3 bg-green-500  animate-pulse" />
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
	)
}

function QuickActionsSection() {
	return (
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
	)
}

interface UploadModalProps {
	isOpen: boolean
	onClose: () => void
	onCancel: () => void
	onConfirm: () => void
	uploadRef: React.RefObject<ProfilePictureUploadRef | null>
	onFileChange: (file: File | null) => void
	currentPictureUrl: string | undefined
	isUploading: boolean
	selectedFile: File | null
}

function UploadModal({
	isOpen,
	onClose,
	onCancel,
	onConfirm,
	uploadRef,
	onFileChange,
	currentPictureUrl,
	isUploading,
	selectedFile,
}: UploadModalProps) {
	if (!isOpen) {
		return null
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-zinc-900 -2xl p-6 max-w-md w-full">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
						Upload Profile Picture
					</h3>
					<button
						onClick={onClose}
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
					onFileChange={onFileChange}
					currentPictureUrl={currentPictureUrl}
					disabled={isUploading}
				/>
				<div className="mt-4 flex justify-end gap-2">
					<Button variant="outline" onClick={onCancel} disabled={isUploading}>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={!selectedFile || isUploading}>
						{isUploading ? "Uploading..." : "Upload"}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default function UserProfile({ user }: UserProfileProps) {
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [showUploadModal, setShowUploadModal] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		first_name: user.first_name,
		last_name: user.last_name,
		currentRole: user.current_role ?? "",
		yearsOfExperience: user.years_of_experience?.toString() ?? "",
		timezone: user.timezone ?? "",
		reminderTime: user.reminder_time ?? "",
	})
	const uploadRef = useRef<ProfilePictureUploadRef>(null)
	const { mutate: logout, isPending: isLoggingOut } = useLogout()
	const { mutate: logoutAll, isPending: isLoggingOutAll } = useLogoutAll()
	const { mutate: uploadProfilePicture, isPending: isUploading } =
		useUploadProfilePicture()
	const { mutate: updateProfile, isPending: isUpdatingProfile } =
		useUpdateProfile()

	const handleUploadSuccess = () => {
		setShowUploadModal(false)
		setSelectedFile(null)
		uploadRef.current?.clearFile()
	}

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

	const handleConfirmUpload = () => {
		if (selectedFile && !isUploading) {
			uploadProfilePicture(selectedFile, {
				onSuccess: handleUploadSuccess,
			})
		}
	}

	const handleCancelUpload = () => {
		setShowUploadModal(false)
		setSelectedFile(null)
		uploadRef.current?.clearFile()
	}

	const handleEdit = () => {
		setFormData({
			first_name: user.first_name,
			last_name: user.last_name,
			currentRole: user.current_role ?? "",
			yearsOfExperience: user.years_of_experience?.toString() ?? "",
			timezone: user.timezone ?? "",
			reminderTime: user.reminder_time ?? "",
		})
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setFormData({
			first_name: user.first_name,
			last_name: user.last_name,
			currentRole: user.current_role ?? "",
			yearsOfExperience: user.years_of_experience?.toString() ?? "",
			timezone: user.timezone ?? "",
			reminderTime: user.reminder_time ?? "",
		})
	}

	const handleSave = () => {
		updateProfile({
			first_name: formData.first_name,
			last_name: formData.last_name,
			currentRole: formData.currentRole || null,
			yearsOfExperience: formData.yearsOfExperience
				? parseFloat(formData.yearsOfExperience)
				: null,
			timezone: formData.timezone.trim() || null,
			reminderTime: formData.reminderTime || null,
		})
		setIsEditing(false)
	}

	const handleFirstNameChange = (value: string) => {
		setFormData({ ...formData, first_name: value })
	}

	const handleLastNameChange = (value: string) => {
		setFormData({ ...formData, last_name: value })
	}

	const handleCurrentRoleChange = (value: string) => {
		setFormData({ ...formData, currentRole: value })
	}

	const handleYearsOfExperienceChange = (value: string) => {
		setFormData({ ...formData, yearsOfExperience: value })
	}

	const handleTimezoneChange = (value: string) => {
		setFormData({ ...formData, timezone: value })
	}

	const handleReminderTimeChange = (value: string) => {
		setFormData({ ...formData, reminderTime: value })
	}

	const isLoading = isLoggingOut || isLoggingOutAll || isUpdatingProfile

	// Profile picture URL - Cloudinary URLs are already full URLs, local paths need API URL prefix
	const profilePictureUrl = user.profile_picture
		? `${user.profile_picture}`
		: null

	return (
		<div className="w-full space-y-6">
			<div className="relative overflow-hidden bg-white dark:bg-zinc-900 -2xl">
				<div className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10" />

				<div className="relative p-8">
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-4">
							<ProfilePictureSection
								profilePictureUrl={profilePictureUrl}
								user={user}
								onUploadClick={handleUploadClick}
								isUploading={isUploading}
							/>
							<div>
								<UserNameSection
									user={user}
									isEditing={isEditing}
									formData={formData}
									onFirstNameChange={handleFirstNameChange}
									onLastNameChange={handleLastNameChange}
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<ActionButtons
								isEditing={isEditing}
								onEdit={handleEdit}
								onSave={handleSave}
								onCancelEdit={handleCancelEdit}
								onLogout={() => setShowLogoutModal(true)}
								isUpdatingProfile={isUpdatingProfile}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<AccountDetailsSection
					user={user}
					isEditing={isEditing}
					formData={formData}
					onCurrentRoleChange={handleCurrentRoleChange}
					onYearsOfExperienceChange={handleYearsOfExperienceChange}
				/>
				<ReminderSettingsSection
					user={user}
					isEditing={isEditing}
					timezone={formData.timezone}
					reminderTime={formData.reminderTime}
					onTimezoneChange={handleTimezoneChange}
					onReminderTimeChange={handleReminderTimeChange}
				/>
				<ConnectionStatusSection />
			</div>

			<QuickActionsSection />

			<UploadModal
				isOpen={showUploadModal}
				onClose={() => setShowUploadModal(false)}
				onCancel={handleCancelUpload}
				onConfirm={handleConfirmUpload}
				uploadRef={uploadRef}
				onFileChange={handleFileChange}
				currentPictureUrl={profilePictureUrl ?? undefined}
				isUploading={isUploading}
				selectedFile={selectedFile}
			/>

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
