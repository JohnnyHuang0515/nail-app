import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from "date-fns";
import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";

// Mock available time slots
const generateTimeSlots = (date: Date) => {
  const slots = [
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: false },
    { time: "11:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: false },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: false },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: false },
  ];
  return slots;
};

const DateTimeSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || { totalPrice: 0, totalTime: 0, itemCount: 0 };

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const timeSlots = generateTimeSlots(selectedDate);

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const handleNext = () => {
    if (selectedTime) {
      navigate('/booking/details', {
        state: {
          ...bookingData,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
        }
      });
    }
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Select Date & Time</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Calendar Section */}
          <div className="px-5 py-4">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevWeek}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-lg font-semibold text-foreground">
                {format(currentWeekStart, 'MMMM yyyy')}
              </span>
              <button 
                onClick={handleNextWeek}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Week Days */}
            <div className="flex gap-2">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isPast = day < new Date() && !isToday;
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-milk-tea text-white shadow-md'
                        : isPast
                          ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                          : 'bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase opacity-70">
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-lg font-bold ${isToday && !isSelected ? 'text-milk-tea' : ''}`}>
                      {format(day, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-foreground mb-4">
              ⏰ Available Slots for {format(selectedDate, 'MMM d')}
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`py-3 px-4 rounded-full font-medium text-sm transition-all border ${
                      isSelected
                        ? 'bg-milk-tea text-white border-milk-tea shadow-md'
                        : slot.available
                          ? 'bg-card text-foreground border-milk-tea/50 hover:border-milk-tea hover:bg-milk-tea/10'
                          : 'bg-muted/50 text-muted-foreground/50 border-transparent cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Area */}
        <div className="flex-shrink-0">
          {/* Sticky Footer */}
          <div className="bg-card/70 backdrop-blur-xl border-t border-white/20 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">
                  {bookingData.itemCount} service{bookingData.itemCount > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground bg-milk-tea/10 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                    ${bookingData.totalPrice.toLocaleString()}
                  </span>
                  {bookingData.totalTime > 0 && (
                    <span className="text-sm text-muted-foreground font-medium">
                      • {bookingData.totalTime}m
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleNext}
                disabled={!selectedTime}
                className="py-3.5 px-6 bg-milk-tea/80 hover:bg-milk-tea backdrop-blur-xl border border-white/30 disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:backdrop-blur-none rounded-full font-bold text-white transition-all active:scale-[0.98] shadow-lg whitespace-nowrap disabled:cursor-not-allowed"
              >
                Next: Enter Details
              </button>
            </div>
          </div>
          
          <BottomNav activeTab="booking" />
        </div>
      </div>
    </MobileFrame>
  );
};

export default DateTimeSelection;
