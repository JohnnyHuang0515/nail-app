import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCarousel from "@/components/StatsCarousel";
import TodaySchedule from "@/components/TodaySchedule";
import { adminService, DashboardStats } from "@/services/admin.service";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [storeName, setStoreName] = useState<string>("店長");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, settingsData] = await Promise.all([
          adminService.getDashboardStats(),
          settingsService.getSettings(),
        ]);
        setStats(statsData);
        if (settingsData.storeName) {
          setStoreName(settingsData.storeName);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("無法載入儀表板數據");
      }
    };
    fetchData();
  }, []);

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background">
        <DashboardHeader managerName={storeName} notificationCount={3} />
        <StatsCarousel stats={stats} />
        <TodaySchedule />
        <BottomNavBar /> {/* Add BottomNavBar */}
      </div>
    </MobileFrame>
  );
};

export default Index;
