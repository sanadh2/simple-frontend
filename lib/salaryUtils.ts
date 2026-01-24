/**
 * Compose structured salary fields into the salary_range string for the API.
 * Format: "min-max CURRENCY/period" e.g. "50000-70000 USD/year", "3000-4000 EUR/month", "15-20/hour"
 */
export function composeSalaryRange(
	min: number,
	max: number,
	currency: string,
	period: "annual" | "monthly" | "hourly"
): string {
	const a = Math.min(min, max)
	const b = Math.max(min, max)
	const suf =
		period === "annual" ? "year" : period === "monthly" ? "month" : "hour"
	const curr = currency === "Unknown" ? "" : ` ${currency}`
	return `${a}-${b}${curr}/${suf}`
}

/**
 * Parse a salary_range string into structured fields for the form.
 * Handles formats we compose and common variants. Returns null if unparsable.
 */
export type SalaryCurrency =
	| "Unknown"
	| "USD"
	| "EUR"
	| "GBP"
	| "CHF"
	| "CAD"
	| "AUD"
	| "JPY"
	| "KRW"
	| "BRL"
	| "INR"
	| "MXN"

export function parseSalaryRangeToStructured(raw: string): {
	min: number
	max: number
	currency: SalaryCurrency
	period: "annual" | "monthly" | "hourly"
} | null {
	if (!raw || typeof raw !== "string") {
		return null
	}
	const s = raw.trim()
	const lower = s.toLowerCase()

	// --- Currency
	let currency: SalaryCurrency = "Unknown"
	if (/r\$|brl|reais?/.test(lower)) {
		currency = "BRL"
	} else if (/mx\$|mxn|pesos?/.test(lower)) {
		currency = "MXN"
	} else if (/\$|usd|dollars?/.test(lower)) {
		currency = "USD"
	} else if (/€|eur|euros?/.test(lower)) {
		currency = "EUR"
	} else if (/£|gbp|pounds?/.test(lower)) {
		currency = "GBP"
	} else if (/chf|swiss/.test(lower)) {
		currency = "CHF"
	} else if (/cad|canadian/.test(lower)) {
		currency = "CAD"
	} else if (/aud|australian/.test(lower)) {
		currency = "AUD"
	} else if (/¥|jpy|yen/.test(lower)) {
		currency = "JPY"
	} else if (/₩|krw|won/.test(lower)) {
		currency = "KRW"
	} else if (/₹|inr|rupees?/.test(lower)) {
		currency = "INR"
	}

	// --- Period
	let period: "annual" | "monthly" | "hourly" = "annual"
	if (/\/(hour|hr|h\b)|hourly|per\s*hour/.test(lower)) {
		period = "hourly"
	} else if (/\/(month|mo|mth)|monthly|per\s*month/.test(lower)) {
		period = "monthly"
	} else if (/\/(year|yr)|yearly|annually|per\s*year/.test(lower)) {
		period = "annual"
	}

	// --- Numbers: strip currency/period words, then find numbers (with optional k)
	const forNum = lower
		.replace(/\s*r\s*\$\s*/g, " ")
		.replace(/\s*mx\s*\$\s*/g, " ")
		.replace(/[$€£¥₩₹,\s]/g, " ")
		.replace(
			/\b(usd|eur|gbp|chf|cad|aud|jpy|krw|brl|inr|mxn|dollars?|euros?|pounds?|yen|won|reais?|rupees?|pesos?)\b/gi,
			" "
		)
		.replace(
			/\/(year|yr|month|mo|mth|hour|hr|h)\b|hourly|monthly|yearly|annually|per\s*(year|month|hour|mo|hr)\b/gi,
			" "
		)
		.replace(/\s+/g, " ")
		.trim()

	const toNum = (v: string): number => {
		const t = v.replace(/[\s,]/g, "").toLowerCase()
		const m = t.match(/^([\d.]+)k$/)
		if (m?.[1] !== undefined) {
			return parseFloat(m[1]) * 1000
		}
		const m2 = t.match(/^([\d.]+)$/)
		if (m2?.[1] !== undefined) {
			return parseFloat(m2[1])
		}
		return NaN
	}

	const parts = forNum.split(/-|–|—|to/).map((p) => p.trim())
	const p0 = parts[0]
	const p1 = parts[1]
	let min: number
	let max: number
	if (p0 !== undefined && p1 !== undefined) {
		const a = toNum(p0)
		const b = toNum(p1)
		if (Number.isNaN(a) || Number.isNaN(b)) {
			return null
		}
		min = Math.min(a, b)
		max = Math.max(a, b)
	} else {
		const single = toNum(forNum)
		if (Number.isNaN(single)) {
			return null
		}
		min = single
		max = single
	}

	return { min, max, currency, period }
}

export const SALARY_CURRENCIES = [
	{ value: "Unknown", label: "Unknown" },
	{ value: "USD", label: "USD ($)" },
	{ value: "EUR", label: "EUR (€)" },
	{ value: "GBP", label: "GBP (£)" },
	{ value: "CHF", label: "CHF" },
	{ value: "CAD", label: "CAD" },
	{ value: "AUD", label: "AUD" },
	{ value: "JPY", label: "JPY (¥)" },
	{ value: "KRW", label: "KRW (₩)" },
	{ value: "BRL", label: "BRL (R$)" },
	{ value: "INR", label: "INR (₹)" },
	{ value: "MXN", label: "MXN" },
] as const

export const SALARY_PERIODS = [
	{ value: "annual", label: "Annual (per year)" },
	{ value: "monthly", label: "Monthly (per month)" },
	{ value: "hourly", label: "Hourly (per hour)" },
] as const
