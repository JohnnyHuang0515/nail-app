import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
  value: "day" | "week";
  onChange: (value: "day" | "week") => void;
}

const ViewSwitcher = ({ value, onChange }: ViewSwitcherProps) => {
  return (
    <div className="flex bg-secondary rounded-squircle p-1">
      <button
        onClick={() => onChange("day")}
        className={cn(
          "flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
          value === "day"
            ? "bg-card text-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Day View
      </button>
      <button
        onClick={() => onChange("week")}
        className={cn(
          "flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
          value === "week"
            ? "bg-card text-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Week View
      </button>
    </div>
  );
};

export default ViewSwitcher;
