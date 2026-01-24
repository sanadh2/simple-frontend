"use client"

import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ApplicationFunnel } from "@/lib/api"

const STAGES = [
	{ key: "applied", label: "Applied", color: "#3B82F6" },
	{ key: "interview", label: "Interview", color: "#A855F7" },
	{ key: "offer", label: "Offer", color: "#22C55E" },
] as const

// eslint-disable-next-line no-magic-numbers
const BAR_RADIUS: [number, number, number, number] = [0, 4, 4, 0]

interface ApplicationFunnelChartProps {
	funnel: ApplicationFunnel
}

export function ApplicationFunnelChart({
	funnel,
}: ApplicationFunnelChartProps) {
	const data = STAGES.map((s) => ({
		stage: s.label,
		count: funnel[s.key],
		fill: s.color,
	}))

	if (data.every((d) => d.count === 0)) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Application Funnel</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						No data yet. Applications (excluding Wishlist/Withdrawn) will appear
						here.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Application Funnel</CardTitle>
				<p className="text-sm text-muted-foreground">
					Applied → Interview → Offer
				</p>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={240}>
					<BarChart
						data={data}
						layout="vertical"
						margin={{ top: 4, right: 24, left: 80, bottom: 4 }}
					>
						<XAxis type="number" allowDecimals={false} />
						<YAxis
							type="category"
							dataKey="stage"
							width={72}
							tick={{ fontSize: 12 }}
						/>
						<Tooltip
							formatter={(value: number | undefined) => [value ?? 0, "Count"]}
							labelFormatter={(label) => `Stage: ${label}`}
						/>
						<Bar dataKey="count" radius={BAR_RADIUS}>
							{data.map((entry, i) => (
								// eslint-disable-next-line react/no-array-index-key
								<Cell key={`cell-${i}`} fill={entry.fill} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
