import { useState, useRef, useCallback } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface StaffMember {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

interface ShiftData {
  isOnShift: boolean;
  startTime: string;
  endTime: string;
}

interface RosterData {
  [staffId: string]: {
    [dayIndex: number]: ShiftData;
  };
}

const staffMembers: StaffMember[] = [
  { id: "1", name: "Mika", color: "hsl(var(--primary))", bgColor: "hsl(var(--primary) / 0.3)" },
  { id: "2", name: "Yuki", color: "hsl(var(--accent))", bgColor: "hsl(var(--accent) / 0.3)" },
  { id: "3", name: "Luna", color: "#db2777", bgColor: "rgba(219, 39, 119, 0.3)" },
  { id: "4", name: "Hana", color: "#9333ea", bgColor: "rgba(147, 51, 234, 0.3)" },
  { id: "5", name: "Sakura", color: "#2563eb", bgColor: "rgba(37, 99, 235, 0.3)" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIMELINE_START = 10; // 10:00
const TIMELINE_END = 20; // 20:00
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;

const defaultShift: ShiftData = {
  isOnShift: false,
  startTime: "10:00",
  endTime: "19:00",
};

const getInitials = (name: string) => {
  return name.slice(0, 2).toUpperCase();
};

// Parse time string to decimal hours
const parseTimeToDecimal = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

// Convert decimal hours to time string
const decimalToTimeString = (decimal: number): string => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

// Initialize roster with varied data
const initializeRoster = (): RosterData => {
  const roster: RosterData = {};
  const shiftPatterns = [
    { startTime: "10:00", endTime: "18:00" },
    { startTime: "11:00", endTime: "19:00" },
    { startTime: "12:00", endTime: "20:00" },
    { startTime: "10:00", endTime: "15:00" },
    { startTime: "14:00", endTime: "20:00" },
  ];

  staffMembers.forEach((staff, staffIndex) => {
    roster[staff.id] = {};
    for (let i = 0; i < 7; i++) {
      const pattern = shiftPatterns[(staffIndex + i) % shiftPatterns.length];
      roster[staff.id][i] = {
        isOnShift: i < 5 || (staffIndex % 2 === 0 && i === 5),
        startTime: pattern.startTime,
        endTime: pattern.endTime,
      };
    }
  });
  return roster;
};

interface StaffRosterProps {
  className?: string;
}

const StaffRoster = ({ className }: StaffRosterProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [roster, setRoster] = useState<RosterData>(initializeRoster);
  const [editingCell, setEditingCell] = useState<{
    staffId: string;
    dayIndex: number;
  } | null>(null);
  const [editForm, setEditForm] = useState<ShiftData>(defaultShift);
  const [selectedDay, setSelectedDay] = useState(0);
  const [dragging, setDragging] = useState<{
    staffId: string;
    edge: "start" | "end";
  } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const openEditDrawer = (staffId: string, dayIndex: number) => {
    const currentShift = roster[staffId]?.[dayIndex] || defaultShift;
    setEditingCell({ staffId, dayIndex });
    setEditForm(currentShift);
  };

  const saveShiftEdit = () => {
    if (!editingCell) return;
    const { staffId, dayIndex } = editingCell;
    setRoster((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [dayIndex]: editForm,
      },
    }));
    setEditingCell(null);
  };

  const getStaffName = (staffId: string) => {
    return staffMembers.find((s) => s.id === staffId)?.name || "";
  };

  // Calculate bar position and width as percentages
  const getShiftBarStyle = (shift: ShiftData) => {
    if (!shift.isOnShift) return null;

    const startDecimal = parseTimeToDecimal(shift.startTime);
    const endDecimal = parseTimeToDecimal(shift.endTime);

    const clampedStart = Math.max(startDecimal, TIMELINE_START);
    const clampedEnd = Math.min(endDecimal, TIMELINE_END);

    if (clampedStart >= clampedEnd) return null;

    const leftPercent = ((clampedStart - TIMELINE_START) / TIMELINE_HOURS) * 100;
    const widthPercent = ((clampedEnd - clampedStart) / TIMELINE_HOURS) * 100;

    return { leftPercent, widthPercent };
  };

  // Handle drag on timeline
  const handleDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, staffId: string, edge: "start" | "end") => {
      e.preventDefault();
      e.stopPropagation();
      setDragging({ staffId, edge });
    },
    []
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragging || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const relativeX = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
      
      // Convert percent to time
      let newTime = TIMELINE_START + (percent / 100) * TIMELINE_HOURS;
      // Snap to 15-minute intervals
      newTime = Math.round(newTime * 4) / 4;
      newTime = Math.max(TIMELINE_START, Math.min(TIMELINE_END, newTime));

      const shiftData = roster[dragging.staffId]?.[selectedDay] || defaultShift;
      const startTime = parseTimeToDecimal(shiftData.startTime);
      const endTime = parseTimeToDecimal(shiftData.endTime);

      // Ensure minimum 30 min shift
      if (dragging.edge === "start") {
        newTime = Math.min(newTime, endTime - 0.5);
      } else {
        newTime = Math.max(newTime, startTime + 0.5);
      }

      setRoster((prev) => ({
        ...prev,
        [dragging.staffId]: {
          ...prev[dragging.staffId],
          [selectedDay]: {
            ...prev[dragging.staffId]?.[selectedDay],
            [dragging.edge === "start" ? "startTime" : "endTime"]:
              decimalToTimeString(newTime),
          },
        },
      }));
    },
    [dragging, selectedDay, roster]
  );

  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, []);

  // Time markers for the header
  const timeMarkers = [10, 12, 14, 16, 18, 20];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Week Navigation */}
      <div className="flex items-center justify-between px-3 py-2 bg-card rounded-xl mb-3">
        <button
          onClick={goToPreviousWeek}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-foreground text-sm">
            {format(currentWeekStart, "MMM d")} -{" "}
            {format(addDays(currentWeekStart, 6), "MMM d")}
          </p>
        </div>
        <button
          onClick={goToNextWeek}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1 mb-3">
        {weekDates.map((date, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={cn(
              "flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all",
              selectedDay === index
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            <span className="text-[8px] font-semibold opacity-80">
              {daysOfWeek[index]}
            </span>
            <span className="text-xs font-bold">{format(date, "d")}</span>
          </button>
        ))}
      </div>

      {/* Timeline Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Time Header */}
        <div className="flex items-end mb-1 pl-11">
          <div className="flex-1 flex justify-between px-1">
            {timeMarkers.map((hour) => (
              <span key={hour} className="text-[9px] text-muted-foreground font-medium">
                {hour}:00
              </span>
            ))}
          </div>
        </div>

        {/* Staff Timeline Rows */}
        <div 
          className="flex-1 overflow-y-auto space-y-2"
          ref={timelineRef}
          onMouseMove={dragging ? handleDragMove : undefined}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchMove={dragging ? handleDragMove : undefined}
          onTouchEnd={handleDragEnd}
        >
          {staffMembers.map((staff) => {
            const shiftData = roster[staff.id]?.[selectedDay] || defaultShift;
            const barStyle = getShiftBarStyle(shiftData);

            return (
              <div key={staff.id} className="flex items-center gap-2">
                {/* Staff Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                  style={{
                    backgroundColor: staff.bgColor,
                    color: staff.color,
                  }}
                  title={staff.name}
                >
                  {getInitials(staff.name)}
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative h-10 bg-muted/30 rounded-lg overflow-hidden">
                  {/* Hour Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: TIMELINE_HOURS }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-border/20 last:border-r-0"
                      />
                    ))}
                  </div>

                  {/* Shift Bar */}
                  {barStyle && (
                    <div
                      className="absolute top-1 bottom-1 rounded-md flex items-center justify-between select-none"
                      style={{
                        left: `${barStyle.leftPercent}%`,
                        width: `${barStyle.widthPercent}%`,
                        backgroundColor: staff.bgColor,
                        border: `2px solid ${staff.color}`,
                      }}
                      onClick={() => openEditDrawer(staff.id, selectedDay)}
                    >
                      {/* Left Drag Handle */}
                      <div
                        className="w-3 h-full flex items-center justify-center cursor-ew-resize hover:bg-black/10 rounded-l touch-none"
                        onMouseDown={(e) => handleDrag(e, staff.id, "start")}
                        onTouchStart={(e) => handleDrag(e, staff.id, "start")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: staff.color, opacity: 0.5 }} />
                      </div>

                      {/* Time Label */}
                      <span
                        className="text-[9px] font-semibold truncate flex-1 text-center"
                        style={{ color: staff.color }}
                      >
                        {shiftData.startTime}-{shiftData.endTime}
                      </span>

                      {/* Right Drag Handle */}
                      <div
                        className="w-3 h-full flex items-center justify-center cursor-ew-resize hover:bg-black/10 rounded-r touch-none"
                        onMouseDown={(e) => handleDrag(e, staff.id, "end")}
                        onTouchStart={(e) => handleDrag(e, staff.id, "end")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: staff.color, opacity: 0.5 }} />
                      </div>
                    </div>
                  )}

                  {/* No Shift - Click to Add */}
                  {!barStyle && (
                    <button
                      onClick={() => openEditDrawer(staff.id, selectedDay)}
                      className="absolute inset-1 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors border border-dashed border-border/40"
                    >
                      <span className="text-[10px] text-muted-foreground">休假</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        拖曳邊緣調整時間 • 點擊編輯詳情
      </p>

      {/* Edit Shift Drawer */}
      <Drawer open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              編輯班次 - {editingCell && getStaffName(editingCell.staffId)}
              {editingCell && ` (${daysOfWeek[editingCell.dayIndex]})`}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            {/* Toggle Shift */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <span className="font-medium">上班</span>
              <button
                onClick={() =>
                  setEditForm((prev) => ({ ...prev, isOnShift: !prev.isOnShift }))
                }
                className={cn(
                  "px-4 py-2 rounded-full font-semibold text-sm transition-colors",
                  editForm.isOnShift
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {editForm.isOnShift ? "開" : "關"}
              </button>
            </div>

            {/* Time Inputs */}
            {editForm.isOnShift && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">開始時間</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">結束時間</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
          <DrawerFooter>
            <Button onClick={saveShiftEdit} className="h-12 rounded-xl">
              儲存變更
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 rounded-xl">
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default StaffRoster;
