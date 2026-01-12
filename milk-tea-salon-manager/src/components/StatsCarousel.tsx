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
      <div className="grid grid-cols-3 gap-2">
        {displayStats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "p-3 rounded-xl shadow-card animate-scale-in",
              variantStyles[stat.variant]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center mb-2",
                iconBgStyles[stat.variant]
              )}
            >
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium opacity-80 mb-0.5">{stat.label}</p>
            <p className="text-lg font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCarousel;
