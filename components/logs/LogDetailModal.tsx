"use client"

import { useState } from "react"
import { Activity, Check, Clock, Copy, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { type Log } from "@/lib/logs-api"

const COPY_FEEDBACK_DURATION_MS = 2000

interface LogDetailModalProps {
	log: Log
	onClose: () => void
	onTraceRequest: () => void
}

export function LogDetailModal({
	log,
	onClose,
	onTraceRequest,
}: LogDetailModalProps) {
	const [copiedField, setCopiedField] = useState<string | null>(null)

	const copyToClipboard = async (text: string, field: string) => {
		await navigator.clipboard.writeText(text)
		setCopiedField(field)
		setTimeout(() => setCopiedField(null), COPY_FEEDBACK_DURATION_MS)
	}

	const getLevelBadgeClasses = (level: string): string => {
		if (level === "error") {
			return "bg-red-100 text-red-700"
		}
		if (level === "warn") {
			return "bg-yellow-100 text-yellow-700"
		}
		if (level === "info") {
			return "bg-blue-100 text-blue-700"
		}
		return "bg-gray-100 text-gray-700"
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Log Details</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<div className="text-sm font-medium text-gray-500 flex items-center gap-2">
								<Clock className="w-4 h-4" />
								Timestamp
							</div>
							<p className="text-sm font-mono">
								{new Date(log.timestamp).toLocaleString()}
							</p>
						</div>

						<div className="space-y-1">
							<div className="text-sm font-medium text-gray-500">Level</div>
							<p className="text-sm">
								<span
									className={`inline-block px-2 py-1  text-xs font-semibold ${getLevelBadgeClasses(log.level)}`}
								>
									{log.level.toUpperCase()}
								</span>
							</p>
						</div>

						<div className="space-y-1">
							<div className="text-sm font-medium text-gray-500 flex items-center gap-2">
								<Activity className="w-4 h-4" />
								Correlation ID
							</div>
							<div className="flex items-center gap-2">
								<p className="text-sm font-mono flex-1 truncate">
									{log.correlation_id}
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										copyToClipboard(log.correlation_id, "correlation_id")
									}
								>
									{copiedField === "correlation_id" ? (
										<Check className="w-4 h-4 text-green-600" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						{log.user_id && (
							<div className="space-y-1">
								<div className="text-sm font-medium text-gray-500 flex items-center gap-2">
									<User className="w-4 h-4" />
									User ID
								</div>
								<div className="flex items-center gap-2">
									<p className="text-sm font-mono flex-1 truncate">
										{log.user_id}
									</p>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											if (log.user_id) {
												copyToClipboard(log.user_id, "userId").catch(() => {
													// Error handling is done silently
												})
											}
										}}
									>
										{copiedField === "userId" ? (
											<Check className="w-4 h-4 text-green-600" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</Button>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-1">
						<div className="text-sm font-medium text-gray-500">Message</div>
						<p className="text-sm bg-gray-50 p-3 ">{log.message}</p>
					</div>

					{log.meta && Object.keys(log.meta).length > 0 && (
						<div className="space-y-1">
							<div className="text-sm font-medium text-gray-500">Metadata</div>
							<pre className="text-xs bg-gray-900 text-gray-100 p-4  overflow-x-auto">
								{JSON.stringify(log.meta, null, 2)}
							</pre>
						</div>
					)}

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
						<Button onClick={onTraceRequest}>Trace Request</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
