import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, setMonth, setYear, getMonth, getYear } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BirthdayPickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

const BirthdayPicker = ({ selected, onSelect, className }: BirthdayPickerProps) => {
  const currentYear = new Date().getFullYear();
  const [displayMonth, setDisplayMonth] = useState(selected || new Date(currentYear - 25, 0, 1));

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleYearChange = (year: string) => {
    const newDate = setYear(displayMonth, parseInt(year));
    setDisplayMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(displayMonth, parseInt(month));
    setDisplayMonth(newDate);
  };

  return (
    <div className={cn("p-3", className)}>
      {/* Year and Month Selectors */}
      <div className="flex gap-2 mb-4">
        <Select
          value={getMonth(displayMonth).toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {months.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={getYear(displayMonth).toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        disabled={(date) => date > new Date()}
        showOutsideDays={true}
        className="pointer-events-auto"
        classNames={{
          months: "flex flex-col",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium hidden",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
          day_selected:
            "bg-pastel-pink text-white hover:bg-pastel-pink hover:text-white focus:bg-pastel-pink focus:text-white",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
      />
    </div>
  );
};

export default BirthdayPicker;
