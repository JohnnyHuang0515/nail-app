import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCarousel from "@/components/StatsCarousel";
import TodaySchedule from "@/components/TodaySchedule";
import FloatingActionButton from "@/components/FloatingActionButton";

const Index = () => {
  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background relative">
        <DashboardHeader managerName="Mika" notificationCount={3} />
        <StatsCarousel />
        <TodaySchedule />
        <FloatingActionButton />
        <BottomNavBar />
      </div>
    </MobileFrame>
  );
};

export default Index;
