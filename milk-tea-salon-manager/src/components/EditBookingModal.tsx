import { useState, useEffect } from "react";
import { X, User, Clock, Scissors, Calendar, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [formData, setFormData] = useState<BookingDetails | null>(null);

  useEffect(() => {
    if (booking) {
      setFormData({ ...booking });
    } else if (isNewBooking) {
      // Initialize new booking defaults
      setFormData({
        id: "",
        clientName: "",
        service: "",
        startTime: selectedTime || "10:00",
        endTime: "11:00",
        staffName: "", // Ideally user selects staff
        staffColor: "pink",
        date: new Date(),
      });
    }
  }, [booking, isNewBooking, selectedTime]);

  if (!formData && !isNewBooking) return null;

  if (!formData) return null; // Should not happen

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    setFormData(prev => prev ? ({ ...prev, [type === 'start' ? 'startTime' : 'endTime']: value }) : null);
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
            {isNewBooking ? "新增預約" : "編輯預約"}
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
              <Label className="text-xs text-muted-foreground">客戶</Label>
              {isNewBooking ? (
                <Input
                  className="h-8 mt-1 bg-transparent border-none shadow-none p-0 focus-visible:ring-0 font-semibold"
                  placeholder="輸入客戶姓名"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              ) : (
                <p className="font-semibold text-foreground">{formData.clientName}</p>
              )}
            </div>
          </div>

          {/* Service */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">服務項目</Label>
              {isNewBooking ? (
                <Input
                  className="h-8 mt-1 bg-transparent border-none shadow-none p-0 focus-visible:ring-0 font-semibold"
                  placeholder="輸入服務"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                />
              ) : (
                <p className="font-semibold text-foreground">
                  {formData.service}
                </p>
              )}
            </div>
          </div>

          {/* Time (Editable) */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 flex gap-2 items-center">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">開始</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="h-8 mt-1 bg-transparent border-none shadow-none p-0 focus-visible:ring-0 font-semibold w-full"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">結束</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="h-8 mt-1 bg-transparent border-none shadow-none p-0 focus-visible:ring-0 font-semibold w-full"
                />
              </div>
            </div>
          </div>

          {/* Staff */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-squircle">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                staffColorStyles[formData.staffColor]
              )}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">設計師</Label>
              <p className="font-semibold text-foreground">
                {formData.staffName || "未指定"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {!isNewBooking && onDelete && (
            <button
              onClick={() => onDelete(formData.id)}
              className="flex-1 py-3 rounded-squircle bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              刪除
            </button>
          )}
          <button
            onClick={() => onSave(formData)}
            className="flex-1 py-3 rounded-squircle bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isNewBooking ? "建立預約" : "儲存變更"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
