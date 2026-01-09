import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { zhTW } from "date-fns/locale";

interface ScheduleHeaderProps {
  currentDate: Date;
  viewMode: "day" | "week";
  onDateChange: (date: Date) => void;
}

const ScheduleHeader = ({ currentDate, viewMode, onDateChange }: ScheduleHeaderProps) => {
  const handlePrev = () => {
    if (viewMode === "day") {
      onDateChange(subDays(currentDate, 1));
    } else {
      onDateChange(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      onDateChange(addDays(currentDate, 1));
    } else {
      onDateChange(addWeeks(currentDate, 1));
    }
  };

  const getDisplayDate = () => {
    if (viewMode === "day") {
      return format(currentDate, "MM月dd日 EEEE", { locale: zhTW });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "MM月dd日", { locale: zhTW })} - ${format(end, "MM月dd日", { locale: zhTW })}`;
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <button
        onClick={handlePrev}
        className="p-2 rounded-xl bg-secondary hover:bg-primary/20 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      <h2 className="text-base font-bold text-foreground">{getDisplayDate()}</h2>

      <button
        onClick={handleNext}
        className="p-2 rounded-xl bg-secondary hover:bg-primary/20 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
};

export default ScheduleHeader;
