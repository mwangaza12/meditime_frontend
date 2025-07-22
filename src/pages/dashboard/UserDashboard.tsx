import { useMemo, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Swal from 'sweetalert2';
import { appointmentApi } from '../../feature/api/appointmentApi';
import { Calendar, Bell, Heart, Pill } from "lucide-react";
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { prescriptionApi } from '../../feature/api/prescriptionApi';
import { paymentApi } from '../../feature/api/paymentApi';
import moment from 'moment';
import { StatCard } from '../../components/cards/StatCard';
import type { CalendarEvent } from '../../types/types';

dayjs.extend(isSameOrAfter);

const localizer = momentLocalizer(moment);


const notifications = [
  { id: 1, message: "Appointment reminder: Dr. Sarah Johnson tomorrow at 10:00 AM", time: "2 hours ago", type: "appointment" },
  { id: 2, message: "Lab results are ready for review", time: "1 day ago", type: "results" },
  { id: 3, message: "Time to take your medication: Metformin", time: "3 hours ago", type: "medication" }
];

export const UserDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user.userId;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  const { data } = appointmentApi.useGetAppointmentsByUserIdQuery({ userId });
  const appointments = data?.appointments ?? [];  const { data: prescriptions = [] } = prescriptionApi.useGetPrescriptionsByUserIdQuery({ userId });
  const { data: payments = [] } = paymentApi.useGetPaymentsByUserIdQuery({ userId });

  const { upcomingAppointments } = useMemo(() => {
    const now = dayjs();
    const upcoming = appointments.filter((a: any) => dayjs(a.appointmentDate).isSameOrAfter(now, 'day'));
    const past = appointments.filter((a: any) => dayjs(a.appointmentDate).isBefore(now, 'day'));
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

  const appointmentEvents: CalendarEvent[] = useMemo(() => {
  return upcomingAppointments.map((appointment: any) => {
    const start = new Date(appointment.appointmentDate);
    const end = new Date(appointment.appointmentDate);

    if (appointment.timeSlot) {
      const [time, period] = appointment.timeSlot.split(' ');
      let [hour, minute] = time.split(':').map(Number);
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      start.setHours(hour, minute || 0);
      end.setHours(hour, (minute || 0) + 30);
    }

    return {
      id: appointment.appointmentId,
      title: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
      start,
      end,
      allDay: false,
      original: appointment, // optional: include original data for reference
    };
  });
}, [upcomingAppointments]);

// ✅ Determine the next upcoming appointment (sorted by start time)
const nextAppointment = useMemo(() => {
  const now = new Date();

  const upcoming = appointmentEvents
    .filter(event => event.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return upcoming.length > 0 ? upcoming[0].original : null;
}, [appointmentEvents]);

  const totalAmountUsed = useMemo(() => {
    return appointments.reduce((sum: number, appointment: any) => {
      const appointmentPayments = appointment.payments || [];
      const completedPayments = appointmentPayments.filter((p: any) => p.paymentStatus === 'completed');

      const paymentSum = completedPayments.reduce((acc: number, payment: any) => {
        const amount = parseFloat(payment.amount || '0');
        return acc + (isNaN(amount) ? 0 : amount);
      }, 0);

      return sum + (paymentSum * 100);
    }, 0);
  }, [appointments]);


  console.log(payments);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Next Appointment"
            value={nextAppointment ? dayjs(nextAppointment.appointmentDate).format('MMM D, YYYY') : "N/A"}
            subtitle={nextAppointment?.timeSlot || ""}
            icon={Calendar}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Amount Used"
            value={`Ksh. ${totalAmountUsed.toLocaleString()}`}
            subtitle="Excellent"
            icon={Heart}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Medications"
            value={prescriptions.length.toString()}
            subtitle="Active prescriptions"
            icon={Pill}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Notifications"
            value={notifications.length.toString()}
            subtitle="New updates"
            icon={Bell}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Appointments Calendar */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Appointments Calendar</h2>
              <div style={{ height: '400px' }}>
                <BigCalendar
                  localizer={localizer}
                  events={appointmentEvents}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={currentDate} // 👈 controlled date
                  onNavigate={(newDate) => {
                    console.log("Navigated to:", newDate);
                    setCurrentDate(newDate); // 👈 update calendar view
                  }}
                  defaultView="month"
                  views={['month', 'week', 'day']}
                  popup
                  style={{ height: '100%', backgroundColor: 'white', borderRadius: '0.5rem' }}
                  onSelectEvent={(event) => {
                    Swal.fire({
                      title: `Appointment Details`,
                      text: `Appointment with ${event.title}`,
                      icon: 'info',
                      confirmButtonText: 'Close'
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notifications & Medications */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Recent Notifications</h2>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Current Medications</h2>
              <div className="space-y-3">
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No active prescriptions.</p>
                ) : (
                  prescriptions.map((prescription: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <h3 className="font-medium text-gray-900">{prescription.medicationName}</h3>
                      <p className="text-sm text-gray-600">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                      {prescription.nextDose && (
                        <p className="text-xs text-gray-500 mt-1">
                          Next dose: {prescription.nextDose}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
