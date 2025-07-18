import { useMemo, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfToday, isToday, type Day, nextDay } from 'date-fns';
import { Calendar, Users, MessageSquare, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { appointmentApi } from '../../feature/api/appointmentApi';
import Swal from 'sweetalert2';
import moment from "moment";

const localizer = momentLocalizer(moment);

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
            <TrendingUp className={`w-4 h-4 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  type CalendarEvent = {
    title: string;
    start: Date;
    end: Date;
    appointment: any;
  };

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
        if (!matchingAvailability) return null;

        const dayOfWeek = matchingAvailability.dayOfWeek?.toLowerCase() as Weekday;
        const startTime = matchingAvailability.startTime;

        if (!validDays.includes(dayOfWeek)) return null;

        const dayIndex = weekdays[dayOfWeek];
        const today = startOfToday();
        const appointmentDate = nextDay(today, dayIndex as Day);
        const [hours, minutes] = startTime.split(':').map(Number);
        const start = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), hours, minutes);
        const duration = (apt.duration ?? 30) * 60000;

        return {
          title: `${apt.user?.firstName ?? "Unknown"} – ${apt.appointmentStatus ?? "Consultation"}`,
          start,
          end: new Date(start.getTime() + duration),
          appointment: apt,
        };
      })
      .filter(Boolean) as CalendarEvent[];
  }, [appointments]);

  const todaysAppointments = useMemo(() => {
    return calendarEvents.filter(event => isToday(event.start)).map(event => event.appointment);
  }, [calendarEvents]);

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
            <div className="bg-white rounded-xl p-6 shadow-sm h-[500px]">
              <h3 className="font-semibold mb-2 text-blue-800">Appointments Calendar</h3>
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                view={view}
                onNavigate={(newDate) => setCurrentDate(newDate)}
                onView={(newView) => setView(newView)}
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

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2 text-blue-800">Patient Visits Trend</h3>
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
                <h3 className="font-semibold mb-2 text-blue-800">Appointment Status</h3>
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

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold mb-4 text-blue-800">Recent Patients</h2>
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
