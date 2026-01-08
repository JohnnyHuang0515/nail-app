import { DollarSign, CalendarCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  variant: "primary" | "pink" | "blue";
}

const stats: StatCard[] = [
  {
    icon: DollarSign,
    label: "Revenue Today",
    value: "$12,500",
    variant: "primary",
  },
  {
    icon: CalendarCheck,
    label: "Bookings",
    value: "8",
    variant: "pink",
  },
  {
    icon: Clock,
    label: "Pending",
    value: "2",
    variant: "blue",
  },
];

const variantStyles = {
  primary: "bg-primary text-primary-foreground",
  pink: "bg-pastel-pink text-pastel-pink-foreground",
  blue: "bg-pastel-blue text-pastel-blue-foreground",
};

const iconBgStyles = {
  primary: "bg-primary-foreground/20",
  pink: "bg-pastel-pink-foreground/15",
  blue: "bg-pastel-blue-foreground/15",
};

const StatsCarousel = () => {
  return (
    <div className="px-5 py-2">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "flex-shrink-0 w-36 p-4 rounded-squircle shadow-card animate-scale-in",
              variantStyles[stat.variant]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                iconBgStyles[stat.variant]
              )}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium opacity-80 mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCarousel;
