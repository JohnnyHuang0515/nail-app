import { DollarSign, CalendarCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/services/admin.service";

interface StatsCarouselProps {
  stats: DashboardStats | null;
}

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

const StatsCarousel = ({ stats }: StatsCarouselProps) => {
  const displayStats = [
    {
      icon: DollarSign,
      label: "今日營收",
      value: stats ? `$${stats.revenue.toLocaleString()}` : "-",
      variant: "primary" as const,
    },
    {
      icon: CalendarCheck,
      label: "今日預約",
      value: stats ? stats.bookings.toString() : "-",
      variant: "pink" as const,
    },
    {
      icon: Clock,
      label: "待確認",
      value: stats ? stats.pending.toString() : "-",
      variant: "blue" as const,
    },
  ];

  return (
    <div className="px-5 py-2">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
        {displayStats.map((stat, index) => (
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
