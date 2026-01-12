import { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import ScheduleHeader from "@/components/ScheduleHeader";
import TimelineView from "@/components/TimelineView";
import ViewSwitcher from "@/components/ViewSwitcher";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background">
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/menu")}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground flex-1">行事曆</h1>
          </div>

          <div className="mb-2">
            <ViewSwitcher value={viewMode} onChange={setViewMode} />
          </div>

          <ScheduleHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onDateChange={setCurrentDate}
          />
        </div>

        <div className="flex-1 overflow-hidden relative">
          <TimelineView currentDate={currentDate} viewMode={viewMode} />
        </div>

        <BottomNavBar />
      </div>
    </MobileFrame>
  );
};

export default Schedule;
