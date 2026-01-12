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
    </header>
  );
};

export default DashboardHeader;
