import { useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, nextDay, startOfToday, isToday, type Day } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import {Calendar, Users, MessageSquare,Activity, TrendingUp} from 'lucide-react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { appointmentApi } from '../../feature/api/appointmentApi';
import Swal from 'sweetalert2';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeType, subtitle, icon: Icon, bgColor, iconColor,
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`w-4 h-4 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}
            />
            <span className={`text-sm ml-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change}% from last month
            </span>
          </div>
        )}
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export const DoctorDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user.userId;
  const { data: appointments = [] } = appointmentApi.useGetAppointmentsByDoctorIdQuery({ doctorId: userId });

  // Define a type for calendar events that includes the 'appointment' property
  type CalendarEvent = {
    title: string;
    start: Date;
    end: Date;
    appointment: any;
  };
  
  // Transform appointments into calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const validDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
    type Weekday = typeof validDays[number];
    const weekdays: Record<Weekday, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
  
    return appointments
      .map((apt: any) => {
        const matchingAvailability = apt.doctor?.availability?.find(
          (a: any) => a.availabilityId === apt.availabilityId
        );
        if (!matchingAvailability) {
          console.warn("Missing availability for appointment", apt);
          return null;
        }
  
        const dayOfWeek = matchingAvailability.dayOfWeek?.toLowerCase() as string;
        const startTime = matchingAvailability.startTime;
        if (!validDays.includes(dayOfWeek as Weekday)) {
          console.warn("Invalid dayOfWeek:", dayOfWeek);
          return null;
        }
  
        const weekdayKey = dayOfWeek as Weekday;
        const dayIndex = weekdays[weekdayKey];
        const today = startOfToday();
        const appointmentDate = nextDay(today, dayIndex as Day);
  
        // Create start DateTime using appointment date and time slot
        const [hours, minutes] = startTime.split(':').map(Number);
        const year = appointmentDate.getFullYear();
        const month = appointmentDate.getMonth();
        const day = appointmentDate.getDate();
        const start = new Date(year, month, day, hours, minutes);
        const duration = (apt.duration ?? 30) * 60000; // default to 30 minutes
  
        return {
          title: `${apt.user?.firstName ?? "Unknown"} – ${apt.appointmentStatus ?? "Consultation"}`,
          start,
          end: new Date(start.getTime() + duration),
          appointment: apt, // include original appointment data
        };
      })
      .filter(Boolean) as CalendarEvent[];
  }, [appointments]);

  // Filter appointments for today
  const todaysAppointments = useMemo(() => {
    return calendarEvents.filter((event: any) => event && event.start && isToday(event.start))
      .map((event: any) => event.appointment);
  }, [calendarEvents]);


  // Data for patient visits trend chart
  const patientVisitsData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((apt: any) => {
      if (apt.date) {
        const d = new Date(apt.date);
        if (!isNaN(d.getTime())) {
          const m = format(d, 'MMM');
          counts[m] = (counts[m] || 0) + 1;
        }
      }
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({ month, visits: counts[month] || 0 }));
  }, [appointments]);

  // Data for appointment status pie chart
  const appointmentStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((apt: any) => {
      const status = apt.appointmentStatus || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    const colorMap: Record<string, string> = {
      completed: '#06139e',
      Scheduled: '#3B82F6',
      cancelled: '#EF4444',
      confirmed: '#069e2f',
      pending: '#F59E0B',
      Unknown: '#9CA3AF',
    };
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || '#6B7280',
    }));
  }, [appointments]);

  // Get recent patients (unique users)
  const recentPatients = useMemo(() => {
    const seen = new Set<number>();
    return appointments
      .filter((a: any) => a.user && a.date && !isNaN(new Date(a.date).getTime()))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((a: any) => {
        const id = a.user.userId;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .slice(0, 5)
      .map((a: any) => ({
        id: a.user.userId,
        name: `${a.user.firstName} ${a.user.lastName}`,
        lastVisit: format(new Date(a.date), 'PPP'),
        condition: a.notes || 'N/A',
        priority: a.priority || 'Normal',
      }));
  }, [appointments]);

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={todaysAppointments.length.toString()}
          subtitle={`${todaysAppointments.filter((a: any) => a.appointmentStatus === 'Confirmed').length} confirmed, ${todaysAppointments.filter((a: any) => a.appointmentStatus === 'Pending').length} pending`}
          icon={Calendar}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Patients"
          value={recentPatients.length.toString()}
          icon={Users}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="This Month"
          value={patientVisitsData.find(m => m.month === format(new Date(), 'MMM'))?.visits.toString() || '0'}
          subtitle="Patient visits"
          changeType="increase"
          icon={Activity}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Unread Messages"
          value={appointments.filter((a: any) => a.appointmentStatus === 'Pending').length.toString()}
          icon={MessageSquare}
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Only */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-[500px]">
            <h3 className="font-semibold mb-2">Appointments Calendar</h3>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              popup
              selectable
              onSelectEvent={(event) => {
                const apt = event.appointment;
                Swal.fire({
                  title: `<strong>Appointment with ${apt.user?.firstName} ${apt.user?.lastName}</strong>`,
                  html: `
                    <p><strong>Status:</strong> ${apt.appointmentStatus}</p>
                    <p><strong>Date:</strong> ${format(new Date(apt.date), 'PPP')}</p>
                    <p><strong>Time:</strong> ${apt.timeSlot}</p>
                    <p><strong>Notes:</strong> ${apt.notes || 'N/A'}</p>
                  `,
                  icon: 'info',
                  confirmButtonText: 'Close'
                });
              }}
              onSelectSlot={(slotInfo) => {
                const selectedDate = format(new Date(slotInfo.start), 'PPP');
                const appointmentsForDay = calendarEvents.filter((e: any) =>
                  format(e.start, 'yyyy-MM-dd') === format(slotInfo.start, 'yyyy-MM-dd')
                );
                if (appointmentsForDay.length === 0) {
                  Swal.fire({
                    title: `No Appointments`,
                    text: `There are no appointments on ${selectedDate}.`,
                    icon: 'info',
                  });
                } else {
                  const htmlContent = appointmentsForDay
                    .map((e: any) => {
                      const apt = e.appointment;
                      return `
                        <p>
                          <strong>${apt.user?.firstName} ${apt.user?.lastName}</strong> (${apt.appointmentStatus})<br/>
                          Time: ${apt.timeSlot}<br/>
                          Notes: ${apt.notes || 'N/A'}
                        </p>
                        <hr/>
                      `;
                    })
                    .join('');
                  Swal.fire({
                    title: `Appointments on ${selectedDate}`,
                    html: htmlContent,
                    width: '600px',
                    confirmButtonText: 'Close'
                  });
                }
              }}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2">Patient Visits Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={patientVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="visits" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2">Appointment Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {appointmentStatusData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Patients */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold mb-4">Recent Patients</h2>
            <div className="space-y-3">
              {recentPatients.map((p: any) => (
                <div key={p.id} className="flex justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                      {p.name.split(' ').map((w: any) => w[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.condition}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500">{p.lastVisit}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${p.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};
