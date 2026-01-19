import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import prettier from "eslint-plugin-prettier"
import tanstackQuery from "@tanstack/eslint-plugin-query"

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
	{
		plugins: {
			"simple-import-sort": simpleImportSort,
			prettier: prettier,
			"@tanstack/query": tanstackQuery,
		},
		rules: {
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"prettier/prettier": "error",
			"@tanstack/query/exhaustive-deps": "warn",
			"@tanstack/query/no-rest-destructuring": "warn",
			"@tanstack/query/stable-query-client": "error",
		},
		extends: ["next/core-web-vitals", "prettier"],
	},
])

export default eslintConfig
