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

interface Item {
	method: string
	total: number
	success: number
	rate: number
}

interface SuccessByMethodChartProps {
	data: Item[]
}

const COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#EAB308", "#F97316"]
const MAX_METHOD_LABEL_LENGTH = 18
const DOMAIN_MAX = 100
const BAR_CORNER_RADIUS = 4
const BAR_RADIUS: [number, number, number, number] = [
	0,
	BAR_CORNER_RADIUS,
	BAR_CORNER_RADIUS,
	0,
]

interface TooltipContentProps {
	active?: boolean
	payload?: ReadonlyArray<{ payload: Item }>
}

function SuccessByMethodTooltipContent({
	active,
	payload,
}: TooltipContentProps) {
	if (!active || !payload || payload.length === 0) {
		return null
	}
	const p = payload[0].payload
	return (
		<div className="rounded-md border bg-background px-3 py-2 text-sm shadow">
			<div className="font-medium">{p.method}</div>
			<div>Success rate: {p.rate}%</div>
			<div>
				{p.success} offers / {p.total} applications
			</div>
		</div>
	)
}

export function SuccessByMethodChart({ data }: SuccessByMethodChartProps) {
	const chartData = data.map((d) => ({
		...d,
		name:
			d.method.length > MAX_METHOD_LABEL_LENGTH
				? `${d.method.slice(0, MAX_METHOD_LABEL_LENGTH)}…`
				: d.method,
	}))

	if (chartData.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Success Rate by Application Method</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						Add application method to your job applications to see which
						channels perform best.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Success Rate by Application Method</CardTitle>
				<p className="text-sm text-muted-foreground">
					% of applications that led to an Offer or Accepted (by method)
				</p>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={280}>
					<BarChart
						data={chartData}
						layout="vertical"
						margin={{ top: 4, right: 24, left: 100, bottom: 4 }}
					>
						<XAxis
							type="number"
							domain={[0, DOMAIN_MAX]}
							tickFormatter={(v) => `${v}%`}
						/>
						<YAxis
							type="category"
							dataKey="name"
							width={96}
							tick={{ fontSize: 11 }}
						/>
						<Tooltip content={SuccessByMethodTooltipContent} />
						<Bar dataKey="rate" radius={BAR_RADIUS}>
							{chartData.map((entry, i) => (
								<Cell
									key={`cell-${entry.method}`}
									fill={COLORS[i % COLORS.length]}
									opacity={0.9}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
