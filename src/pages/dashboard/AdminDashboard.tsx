import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import {Users,ClipboardList,DollarSign,TrendingUp,Activity,} from 'lucide-react';
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,BarChart,Bar,ResponsiveContainer,PieChart,Pie,Cell,AreaChart,Area,} from 'recharts';
import { userApi } from '../../feature/api/userApi';
import { appointmentApi } from '../../feature/api/appointmentApi';
import { paymentApi } from '../../feature/api/paymentApi';
import { Modal } from '../../components/modal/Modal';


const appointmentStatusColors: Record<string, string> = {
  confirmed: '#10B981',
  pending: '#3B82F6',
  cancelled: '#EF4444',
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  bgColor,
  iconColor,
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center mt-2">
          <TrendingUp
            className={`w-4 h-4 ${
              changeType === 'increase' ? 'text-green-500' : 'text-red-500'
            }`}
          />
          <span
            className={`text-sm ml-1 ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}% from last month
          </span>
        </div>
      </div>
      <div
        className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { data: userData, isLoading: usersLoading } = userApi.useGetAllUsersQuery({ page: 1, pageSize: 10 });
  const { data: appointmentData, isLoading: appointmentsLoading } = appointmentApi.useGetAllAppointmentsQuery({});
  const { data: paymentsData, isLoading: paymentsLoading } = paymentApi.useGetAllPaymentsQuery({});

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalUsers = userData?.users?.length || 0;
  const totalAppointments = appointmentData?.length || 0;

  const totalAmountUsed = useMemo(() => {
    return paymentsData?.reduce((sum: number, payment: any) => {
      const amount = parseFloat(payment.appointment?.totalAmount ?? '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0) || 0;
  }, [paymentsData]);

   // Monthly Revenue Chart Data
  const dynamicRevenueData = useMemo(() => {
    if (!paymentsData) return [];

    const revenueMap: Record<string, number> = {};

    paymentsData.forEach((payment: any) => {
      const date = new Date(payment.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      const amount = parseFloat(payment.appointment?.totalAmount ?? '0');
      revenueMap[month] = (revenueMap[month] || 0) + (isNaN(amount) ? 0 : amount);
    });

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return monthOrder.map((month) => ({
      month,
      revenue: revenueMap[month] || 0,
    }));
  }, [paymentsData]);

  // Completion Rate
  const completionRate = useMemo(() => {
    if (!appointmentData || appointmentData.length === 0) return 0;
    const confirmedCount = appointmentData.filter((a: any) => a.appointmentStatus === 'confirmed').length;
    return Math.round((confirmedCount / appointmentData.length) * 100);
  }, [appointmentData]);

  const dynamicUserGrowthData = useMemo(() => {
    if (!userData?.users) return [];
    const monthMap: Record<string, number> = {};
    userData.users.forEach((user: any) => {
      const createdAt = new Date(user.createdAt);
      const month = createdAt.toLocaleString('default', { month: 'short' });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.map((month) => ({
      month,
      users: monthMap[month] || 0,
    }));
  }, [userData]);

  const dynamicWeeklyActivityData = useMemo(() => {
    if (!appointmentData) return [];
    const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    appointmentData.forEach((appointment: any) => {
      const date = new Date(appointment.date ?? appointment.createdAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayOrder.map((day) => ({
      day,
      appointments: dayMap[day] || 0,
    }));
  }, [appointmentData]);

  const appointmentStatusCounts = appointmentData?.reduce((acc: any, appointment: any) => {
    const status = appointment.appointmentStatus || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const appointmentStatusData = Object.keys(appointmentStatusCounts).map((status) => ({
    name: status,
    value: appointmentStatusCounts[status],
    color: appointmentStatusColors[status] || '#9CA3AF',
  }));

  const bookedDates = useMemo(() => {
    if (!appointmentData) return [];
    return appointmentData.map((appointment: any) => new Date(appointment.date ?? appointment.createdAt).toDateString());
  }, [appointmentData]);

  const appointmentsOnSelectedDate = useMemo(() => {
    if (!selectedDate || !appointmentData) return [];
    const selectedStr = selectedDate.toDateString();
    return appointmentData.filter(
      (appointment: any) =>
        new Date(appointment.date ?? appointment.createdAt).toDateString() === selectedStr
    );
  }, [selectedDate, appointmentData]);

  const handleDateClick = (date: Date) => {
    const str = date.toDateString();
    if (bookedDates.includes(str)) {
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  const recentAppointments = appointmentData?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* === STAT CARDS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={usersLoading ? 'Loading...' : totalUsers.toString()} change="+4.2" changeType="increase" icon={Users} bgColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard title="Appointments" value={appointmentsLoading ? 'Loading...' : totalAppointments.toString()} change="+12.5" changeType="increase" icon={ClipboardList} bgColor="bg-green-50" iconColor="text-green-600" />
          <StatCard title="Revenue" value={paymentsLoading ? 'Loading...' : `Ksh. ${totalAmountUsed}`} change="+8.1" changeType="increase" icon={DollarSign} bgColor="bg-purple-50" iconColor="text-purple-600" />
          <StatCard title="Completion Rate" value={appointmentsLoading ? 'Loading...' : `${completionRate}%`} change="+2.3" changeType="increase" icon={Activity} bgColor="bg-orange-50" iconColor="text-orange-600" />
        </div>

        {/* === CHARTS === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dynamicRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Appointment Status Pie Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {appointmentStatusData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === BOTTOM ROW: USER GROWTH / WEEKLY ACTIVITY / RECENT APPOINTMENTS === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            {usersLoading ? <p className="text-sm text-gray-500">Loading...</p> :
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dynamicUserGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>}
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            {appointmentsLoading ? <p className="text-sm text-gray-500">Loading...</p> :
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dynamicWeeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
            <div className="space-y-4">
              {appointmentsLoading ? <p className="text-sm text-gray-500">Loading appointments...</p> :
                recentAppointments.map((appointment: any) => (
                  <div key={appointment.appointmentId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.user?.firstName} {appointment.user?.lastName}</p>
                      <p className="text-xs text-gray-500">{appointment.doctor?.specialization?.name || 'Service'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{appointment.timeSlot}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.appointmentStatus === 'confirmed' ? 'bg-green-100 text-green-800'
                          : appointment.appointmentStatus === 'pending' ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'}`}>
                        {appointment.appointmentStatus}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* === CALENDAR === */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Calendar</h3>
          {appointmentsLoading ? <p className="text-sm text-gray-500">Loading calendar...</p> :
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={({ date, view }) => {
                if (view === 'month' && bookedDates.includes(date.toDateString())) {
                  return 'bg-blue-100 text-blue-800 font-semibold rounded-full';
                }
                return '';
              }}
            />}
        </div>

        {/* === MODAL === */}
        <Modal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Appointments on ${selectedDate ? format(selectedDate, 'PPP') : ''}`}
          width="max-w-md"
        >
          {appointmentsOnSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {appointmentsOnSelectedDate.map((appt: any) => (
                <div key={appt.appointmentId} className="border-b last:border-0 pb-2">
                  <p className="text-sm font-semibold">
                    {appt.user?.firstName} {appt.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appt.doctor?.specialization?.name || 'Service'} | {appt.availability?.timeSlot}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      appt.appointmentStatus === 'confirmed'
                        ? 'text-green-600'
                        : appt.appointmentStatus === 'pending'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}
                  >
                    {appt.appointmentStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No appointments found.</p>
          )}
        </Modal>


      </div>
    </div>
  );
};
