"use client"

import { Calendar, Search, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

interface LogFiltersProps {
	onFilterChange: (filters: {
		level?: string
		message?: string
		startDate?: string
		endDate?: string
	}) => void
	onRefresh: () => void
}

export function LogFilters({ onFilterChange, onRefresh }: LogFiltersProps) {
	const [level, setLevel] = useState<string>("")
	const [message, setMessage] = useState("")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")

	const handleApplyFilters = () => {
		onFilterChange({
			level: level || undefined,
			message: message || undefined,
			startDate: startDate || undefined,
			endDate: endDate || undefined,
		})
	}

	const handleClearFilters = () => {
		setLevel("")
		setMessage("")
		setStartDate("")
		setEndDate("")
		onFilterChange({})
	}

	const hasActiveFilters = level || message || startDate || endDate

	return (
		<div className="bg-white  p-6 space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Level
					</label>
					<select
						value={level}
						onChange={(e) => setLevel(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">All Levels</option>
						<option value="info">Info</option>
						<option value="warn">Warning</option>
						<option value="error">Error</option>
						<option value="debug">Debug</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Search Message
					</label>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Search..."
							className="w-full pl-10 pr-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Start Date
					</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="datetime-local"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full pl-10 pr-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						End Date
					</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="datetime-local"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="w-full pl-10 pr-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
			</div>

			<div className="flex justify-between items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={handleClearFilters}
					disabled={!hasActiveFilters}
				>
					<X className="w-4 h-4 mr-1" />
					Clear Filters
				</Button>

				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={onRefresh}>
						Refresh
					</Button>
					<Button size="sm" onClick={handleApplyFilters}>
						Apply Filters
					</Button>
				</div>
			</div>
		</div>
	)
}
