"use client"

import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
	Globe,
	Keyboard,
	Laptop,
	Monitor,
	Smartphone,
	Tablet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeviceHistory } from "@/hooks/useAuth"

function getDeviceIcon(deviceType: string) {
	switch (deviceType.toLowerCase()) {
		case "mobile":
			return Smartphone
		case "tablet":
			return Tablet
		case "desktop":
			return Keyboard
		case "laptop":
			return Laptop
		default:
			return Monitor
	}
}

function formatDeviceInfo(device: {
	browserName: string
	browserVersion: string
	osName: string
	osVersion: string
	deviceType: string
}) {
	const parts: string[] = []

	if (device.browserName && device.browserName !== "Unknown") {
		const browserVersion = device.browserVersion
			? ` ${device.browserVersion.split(".")[0]}`
			: ""
		parts.push(`${device.browserName}${browserVersion}`)
	}

	if (device.osName && device.osName !== "Unknown") {
		const osVersion = device.osVersion ? ` ${device.osVersion}` : ""
		parts.push(`${device.osName}${osVersion}`)
	}

	if (device.deviceType && device.deviceType !== "unknown") {
		parts.push(device.deviceType)
	}

	return parts.length > 0 ? parts.join(" • ") : "Unknown device"
}

const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const MILLISECONDS_PER_SECOND = 1000
const ONE_DAY_MS =
	HOURS_PER_DAY *
	MINUTES_PER_HOUR *
	SECONDS_PER_MINUTE *
	MILLISECONDS_PER_SECOND

const SKELETON_COUNT = 3

export default function DeviceHistory() {
	const { data: devices = [], isLoading, isError } = useDeviceHistory(true)
	const [renderTime] = useState(() => Date.now())

	if (isLoading) {
		return (
			<div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
					<Globe className="w-5 h-5 mr-2 text-indigo-500" />
					Login history
				</h3>
				<div className="space-y-3">
					{Array.from({ length: SKELETON_COUNT }, (_, i) => (
						<Skeleton key={i} className="h-20 w-full" />
					))}
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
					<Globe className="w-5 h-5 mr-2 text-indigo-500" />
					Login history
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Failed to load device history. Please try again later.
				</p>
			</div>
		)
	}

	if (devices.length === 0) {
		return (
			<div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 space-y-4">
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
					<Globe className="w-5 h-5 mr-2 text-indigo-500" />
					Login history
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					No login history available yet.
				</p>
			</div>
		)
	}

	return (
		<div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 space-y-4">
			<h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
				<Globe className="w-5 h-5 mr-2 text-indigo-500" />
				Login history
			</h3>
			<p className="text-sm text-zinc-600 dark:text-zinc-400">
				View all devices and locations where you&apos;ve logged in.
			</p>
			<div className="space-y-3">
				{devices.map((device) => {
					const DeviceIcon = getDeviceIcon(device.deviceType)
					const deviceInfo = formatDeviceInfo(device)
					const lastSeenDate = new Date(device.lastSeen)
					const isRecent = renderTime - lastSeenDate.getTime() < ONE_DAY_MS

					return (
						<Card
							key={device.id}
							className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-3">
										<div className="mt-1 p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
											<DeviceIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
										</div>
										<div className="flex-1">
											<CardTitle className="text-sm font-medium text-zinc-900 dark:text-white">
												{deviceInfo}
											</CardTitle>
											<div className="mt-1 flex items-center gap-2 flex-wrap">
												<Badge
													variant="secondary"
													className="text-xs font-normal"
												>
													{device.ip}
												</Badge>
												{isRecent && (
													<Badge
														variant="default"
														className="text-xs font-normal bg-green-500 hover:bg-green-600"
													>
														Recent
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="text-xs text-zinc-500 dark:text-zinc-400">
									Last seen{" "}
									<span className="font-medium">
										{formatDistanceToNow(lastSeenDate, {
											addSuffix: true,
										})}
									</span>
									{" • "}
									{format(lastSeenDate, "MMM d, yyyy 'at' h:mm a")}
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
