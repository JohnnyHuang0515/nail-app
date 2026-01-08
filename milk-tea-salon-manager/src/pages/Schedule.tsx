import { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import ViewSwitcher from "@/components/ViewSwitcher";
import ScheduleHeader from "@/components/ScheduleHeader";
import TimelineView from "@/components/TimelineView";
import StaffLegend from "@/components/StaffLegend";

const Schedule = () => {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background relative">
        {/* Header */}
        <header className="px-5 pt-4 pb-2">
          <h1 className="text-xl font-bold text-foreground mb-3">Schedule</h1>
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </header>

        {/* Date Navigation */}
        <ScheduleHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onDateChange={setCurrentDate}
        />

        {/* Staff Legend */}
        <StaffLegend />

        {/* Timeline */}
        <TimelineView viewMode={viewMode} currentDate={currentDate} />

        {/* Bottom Nav */}
        <BottomNavBar />
      </div>
    </MobileFrame>
  );
};

export default Schedule;
