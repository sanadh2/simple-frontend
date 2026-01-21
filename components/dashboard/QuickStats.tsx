"use client"

import { Calendar, MessageSquare } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickStatsProps {
	responseRate: number
	interviewRate: number
}

export function QuickStats({ responseRate, interviewRate }: QuickStatsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Response Rate</CardTitle>
					<MessageSquare className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{responseRate.toFixed(1)}%</div>
					<p className="text-xs text-muted-foreground">
						Applications that received a response
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
					<Calendar className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{interviewRate.toFixed(1)}%</div>
					<p className="text-xs text-muted-foreground">
						Applications that led to interviews
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
