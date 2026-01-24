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

interface SalaryRangeChartProps {
	salaryRange: {
		min: number | null
		max: number | null
		median: number | null
		sampleCount: number
		currency: string
		periodLabel: "annual" | "monthly" | "hourly" | "mixed"
		byPeriod: { annual: number; monthly: number; hourly: number }
		distribution: Array<{ range: string; count: number }>
	}
}

function formatUnit(
	currency: string,
	periodLabel: "annual" | "monthly" | "hourly" | "mixed"
): string {
	const c = currency === "unknown" ? "" : ` ${currency}`
	if (periodLabel === "mixed") {
		return `k${c} (annual eq.)`
	}
	if (periodLabel === "annual") {
		return `k${c}/year`
	}
	if (periodLabel === "monthly") {
		return `k${c}/year (from monthly)`
	}
	// periodLabel === "hourly" (only remaining)
	return `k${c}/year (from hourly)`
}

export function SalaryRangeChart({ salaryRange }: SalaryRangeChartProps) {
	const {
		min,
		max,
		median,
		sampleCount,
		currency,
		periodLabel,
		byPeriod,
		distribution,
	} = salaryRange

	if (sampleCount === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Salary Range Analysis</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						Add salary ranges to your job applications to see min, max, median,
						and distribution. Supports different currencies ($, €, £, etc.) and
						pay periods (annual, monthly, hourly); values are shown as annual
						equivalent.
					</p>
				</CardContent>
			</Card>
		)
	}

	const unit = formatUnit(currency, periodLabel)
	const stats = [
		{ label: "Min", value: min != null ? `${min}${unit}` : "—" },
		{ label: "Median", value: median != null ? `${median}${unit}` : "—" },
		{ label: "Max", value: max != null ? `${max}${unit}` : "—" },
	]

	const periodNote =
		periodLabel === "mixed"
			? " (annual, monthly, and hourly normalized to annual equivalent)"
			: periodLabel === "monthly"
				? " (monthly salaries ×12)"
				: periodLabel === "hourly"
					? " (hourly ×2080)"
					: ""
	const currencyNote =
		currency === "mixed"
			? " Mixed currencies; values are not converted."
			: currency !== "unknown"
				? ` ${currency}.`
				: ""
	const byPeriodParts: string[] = []
	if (byPeriod.annual > 0) {
		byPeriodParts.push(`${byPeriod.annual} annual`)
	}
	if (byPeriod.monthly > 0) {
		byPeriodParts.push(`${byPeriod.monthly} monthly`)
	}
	if (byPeriod.hourly > 0) {
		byPeriodParts.push(`${byPeriod.hourly} hourly`)
	}
	const byPeriodNote =
		byPeriodParts.length > 0 ? ` Included: ${byPeriodParts.join(", ")}.` : ""

	return (
		<Card>
			<CardHeader>
				<CardTitle>Salary Range Analysis</CardTitle>
				<p className="text-sm text-muted-foreground">
					From {sampleCount} application{sampleCount !== 1 ? "s" : ""} with
					salary data{periodNote}.{currencyNote}
					{byPeriodParts.length > 1 ? byPeriodNote : ""}
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-3 gap-4">
					{stats.map((s) => (
						<div
							key={s.label}
							className="rounded-lg border bg-muted/40 px-3 py-2 text-center"
						>
							<div className="text-xs text-muted-foreground">{s.label}</div>
							<div className="text-lg font-semibold">{s.value}</div>
						</div>
					))}
				</div>

				{distribution.length > 0 ? (
					<ResponsiveContainer width="100%" height={200}>
						<BarChart
							data={distribution}
							margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
						>
							<XAxis dataKey="range" tick={{ fontSize: 11 }} />
							<YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
							<Tooltip
								formatter={(value: number | undefined) => [
									value ?? 0,
									"Applications",
								]}
								labelFormatter={(label) => `Range: ${label}`}
							/>
							<Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				) : null}
			</CardContent>
		</Card>
	)
}
