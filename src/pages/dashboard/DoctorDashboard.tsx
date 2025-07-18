import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, nextDay, startOfToday, isToday, type Day } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import {
  Calendar, Users, MessageSquare, Phone, Video, CheckCircle, XCircle, Activity, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
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

  const [activeView, setActiveView] = useState<'today' | 'week'>('today');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  // Filter appointments for this week
  const thisWeekAppointments = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return calendarEvents.filter((event: any) => {
      if (!event || !event.start) return false;
      return event.start >= weekStart && event.start <= weekEnd;
    }).map((event: any) => event.appointment);
  }, [calendarEvents]);

  const displayedAppointments = useMemo(() => {
    return activeView === 'today' ? todaysAppointments : thisWeekAppointments;
  }, [activeView, todaysAppointments, thisWeekAppointments]);

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

  // Data for weekly schedule bar chart
  const weeklyScheduleData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const label = format(day, 'EEE');
      const dateKey = format(day, 'yyyy-MM-dd');
      const appointmentsForDay = appointments.filter((a: any) => {
        if (!a.date) return false;
        const d = new Date(a.date);
        return !isNaN(d.getTime()) && format(d, 'yyyy-MM-dd') === dateKey;
      });
      return { day: label, appointments: appointmentsForDay.length };
    });
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
            {/* View Toggle */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full text-sm transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-full text-sm transition ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Calendar View
              </button>
            </div>

            {/* List or Calendar View */}
            {viewMode === 'list' ? (
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">
                    {activeView === 'today' ? "Today's Schedule" : "This Week's Schedule"}
                  </h2>
                  <div className="space-x-2">
                    <button
                      onClick={() => setActiveView('today')}
                      className={`px-3 py-1 rounded-full text-sm transition ${activeView === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setActiveView('week')}
                      className={`px-3 py-1 rounded-full text-sm transition ${activeView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      This Week
                    </button>
                  </div>
                </div>

                {activeView === 'today' ? (
                  displayedAppointments.length ? (
                    displayedAppointments.map((apt: any) => (
                      <div
                        key={apt.appointmentId}
                        className="bg-blue-50 p-4 rounded-lg flex justify-between items-center hover:bg-blue-100 transition"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {apt.user?.profileImageUrl ? (
                              <img
                                src={apt.user.profileImageUrl}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center text-sm font-medium uppercase">
                                {apt.user?.firstName?.[0]}
                                {apt.user?.lastName?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {apt.user?.firstName} {apt.user?.lastName}
                            </h3>
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded-full ${
                                apt.appointmentStatus === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : apt.appointmentStatus === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : apt.appointmentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {apt.appointmentStatus?.charAt(0).toUpperCase() + apt.appointmentStatus?.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p>{apt.timeSlot}</p>
                          <p className="text-xs text-gray-500">
                            {apt.doctor?.availability?.find((a: any) => a.availabilityId === apt.availabilityId)?.slotDurationMinutes ?? 30} min
                          </p>
                          {apt.appointmentStatus === 'Confirmed' ? (
                            <CheckCircle className="text-green-500 w-4 h-4 mt-1" />
                          ) : (
                            <XCircle className="text-yellow-500 w-4 h-4 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="text-blue-600 w-4 h-4" />
                          <Video className="text-green-600 w-4 h-4" />
                          <MessageSquare className="text-gray-600 w-4 h-4" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Calendar className="mx-auto mb-2 text-gray-300 w-10 h-10" />
                      <p>No appointments {activeView === 'today' ? 'today' : 'this week'}.</p>
                    </div>
                  )
                ) : (
                  <ResponsiveContainer height={200}>
                    <BarChart data={weeklyScheduleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
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
            )}

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
