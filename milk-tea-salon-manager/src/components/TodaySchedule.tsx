import { useState } from "react";
import AppointmentCard, { Appointment } from "./AppointmentCard";

const initialAppointments: Appointment[] = [
  {
    id: "1",
    time: "10:00",
    clientName: "Sarah Johnson",
    service: "Hair Color & Cut",
    status: "upcoming",
  },
  {
    id: "2",
    time: "11:30",
    clientName: "Emma Wilson",
    service: "Manicure & Pedicure",
    status: "checked-in",
  },
  {
    id: "3",
    time: "13:00",
    clientName: "Olivia Brown",
    service: "Facial Treatment",
    status: "upcoming",
  },
  {
    id: "4",
    time: "14:30",
    clientName: "Ava Martinez",
    service: "Hair Styling",
    status: "upcoming",
  },
  {
    id: "5",
    time: "15:30",
    clientName: "Mia Davis",
    service: "Lash Extensions",
    status: "upcoming",
  },
  {
    id: "6",
    time: "16:30",
    clientName: "Isabella Garcia",
    service: "Bridal Makeup",
    status: "upcoming",
  },
];

const TodaySchedule = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const handleAction = (id: string, action: "check-in" | "mark-paid") => {
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
        <h2 className="text-lg font-bold text-foreground">Today's Schedule</h2>
        <span className="px-3 py-1 bg-secondary rounded-full text-xs font-semibold text-secondary-foreground">
          {appointments.length} appointments
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
