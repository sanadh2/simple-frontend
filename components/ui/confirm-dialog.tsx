"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void | Promise<void>
	title?: string
	description?: string
	confirmText?: string
	cancelText?: string
	variant?: "default" | "destructive"
	isLoading?: boolean
}

export function ConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
	title = "Are you sure?",
	description = "This action cannot be undone.",
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "default",
	isLoading = false,
}: ConfirmDialogProps) {
	const [isProcessing, setIsProcessing] = React.useState(false)

	const handleConfirm = async () => {
		setIsProcessing(true)
		try {
			await onConfirm()
			onOpenChange(false)
		} catch (error) {
			// Error handling is expected to be done in onConfirm
			throw error
		} finally {
			setIsProcessing(false)
		}
	}

	const handleCancel = () => {
		if (!isProcessing && !isLoading) {
			onOpenChange(false)
		}
	}

	const isDisabled = isProcessing || isLoading

	return (
		<Dialog open={open} onOpenChange={handleCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={isDisabled}
					>
						{cancelText}
					</Button>
					<Button
						variant={variant === "destructive" ? "destructive" : "default"}
						onClick={handleConfirm}
						disabled={isDisabled}
					>
						{isDisabled ? "Processing..." : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
