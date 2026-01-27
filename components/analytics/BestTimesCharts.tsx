"use client"

import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PERCENTAGE_DOMAIN_MAX = 100
const CHART_BAR_CORNER_PX = 4
const BAR_RADIUS_TOP = [CHART_BAR_CORNER_PX, CHART_BAR_CORNER_PX, 0, 0] as const

interface DayItem {
	day: string
	applications: number
	responseCount: number
	responseRate: number
}

interface HourItem {
	hour: number
	label: string
	applications: number
	responseCount: number
	responseRate: number
}

interface BestTimesChartsProps {
	bestDays: DayItem[]
	bestHours: HourItem[]
}

interface DayTooltipProps {
	active?: boolean
	payload?: ReadonlyArray<{ payload: DayItem }>
}

function DayTooltipContent({ active, payload }: DayTooltipProps) {
	if (!active || !payload?.length) {
		return null
	}
	const p = payload[0].payload
	return (
		<div className="rounded-md border bg-background px-3 py-2 text-sm shadow">
			<div className="font-medium">{p.day}</div>
			<div>Response rate: {p.responseRate}%</div>
			<div>
				{p.responseCount} responses / {p.applications} applications
			</div>
		</div>
	)
}

interface HourTooltipProps {
	active?: boolean
	payload?: ReadonlyArray<{ payload: HourItem }>
}

function HourTooltipContent({ active, payload }: HourTooltipProps) {
	if (!active || !payload?.length) {
		return null
	}
	const p = payload[0].payload
	return (
		<div className="rounded-md border bg-background px-3 py-2 text-sm shadow">
			<div className="font-medium">{p.label}</div>
			<div>Response rate: {p.responseRate}%</div>
			<div>
				{p.responseCount} responses / {p.applications} applications
			</div>
		</div>
	)
}

export function BestTimesCharts({ bestDays, bestHours }: BestTimesChartsProps) {
	const hasDays = bestDays.length > 0
	const hasHours = bestHours.length > 0

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Best Days to Apply</CardTitle>
					<p className="text-sm text-muted-foreground">
						Response rate by day of week (when you applied)
					</p>
				</CardHeader>
				<CardContent>
					{hasDays ? (
						<ResponsiveContainer width="100%" height={220}>
							<BarChart
								data={bestDays}
								margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
							>
								<XAxis dataKey="day" tick={{ fontSize: 10 }} interval={0} />
								<YAxis
									tickFormatter={(v) => `${v}%`}
									domain={[0, PERCENTAGE_DOMAIN_MAX]}
									tick={{ fontSize: 10 }}
								/>
								<Tooltip
									formatter={(value: number | undefined) => [
										`${value ?? 0}%`,
										"Response rate",
									]}
									content={DayTooltipContent}
								/>
								<Bar
									dataKey="responseRate"
									fill="#3B82F6"
									radius={[...BAR_RADIUS_TOP]}
								/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="text-sm text-muted-foreground text-center py-12">
							Apply to jobs to see which weekdays get the most responses.
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Best Hours to Apply</CardTitle>
					<p className="text-sm text-muted-foreground">
						Response rate by hour of day (when you applied)
					</p>
				</CardHeader>
				<CardContent>
					{hasHours ? (
						<ResponsiveContainer width="100%" height={220}>
							<BarChart
								data={bestHours}
								margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
							>
								<XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} />
								<YAxis
									tickFormatter={(v) => `${v}%`}
									domain={[0, PERCENTAGE_DOMAIN_MAX]}
									tick={{ fontSize: 10 }}
								/>
								<Tooltip
									formatter={(value: number | undefined) => [
										`${value ?? 0}%`,
										"Response rate",
									]}
									content={HourTooltipContent}
								/>
								<Bar
									dataKey="responseRate"
									fill="#A855F7"
									radius={[...BAR_RADIUS_TOP]}
								/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="text-sm text-muted-foreground text-center py-12">
							Apply to jobs to see which hours get the most responses.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
