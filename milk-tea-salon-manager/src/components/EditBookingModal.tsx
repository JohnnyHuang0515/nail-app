import { X, User, Clock, Scissors, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingDetails {
  id: string;
  clientName: string;
  service: string;
  startTime: string;
  endTime: string;
  staffName: string;
  staffColor: "pink" | "blue" | "lavender" | "peach";
  date: Date;
}

interface EditBookingModalProps {
  booking: BookingDetails | null;
  isNewBooking?: boolean;
  selectedTime?: string;
  onClose: () => void;
  onSave: (booking: BookingDetails) => void;
  onDelete?: (id: string) => void;
}

const staffColorStyles = {
  pink: "bg-staff-pink text-staff-pink-foreground",
  blue: "bg-staff-blue text-staff-blue-foreground",
  lavender: "bg-staff-lavender text-staff-lavender-foreground",
  peach: "bg-staff-peach text-staff-peach-foreground",
};

const EditBookingModal = ({
  booking,
  isNewBooking,
  selectedTime,
  onClose,
  onSave,
  onDelete,
}: EditBookingModalProps) => {
  if (!booking && !isNewBooking) return null;

  const displayBooking = booking || {
    id: "",
    clientName: "",
    service: "",
    startTime: selectedTime || "10:00",
    endTime: "",
    staffName: "",
    staffColor: "pink" as const,
    date: new Date(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[430px] bg-card rounded-t-[2rem] p-6 pb-10 animate-slide-up shadow-soft">
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-border rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <h3 className="text-lg font-bold text-foreground">
            {isNewBooking ? "New Booking" : "Edit Booking"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Client */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="font-semibold text-foreground">
                {displayBooking.clientName || "Select client..."}
              </p>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="font-semibold text-foreground">
                {displayBooking.service || "Select service..."}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-semibold text-foreground">
                {displayBooking.startTime} - {displayBooking.endTime || "??:??"}
              </p>
            </div>
          </div>

          {/* Staff */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                staffColorStyles[displayBooking.staffColor]
              )}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Staff</p>
              <p className="font-semibold text-foreground">
                {displayBooking.staffName || "Assign staff..."}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {!isNewBooking && onDelete && (
            <button
              onClick={() => onDelete(displayBooking.id)}
              className="flex-1 py-3 rounded-squircle bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => onSave(displayBooking)}
            className="flex-1 py-3 rounded-squircle bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors"
          >
            {isNewBooking ? "Create Booking" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
