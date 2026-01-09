import { useEffect, useState } from "react";
import AppointmentCard, { Appointment } from "./AppointmentCard";
import { adminService, Booking } from "@/services/admin.service";
import { toast } from "sonner";
import { format } from "date-fns";

const mapStatus = (status: string): "upcoming" | "checked-in" | "completed" => {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "CHECKED_IN":
      return "checked-in";
    case "CONFIRMED":
    default:
      return "upcoming";
  }
};

const mapBookingToAppointment = (booking: Booking): Appointment => {
  return {
    id: booking.id,
    time: format(new Date(booking.scheduledAt), "HH:mm"),
    clientName: booking.customer?.name || "未知客戶",
    service: booking.items.map((i) => i.service.name).join(", "),
    status: mapStatus(booking.status),
  };
};

const TodaySchedule = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await adminService.getTodayBookings();
        setAppointments(data.map(mapBookingToAppointment));
      } catch (error) {
        console.error("Failed to fetch today bookings:", error);
        toast.error("無法載入今日行程");
      }
    };
    fetchBookings();
  }, []);

  const handleAction = (id: string, action: "check-in" | "mark-paid") => {
    // In a real app, we would call an API here to update status
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          if (action === "check-in" && apt.status === "upcoming") {
            return { ...apt, status: "checked-in" };
          }
          if (action === "mark-paid" && apt.status === "checked-in") {
            return { ...apt, status: "completed" };
          }
        }
        return apt;
      })
    );
  };

  return (
    <section className="flex-1 px-5 py-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">今日行程</h2>
        <span className="px-3 py-1 bg-secondary rounded-full text-xs font-semibold text-secondary-foreground">
          {appointments.length} 個預約
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide -mx-1 px-1 space-y-3 pb-4">
        {appointments.map((appointment, index) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onAction={handleAction}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default TodaySchedule;
