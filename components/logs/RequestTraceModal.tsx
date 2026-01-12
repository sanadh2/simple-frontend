"use client"

import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, ArrowRight, Bug, Info, XCircle } from "lucide-react"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { useLogsByCorrelationId } from "@/hooks/useLogs"

import LoadingSpinner from "../LoadingSpinner"

interface RequestTraceModalProps {
	correlationId: string
	onClose: () => void
}

const levelIcons = {
	info: Info,
	warn: AlertTriangle,
	error: XCircle,
	debug: Bug,
}

const levelColors = {
	info: "text-blue-600",
	warn: "text-yellow-600",
	error: "text-red-600",
	debug: "text-gray-600",
}

export function RequestTraceModal({
	correlationId,
	onClose,
}: RequestTraceModalProps) {
	const { data: logs, isLoading } = useLogsByCorrelationId(correlationId)

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Request Trace</DialogTitle>
					<p className="text-sm text-gray-500 font-mono">{correlationId}</p>
				</DialogHeader>

				{isLoading && (
					<div className="py-12">
						<LoadingSpinner text="Loading trace..." />
					</div>
				)}

				{!isLoading && logs && logs.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500">No logs found for this request</p>
					</div>
				)}

				{!isLoading && logs && logs.length > 0 && (
					<div className="space-y-4">
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p className="text-sm text-blue-800">
								<strong>{logs.length}</strong> log entries found for this
								request
							</p>
						</div>

						<div className="relative">
							<div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

							<div className="space-y-4">
								{logs.map((log, index) => {
									const Icon = levelIcons[log.level]
									const color = levelColors[log.level]

									return (
										<div key={index} className="relative flex gap-4">
											<div className="relative z-10 flex-shrink-0">
												<div
													className={`p-2 rounded-full bg-white border-2 ${color.replace("text-", "border-")}`}
												>
													<Icon className={`w-4 h-4 ${color}`} />
												</div>
											</div>

											<div className="flex-1 bg-white rounded-lg shadow p-4 space-y-2">
												<div className="flex justify-between items-start">
													<div>
														<span
															className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-1 ${
																log.level === "error"
																	? "bg-red-100 text-red-700"
																	: log.level === "warn"
																		? "bg-yellow-100 text-yellow-700"
																		: log.level === "info"
																			? "bg-blue-100 text-blue-700"
																			: "bg-gray-100 text-gray-700"
															}`}
														>
															{log.level.toUpperCase()}
														</span>
														<p className="text-sm font-medium">{log.message}</p>
													</div>
													<span className="text-xs text-gray-500 whitespace-nowrap ml-4">
														{formatDistanceToNow(new Date(log.timestamp), {
															addSuffix: true,
														})}
													</span>
												</div>

												<p className="text-xs text-gray-400">
													{new Date(log.timestamp).toLocaleString()}
												</p>

												{log.meta && Object.keys(log.meta).length > 0 && (
													<details className="text-xs">
														<summary className="cursor-pointer text-blue-600 hover:text-blue-800">
															Show metadata
														</summary>
														<pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
															{JSON.stringify(log.meta, null, 2)}
														</pre>
													</details>
												)}

												{index < logs.length - 1 && (
													<div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
														<ArrowRight className="w-3 h-3" />
														<span>
															{Math.abs(
																new Date(logs[index + 1].timestamp).getTime() -
																	new Date(log.timestamp).getTime()
															)}
															ms
														</span>
													</div>
												)}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
