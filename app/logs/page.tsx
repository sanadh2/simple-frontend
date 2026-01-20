"use client"

import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"

import LoadingSpinner from "@/components/LoadingSpinner"
import { LogFilters } from "@/components/logs/LogFilters"
import { LogsTable } from "@/components/logs/LogsTable"
import { LogStatistics } from "@/components/logs/LogStatistics"
import { LogTrendsChart } from "@/components/logs/LogTrendsChart"
import { RequestTraceModal } from "@/components/logs/RequestTraceModal"
import { Button } from "@/components/ui/button"
import { useLogs } from "@/hooks/useLogs"

export default function LogsPage() {
	const [page, setPage] = useState(1)
	const [filters, setFilters] = useState<{
		level?: string
		message?: string
		startDate?: string
		endDate?: string
	}>({})
	const [selectedcorrelation_id, setSelectedcorrelation_id] = useState<
		string | null
	>(null)

	const { data, isLoading, refetch } = useLogs({
		page,
		limit: 50,
		...filters,
	})

	const handleFilterChange = (newFilters: typeof filters) => {
		setFilters(newFilters)
		setPage(1)
	}

	const handleRefresh = () => {
		refetch()
	}

	return (
		<div className=" bg-gray-50">
			<div className="max-w-[1600px] mx-auto px-4 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
							<FileText className="w-8 h-8" />
							Logs Dashboard
						</h1>
						<p className="text-gray-500 mt-1">
							Monitor and analyze application logs in real-time
						</p>
					</div>
				</div>

				<LogStatistics />

				<LogTrendsChart days={7} />

				<LogFilters
					onFilterChange={handleFilterChange}
					onRefresh={handleRefresh}
				/>

				{isLoading && (
					<div className="py-12">
						<LoadingSpinner text="Loading logs..." />
					</div>
				)}

				{!isLoading && data && (
					<>
						<div className="bg-white  p-4 flex justify-between items-center">
							<p className="text-sm text-gray-600">
								Showing <strong>{data.logs.length}</strong> of{" "}
								<strong>{data.totalCount.toLocaleString()}</strong> logs
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									<ChevronLeft className="w-4 h-4 mr-1" />
									Previous
								</Button>
								<span className="text-sm text-gray-600">
									Page {page} of {data.totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => p + 1)}
									disabled={page >= data.totalPages}
								>
									Next
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						</div>

						<LogsTable
							logs={data.logs}
							onCorrelationClick={setSelectedcorrelation_id}
						/>
					</>
				)}

				{!isLoading && data && data.logs.length === 0 && (
					<div className="bg-white  p-12 text-center">
						<p className="text-gray-500">No logs found matching your filters</p>
					</div>
				)}
			</div>

			{selectedcorrelation_id && (
				<RequestTraceModal
					correlation_id={selectedcorrelation_id}
					onClose={() => setSelectedcorrelation_id(null)}
				/>
			)}
		</div>
	)
}
