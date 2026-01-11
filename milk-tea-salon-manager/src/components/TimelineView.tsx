import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format, isSameDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import EditBookingModal, { BookingDetails } from "./EditBookingModal";
import { toast } from "@/hooks/use-toast";
import { scheduleService } from "@/services/schedule.service";
import { adminBookingService } from "@/services/adminBooking.service";
import { zhTW } from "date-fns/locale";

interface TimelineViewProps {
  viewMode: "day" | "week";
  currentDate: Date;
}

const hours = Array.from({ length: 11 }, (_, i) => i + 10); // 10:00 - 20:00
const ROW_HEIGHT = 60; // Row height for timeline

const staffColorStyles = {
  pink: "bg-staff-pink text-staff-pink-foreground border-staff-pink-foreground/20",
  blue: "bg-staff-blue text-staff-blue-foreground border-staff-blue-foreground/20",
  lavender: "bg-staff-lavender text-staff-lavender-foreground border-staff-lavender-foreground/20",
  peach: "bg-staff-peach text-staff-peach-foreground border-staff-peach-foreground/20",
};

const TimelineView = ({ viewMode, currentDate }: TimelineViewProps) => {
  // Calculate date range for API query
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Fetch bookings from API
  const { data: apiBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['schedule', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => scheduleService.getBookings(weekStart, weekEnd),
  });

  // Transform API data to BookingDetails format
  const bookings: BookingDetails[] = apiBookings.map((b: any) => ({
    id: b.id,
    clientName: b.clientName,
    service: b.service,
    startTime: b.startTime,
    endTime: b.endTime,
    staffName: b.staffName,
    staffColor: b.staffColor as "pink" | "blue" | "lavender" | "peach",
    date: new Date(b.date),
  }));

  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [isNewBooking, setIsNewBooking] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((b) => isSameDay(b.date, date));
  };

  const getBookingPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startOffset = (startHour - 10) * 60 + startMin;
    const duration = (endHour - 10) * 60 + endMin - startOffset;
    const minHeight = 36; // Minimum height for readability

    return {
      top: `${(startOffset / 60) * ROW_HEIGHT}px`,
      height: `${Math.max((duration / 60) * ROW_HEIGHT, minHeight)}px`,
    };
  };

  // Group overlapping bookings for side-by-side display
  const getBookingLayout = (bookings: BookingDetails[]) => {
    const sorted = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const columns: BookingDetails[][] = [];

    sorted.forEach((booking) => {
      let placed = false;
      for (const column of columns) {
        const lastInColumn = column[column.length - 1];
        if (lastInColumn.endTime <= booking.startTime) {
          column.push(booking);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([booking]);
      }
    });

    const layout = new Map<string, { column: number; totalColumns: number }>();
    columns.forEach((column, columnIndex) => {
      column.forEach((booking) => {
        layout.set(booking.id, { column: columnIndex, totalColumns: columns.length });
      });
    });

    return layout;
  };

  const handleSlotPress = useCallback((hour: number, date: Date) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedTime(`${hour}:00`);
      setIsNewBooking(true);
      toast({
        title: "新增預約",
        description: `正在建立於 ${hour}:00 的預約`,
      });
    }, 500);
  }, []);

  const handleSlotRelease = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleBookingClick = (booking: BookingDetails) => {
    setSelectedBooking(booking);
    setIsNewBooking(false);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setIsNewBooking(false);
    setSelectedTime(undefined);
  };



  const handleSave = async (booking: BookingDetails) => {
    try {
      // Construct date object from date + startTime
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      const scheduledAt = new Date(booking.date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      if (isNewBooking) {
        // New booking logic if implemented in modal (Currently modal supports new booking basic data)
        // But main CreateBookingModal is better for new.
        // For now, TimelineView supports edit existing well.
        // If new, we'd use adminBookingService.create
      } else {
        await adminBookingService.update(booking.id, {
          scheduledAt: scheduledAt.toISOString(),
          customerName: booking.clientName, // Pass updated name
        });
      }

      toast({
        title: isNewBooking ? "預約已建立" : "預約已更新",
        description: `${booking.clientName || "新預約"} 儲存成功 ✨`,
      });
      refetch();
      handleCloseModal();
    } catch (err) {
      toast({
        title: "儲存失敗",
        description: "請稍後再試",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminBookingService.updateStatus(id, 'NO_SHOW');
      toast({
        title: "已標記為未到",
        description: "此預約已釋出。",
      });
      handleCloseModal();
      refetch(); // Refresh data from API
    } catch (err) {
      toast({
        title: "操作失敗",
        description: "無法標記此預約",
        variant: "destructive"
      });
    }
  };

  // Get week days for week view (using weekStart from earlier)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (viewMode === "week") {
    return (
      <>
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex border-b border-border pl-12">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-1 py-2 text-center",
                  isSameDay(day, new Date()) && "bg-primary/10 rounded-t-lg"
                )}
              >
                <p className="text-xs text-muted-foreground">{format(day, "EEE", { locale: zhTW })}</p>
                <p
                  className={cn(
                    "text-sm font-bold",
                    isSameDay(day, new Date()) ? "text-accent" : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="relative" style={{ height: `${hours.length * ROW_HEIGHT}px` }}>
              {/* Hour rows */}
              {hours.map((hour) => (
                <div key={hour} className="absolute left-0 right-0 flex" style={{ top: `${(hour - 10) * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}>
                  <div className="w-10 flex-shrink-0 pr-1 text-right">
                    <span className="text-[10px] text-muted-foreground font-medium">{hour}:00</span>
                  </div>
                  <div className="flex-1 flex border-t border-border/50">
                    {weekDays.map((day) => (
                      <div
                        key={day.toISOString()}
                        className="flex-1 border-l border-border/30"
                        onMouseDown={() => handleSlotPress(hour, day)}
                        onMouseUp={handleSlotRelease}
                        onMouseLeave={handleSlotRelease}
                        onTouchStart={() => handleSlotPress(hour, day)}
                        onTouchEnd={handleSlotRelease}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Booking blocks */}
              {weekDays.map((day, dayIndex) => {
                const dayBookings = getBookingsForDate(day);
                const layout = getBookingLayout(dayBookings);
                return (
                  <div
                    key={day.toISOString()}
                    className="absolute top-0 bottom-0"
                    style={{
                      left: `calc(40px + ${dayIndex * (100 / 7)}%)`,
                      width: `calc(${100 / 7}% - 2px)`,
                    }}
                  >
                    {dayBookings.map((booking) => {
                      const { top, height } = getBookingPosition(booking.startTime, booking.endTime);
                      const { column, totalColumns } = layout.get(booking.id) || { column: 0, totalColumns: 1 };
                      const width = `${100 / totalColumns}%`;
                      const left = `${(column / totalColumns) * 100}%`;
                      return (
                        <button
                          key={booking.id}
                          onClick={() => handleBookingClick(booking)}
                          className={cn(
                            "absolute rounded border-l-2 px-1 py-0.5 text-left overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]",
                            staffColorStyles[booking.staffColor]
                          )}
                          style={{ top, height, left, width }}
                        >
                          <p className="text-[8px] font-bold truncate leading-tight">{booking.clientName.split(" ")[0]}</p>
                          <p className="text-[7px] opacity-70 truncate">{booking.startTime}-{booking.endTime}</p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <EditBookingModal
          booking={selectedBooking}
          isNewBooking={isNewBooking}
          selectedTime={selectedTime}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </>
    );
  }

  // Day View
  const dayBookings = getBookingsForDate(currentDate);
  const dayLayout = getBookingLayout(dayBookings);

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4">
        <div className="relative" style={{ height: `${hours.length * ROW_HEIGHT}px` }}>
          {/* Hour rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start border-t border-border/50"
              style={{ top: `${(hour - 10) * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}
              onMouseDown={() => handleSlotPress(hour, currentDate)}
              onMouseUp={handleSlotRelease}
              onMouseLeave={handleSlotRelease}
              onTouchStart={() => handleSlotPress(hour, currentDate)}
              onTouchEnd={handleSlotRelease}
            >
              <div className="w-12 flex-shrink-0 -mt-2">
                <span className="text-[10px] text-muted-foreground font-medium bg-background px-1">
                  {hour}:00
                </span>
              </div>
            </div>
          ))}

          {/* Booking blocks container */}
          <div className="absolute left-12 right-2 top-0 bottom-0">
            {dayBookings.map((booking) => {
              const { top, height } = getBookingPosition(booking.startTime, booking.endTime);
              const { column, totalColumns } = dayLayout.get(booking.id) || { column: 0, totalColumns: 1 };
              const width = `${100 / totalColumns}%`;
              const left = `${(column / totalColumns) * 100}%`;
              return (
                <button
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className={cn(
                    "absolute rounded-lg border-l-3 px-2 py-1.5 text-left overflow-hidden shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                    staffColorStyles[booking.staffColor]
                  )}
                  style={{ top, height, left, width: `calc(${width} - 4px)` }}
                >
                  <p className="font-bold text-xs truncate">{booking.clientName}</p>
                  <p className="text-[10px] opacity-70">{booking.startTime} - {booking.endTime}</p>
                  <p className="text-[10px] opacity-80 truncate">{booking.service}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <EditBookingModal
        booking={selectedBooking}
        isNewBooking={isNewBooking}
        selectedTime={selectedTime}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
};

export default TimelineView;
