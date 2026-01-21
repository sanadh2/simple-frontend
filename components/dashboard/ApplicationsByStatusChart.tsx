"use client"

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JobStatus } from "@/lib/api"

const PERCENTAGE_MULTIPLIER = 100

interface ApplicationsByStatusChartProps {
	statusBreakdown: Record<JobStatus, number>
}

const STATUS_COLORS: Record<JobStatus, string> = {
	Wishlist: "#9CA3AF",
	Applied: "#3B82F6",
	"Interview Scheduled": "#A855F7",
	Interviewing: "#EAB308",
	Offer: "#22C55E",
	Rejected: "#EF4444",
	Accepted: "#10B981",
	Withdrawn: "#64748B",
}

export function ApplicationsByStatusChart({
	statusBreakdown,
}: ApplicationsByStatusChartProps) {
	const data = Object.entries(statusBreakdown)
		.filter(([, count]) => count > 0)
		.map(([status, count]) => ({
			name: status,
			value: count,
		}))

	if (data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Applications by Status</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						No applications to display
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Applications by Status</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ name, percent }) =>
								`${name}: ${((percent ?? 0) * PERCENTAGE_MULTIPLIER).toFixed(0)}%`
							}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
						>
							{data.map((entry) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={STATUS_COLORS[entry.name as JobStatus]}
								/>
							))}
						</Pie>
						<Tooltip />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
