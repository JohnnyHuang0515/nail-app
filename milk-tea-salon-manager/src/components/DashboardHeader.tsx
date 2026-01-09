import { Bell } from "lucide-react";

interface DashboardHeaderProps {
  managerName: string;
  notificationCount?: number;
}

const DashboardHeader = ({ managerName, notificationCount = 0 }: DashboardHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="animate-fade-in">
        <p className="text-muted-foreground text-sm font-medium">早安 ☀️</p>
        <h1 className="text-2xl font-bold text-foreground">嗨，{managerName}！</h1>
      </div>

      <button className="relative p-3 bg-card rounded-squircle shadow-card hover:shadow-soft transition-all duration-200 hover:scale-105 active:scale-95">
        <Bell className="w-5 h-5 text-foreground" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pastel-pink text-pastel-pink-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
            {notificationCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default DashboardHeader;
