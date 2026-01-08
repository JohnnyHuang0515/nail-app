import { cn } from "@/lib/utils";

const staff = [
  { name: "Yuki", color: "pink" as const },
  { name: "Mei", color: "blue" as const },
  { name: "Saki", color: "lavender" as const },
  { name: "Kana", color: "peach" as const },
];

const colorDotStyles = {
  pink: "bg-staff-pink border-staff-pink-foreground/30",
  blue: "bg-staff-blue border-staff-blue-foreground/30",
  lavender: "bg-staff-lavender border-staff-lavender-foreground/30",
  peach: "bg-staff-peach border-staff-peach-foreground/30",
};

const StaffLegend = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto scrollbar-hide">
      {staff.map((s) => (
        <div key={s.name} className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className={cn(
              "w-3 h-3 rounded-full border",
              colorDotStyles[s.color]
            )}
          />
          <span className="text-xs font-medium text-muted-foreground">{s.name}</span>
        </div>
      ))}
    </div>
  );
};

export default StaffLegend;
