"use client"

import { Activity, AlertTriangle, Info, XCircle } from "lucide-react"

import { useLogStatistics } from "@/hooks/useLogs"

export function LogStatistics() {
	const { data: stats, isLoading } = useLogStatistics()

	if (isLoading) {
		return <div className="animate-pulse bg-gray-100 h-32 " />
	}

	if (!stats) {
		return null
	}

	const getLevelCount = (level: string) => {
		return stats.levelBreakdown.find((item) => item.level === level)?.count || 0
	}

	const infoCount = getLevelCount("info")
	const warnCount = getLevelCount("warn")
	const errorCount = getLevelCount("error")

	const statCards = [
		{
			label: "Total Logs",
			value: stats.totalLogs.toLocaleString(),
			icon: Activity,
			color: "text-gray-600 bg-gray-100",
		},
		{
			label: "Info",
			value: infoCount.toLocaleString(),
			icon: Info,
			color: "text-blue-600 bg-blue-100",
		},
		{
			label: "Warnings",
			value: warnCount.toLocaleString(),
			icon: AlertTriangle,
			color: "text-yellow-600 bg-yellow-100",
		},
		{
			label: "Errors",
			value: errorCount.toLocaleString(),
			icon: XCircle,
			color: "text-red-600 bg-red-100",
		},
	]

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{statCards.map((stat) => {
				const Icon = stat.icon
				return (
					<div
						key={stat.label}
						className="bg-white  p-6 flex items-center gap-4"
					>
						<div className={`p-3  ${stat.color}`}>
							<Icon className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-500">{stat.label}</p>
							<p className="text-2xl font-bold">{stat.value}</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
