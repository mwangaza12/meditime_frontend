import { useMemo, useState } from "react";
import {Calendar as BigCalendar,momentLocalizer,type View,} from "react-big-calendar";
import Swal from "sweetalert2";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  appointments: any[];
  getTitle: (appointment: any) => string;
  calendarTitle?: string;
  onSelectDate?: (date: Date) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({appointments,getTitle,calendarTitle = "Appointments Calendar",onSelectDate, }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>("month");

    const events = useMemo(() => {
        return appointments.map((appointment: any) => {
        const start = new Date(appointment.appointmentDate);
        const end = new Date(appointment.appointmentDate);

        if (appointment.timeSlot) {
            const [time, period] = appointment.timeSlot.split(" ");
            let [hour, minute] = time.split(":").map(Number);
            if (period === "PM" && hour < 12) hour += 12;
            if (period === "AM" && hour === 12) hour = 0;
            start.setHours(hour, minute || 0);
            end.setHours(hour, (minute || 0) + 30);
        }

        return {
            id: appointment.appointmentId,
            title: getTitle(appointment),
            start,
            end,
            allDay: false,
            original: appointment,
        };
        });
    }, [appointments, getTitle]);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">{calendarTitle}</h2>
        <div
            style={{ height: "500px" }}
            className="overflow-hidden rounded-xl border border-blue-100 shadow-inner"
        >
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                views={["month", "week", "day"]}
                popup
                selectable // ✅ Makes day slots clickable
                date={currentDate}
                onView={setView}
                view={view}
                onNavigate={setCurrentDate}
                onSelectSlot={(slotInfo) => {
                    if (onSelectDate) {
                    onSelectDate(slotInfo.start); // ✅ Triggers callback with clicked date
                    }
                }}
                onSelectEvent={(event) => {
                    Swal.fire({
                    title: "Appointment Details",
                    text: `Appointment with ${event.title}`,
                    icon: "info",
                    confirmButtonText: "Close",
                    });
                }}
                style={{
                    height: "100%",
                    backgroundColor: "white",
                    fontFamily: "Inter, sans-serif",
                }}
            />
        </div>
        </div>
    );
};
