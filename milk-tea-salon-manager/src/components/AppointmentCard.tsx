import { cn } from "@/lib/utils";
import { User, CheckCircle, CreditCard } from "lucide-react";

export interface Appointment {
  id: string;
  time: string;
  clientName: string;
  service: string;
  status: "upcoming" | "checked-in" | "completed";
  avatar?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onAction: (id: string, action: "check-in" | "mark-paid") => void;
  index: number;
}

const statusConfig = {
  upcoming: {
    badge: "未報到",
    badgeClass: "bg-pastel-blue text-pastel-blue-foreground",
    actionLabel: "報到",
    actionIcon: CheckCircle,
    actionClass: "bg-primary text-primary-foreground hover:bg-accent",
  },
  "checked-in": {
    badge: "已報到",
    badgeClass: "bg-pastel-green text-pastel-green-foreground",
    actionLabel: "結帳",
    actionIcon: CreditCard,
    actionClass: "bg-success text-success-foreground hover:bg-success/90",
  },
  completed: {
    badge: "已完成",
    badgeClass: "bg-muted text-muted-foreground",
    actionLabel: "已結束",
    actionIcon: CheckCircle,
    actionClass: "bg-muted text-muted-foreground cursor-default",
  },
};

const AppointmentCard = ({ appointment, onAction, index }: AppointmentCardProps) => {
  const config = statusConfig[appointment.status];
  const ActionIcon = config.actionIcon;

  const handleAction = () => {
    if (appointment.status === "upcoming") {
      onAction(appointment.id, "check-in");
    } else if (appointment.status === "checked-in") {
      onAction(appointment.id, "mark-paid");
    }
  };

  return (
    <div
      className="bg-card rounded-squircle p-4 shadow-card hover:shadow-soft transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        {/* Time Badge */}
        <div className="flex-shrink-0 w-14 h-14 bg-secondary rounded-xl flex flex-col items-center justify-center">
          <span className="text-base font-bold text-foreground">{appointment.time}</span>
        </div>

        {/* Client Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-bold text-foreground truncate">{appointment.clientName}</h3>
          </div>
          <p className="text-sm text-muted-foreground truncate">{appointment.service}</p>
          <span
            className={cn(
              "inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
              config.badgeClass
            )}
          >
            {config.badge}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={appointment.status === "completed"}
          className={cn(
            "flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200",
            "active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
            config.actionClass
          )}
        >
          <ActionIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{config.actionLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
