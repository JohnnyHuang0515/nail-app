import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCarousel from "@/components/StatsCarousel";
import TodaySchedule from "@/components/TodaySchedule";
import { adminService, DashboardStats } from "@/services/admin.service";
import { toast } from "sonner";

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("無法載入儀表板數據");
      }
    };
    fetchStats();
  }, []);

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background relative z-0">
        <DashboardHeader managerName="Mika" notificationCount={3} />
        <StatsCarousel stats={stats} />
        <TodaySchedule />
        <BottomNavBar /> {/* Add BottomNavBar */}
      </div>
    </MobileFrame>
  );
};

export default Index;
