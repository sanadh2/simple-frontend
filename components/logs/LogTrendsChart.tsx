"use client"

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

import { useLogTrends } from "@/hooks/useLogs"

export function LogTrendsChart({ days = 7 }: { days?: number }) {
	const { data: trends, isLoading } = useLogTrends(days)

	if (isLoading) {
		return <div className="animate-pulse bg-gray-100 h-80 " />
	}

	if (!trends || trends.length === 0) {
		return (
			<div className="bg-white  p-6">
				<p className="text-gray-500 text-center">No trend data available</p>
			</div>
		)
	}

	const chartData = trends
		.map((trend) => {
			const data: Record<string, string | number> = {
				date: new Date(trend.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				total: trend.totalCount,
			}

			trend.levels.forEach((level) => {
				data[level.level] = level.count
			})

			return data
		})
		.reverse()

	return (
		<div className="bg-white  p-6">
			<h3 className="text-lg font-semibold mb-4">
				Log Trends (Last {days} Days)
			</h3>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="info"
						stroke="#3B82F6"
						strokeWidth={2}
						name="Info"
					/>
					<Line
						type="monotone"
						dataKey="warn"
						stroke="#F59E0B"
						strokeWidth={2}
						name="Warnings"
					/>
					<Line
						type="monotone"
						dataKey="error"
						stroke="#EF4444"
						strokeWidth={2}
						name="Errors"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
