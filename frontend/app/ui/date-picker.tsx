'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  activeDates?: Date[];
}

export function DatePicker({ date, setDate, activeDates }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(day) => {
            if (!activeDates) return false;
            return !activeDates.some(activeDate => 
              activeDate.getFullYear() === day.getFullYear() &&
              activeDate.getMonth() === day.getMonth() &&
              activeDate.getDate() === day.getDate()
            );
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
