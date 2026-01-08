"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "./date-range-picker"

export function DateRangePickerExample() {
  const [date, setDate] = React.useState<DateRange | undefined>()

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Date Range Picker</h3>
        <DateRangePicker
          date={date}
          onDateChange={setDate}
          placeholder="Select date range"
        />
      </div>
      
      {date && (
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">Selected Range:</p>
          <p className="text-sm text-muted-foreground">
            From: {date.from?.toLocaleDateString() || "Not selected"}
            <br />
            To: {date.to?.toLocaleDateString() || "Not selected"}
          </p>
        </div>
      )}
    </div>
  )
}
