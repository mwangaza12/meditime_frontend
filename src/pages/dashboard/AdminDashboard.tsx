import React from 'react';
import { Users, ClipboardList, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { userApi } from '../../feature/api/userApi';
import { appointmentApi } from '../../feature/api/appointmentApi';

// Mock Revenue Data
const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 5100 },
  { month: 'Apr', revenue: 4600 },
  { month: 'May', revenue: 5500 },
  { month: 'Jun', revenue: 4820 },
];

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

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center mt-2">
          <TrendingUp className={`w-4 h-4 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm ml-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {change}% from last month
          </span>
        </div>
      </div>
      <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { data: userData, isLoading: usersLoading } = userApi.useGetAllUsersQuery({});
  const { data: appointmentData, isLoading: appointmentsLoading } = appointmentApi.useGetAllAppointmentsQuery({});

  const totalUsers = userData?.length || 0;
  const totalAppointments = appointmentData?.length || 0;

  // Dynamic User Growth Data (by month)
  const dynamicUserGrowthData = React.useMemo(() => {
    if (!userData) return [];

    const monthMap: Record<string, number> = {};

    userData.forEach((user: any) => {
      const createdAt = new Date(user.createdAt);
      const month = createdAt.toLocaleString('default', { month: 'short' });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.map(month => ({
      month,
      users: monthMap[month] || 0
    }));
  }, [userData]);

  // Dynamic Weekly Activity Data (appointments by weekday)
  const dynamicWeeklyActivityData = React.useMemo(() => {
    if (!appointmentData) return [];

    const dayMap: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    appointmentData.forEach((appointment: any) => {
      const date = new Date(appointment.date);  // Adjust key name if necessary
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayOrder.map(day => ({
      day,
      appointments: dayMap[day] || 0
    }));
  }, [appointmentData]);

  // Appointment Status Data (for Pie Chart)
  const appointmentStatusCounts = appointmentData?.reduce((acc: any, appointment: any) => {
    const status = appointment.appointmentStatus || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const appointmentStatusData = Object.keys(appointmentStatusCounts).map(status => ({
    name: status,
    value: appointmentStatusCounts[status],
    color: appointmentStatusColors[status] || '#9CA3AF',
  }));

  const recentAppointments = appointmentData?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={usersLoading ? 'Loading...' : totalUsers.toString()}
            change="+4.2"
            changeType="increase"
            icon={Users}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Appointments"
            value={appointmentsLoading ? 'Loading...' : totalAppointments.toString()}
            change="+12.5"
            changeType="increase"
            icon={ClipboardList}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Revenue"
            value="$4,820"
            change="+8.1"
            changeType="increase"
            icon={DollarSign}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Completion Rate"
            value="94%"
            change="+2.3"
            changeType="increase"
            icon={Activity}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Appointment Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
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

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            {usersLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dynamicUserGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            {appointmentsLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dynamicWeeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
            <div className="space-y-4">
              {appointmentsLoading ? (
                <p className="text-sm text-gray-500">Loading appointments...</p>
              ) : (
                recentAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{appointment.patient || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{appointment.service || 'Service'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{appointment.time || 'Time'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
