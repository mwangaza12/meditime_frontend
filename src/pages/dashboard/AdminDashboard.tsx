import React from 'react';
import { Users, ClipboardList, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 4200, appointments: 45 },
  { month: 'Feb', revenue: 3800, appointments: 38 },
  { month: 'Mar', revenue: 5100, appointments: 52 },
  { month: 'Apr', revenue: 4600, appointments: 48 },
  { month: 'May', revenue: 5500, appointments: 58 },
  { month: 'Jun', revenue: 4820, appointments: 58 },
];

const appointmentStatusData = [
  { name: 'Completed', value: 35, color: '#10B981' },
  { name: 'Scheduled', value: 18, color: '#3B82F6' },
  { name: 'Cancelled', value: 5, color: '#EF4444' },
];

const userGrowthData = [
  { month: 'Jan', users: 85 },
  { month: 'Feb', users: 92 },
  { month: 'Mar', users: 108 },
  { month: 'Apr', users: 115 },
  { month: 'May', users: 120 },
  { month: 'Jun', users: 125 },
];

const dailyActivityData = [
  { day: 'Mon', appointments: 12, revenue: 980 },
  { day: 'Tue', appointments: 8, revenue: 650 },
  { day: 'Wed', appointments: 15, revenue: 1200 },
  { day: 'Thu', appointments: 10, revenue: 820 },
  { day: 'Fri', appointments: 13, revenue: 1050 },
  { day: 'Sat', appointments: 0, revenue: 0 },
  { day: 'Sun', appointments: 0, revenue: 0 },
];

const recentAppointments = [
  { id: 1, patient: 'John Doe', service: 'Consultation', time: '10:00 AM', status: 'Completed' },
  { id: 2, patient: 'Jane Smith', service: 'Follow-up', time: '2:30 PM', status: 'Scheduled' },
  { id: 3, patient: 'Mike Johnson', service: 'Therapy', time: '4:00 PM', status: 'Scheduled' },
  { id: 4, patient: 'Sarah Wilson', service: 'Consultation', time: '9:00 AM', status: 'Cancelled' },
];

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
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value="125"
            change="+4.2"
            changeType="increase"
            icon={Users}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Appointments"
            value="58"
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
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Appointments Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h3>
            <div className="flex items-center justify-center">
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
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {appointmentStatusData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
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
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-xs text-gray-500">{appointment.service}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{appointment.time}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}