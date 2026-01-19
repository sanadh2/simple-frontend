import type { NextConfig } from "next"
import "./env"
import { env } from "./env"

const apiUrl = env.NEXT_PUBLIC_API_URL
const apiUrlObj = new URL(apiUrl)

const remotePatterns: Array<{
	protocol: "http" | "https"
	hostname: string
	port?: string
	pathname: string
}> = []

if (apiUrlObj.hostname === "localhost" || apiUrlObj.port) {
	remotePatterns.push({
		protocol: apiUrlObj.protocol.replace(":", "") as "http" | "https",
		hostname: apiUrlObj.hostname,
		...(apiUrlObj.port && { port: apiUrlObj.port }),
		pathname: "/uploads/**",
	})
}

remotePatterns.push(
	{
		protocol: "https" as const,
		hostname: "res.cloudinary.com",
		pathname: "/**",
	},
	{
		protocol: "http" as const,
		hostname: "res.cloudinary.com",
		pathname: "/**",
	}
)

const nextConfig: NextConfig = {
	images: {
		remotePatterns,
	},
}

export default nextConfig
