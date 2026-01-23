import FingerprintJS, { type GetResult } from "@fingerprintjs/fingerprintjs"

/**
 * Client-side device fingerprinting using FingerprintJS
 *
 * This utility generates a unique device fingerprint on the client side
 * using FingerprintJS, which collects much more detailed device information
 * than server-side header parsing can provide.
 *
 * The fingerprint is cached in memory and localStorage to avoid regenerating
 * it on every request.
 */

let fingerprintPromise: Promise<string> | null = null
let cachedFingerprint: string | null = null

/**
 * Get the device fingerprint hash
 * This will be cached after the first call
 *
 * @returns Promise that resolves to the fingerprint hash string
 */
export async function getDeviceFingerprint(): Promise<string> {
	// Return cached fingerprint if available
	if (cachedFingerprint) {
		return cachedFingerprint
	}

	// Return existing promise if fingerprint is being generated
	if (fingerprintPromise) {
		return fingerprintPromise
	}

	// Check localStorage for cached fingerprint
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem("device_fingerprint")
		if (stored) {
			cachedFingerprint = stored
			return stored
		}
	}

	// Generate new fingerprint
	fingerprintPromise = (async () => {
		try {
			// Initialize FingerprintJS
			const fp = await FingerprintJS.load()

			// Get the visitor ID (fingerprint hash)
			const result = await fp.get()
			const { visitorId } = result

			// Cache in memory and localStorage
			cachedFingerprint = visitorId
			if (typeof window !== "undefined") {
				localStorage.setItem("device_fingerprint", visitorId)
			}

			return visitorId
		} catch (error) {
			console.error("Error generating device fingerprint:", error)
			// Return a fallback hash if fingerprinting fails
			return "unknown"
		} finally {
			fingerprintPromise = null
		}
	})()

	return fingerprintPromise
}

/**
 * Get detailed device information from FingerprintJS
 * This includes browser, OS, device, and other technical details
 *
 * @returns Promise that resolves to the full fingerprint result
 */
export async function getDeviceInfo(): Promise<GetResult | null> {
	try {
		const fp = await FingerprintJS.load()
		const result = await fp.get()
		return result
	} catch (error) {
		console.error("Error getting device info:", error)
		return null
	}
}

/**
 * Clear the cached fingerprint
 * Useful for testing or when you need to regenerate the fingerprint
 */
export function clearFingerprintCache(): void {
	cachedFingerprint = null
	fingerprintPromise = null
	if (typeof window !== "undefined") {
		localStorage.removeItem("device_fingerprint")
	}
}
