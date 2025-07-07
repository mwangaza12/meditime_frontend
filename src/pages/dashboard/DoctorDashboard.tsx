import React, { useState } from 'react';
import { Calendar, Users, MessageSquare, FileText,  Phone, Video, AlertCircle, CheckCircle, XCircle, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';


// Mock data for charts
const patientVisitsData = [
  { month: 'Jan', visits: 85 },
  { month: 'Feb', visits: 92 },
  { month: 'Mar', visits: 78 },
  { month: 'Apr', visits: 105 },
  { month: 'May', visits: 98 },
  { month: 'Jun', visits: 112 },
];

const appointmentStatusData = [
  { name: 'Completed', value: 45, color: '#10B981' },
  { name: 'Scheduled', value: 28, color: '#3B82F6' },
  { name: 'Cancelled', value: 8, color: '#EF4444' },
];

const weeklyScheduleData = [
  { day: 'Mon', appointments: 12 },
  { day: 'Tue', appointments: 8 },
  { day: 'Wed', appointments: 15 },
  { day: 'Thu', appointments: 10 },
  { day: 'Fri', appointments: 13 },
  { day: 'Sat', appointments: 6 },
  { day: 'Sun', appointments: 0 },
];

// Mock appointments data
const todaysAppointments = [
  {
    id: 1,
    patient: "John Doe",
    time: "9:00 AM",
    type: "Consultation",
    status: "Confirmed",
    duration: "30 min",
    isNew: false
  },
  {
    id: 2,
    patient: "Jane Smith",
    time: "10:30 AM",
    type: "Follow-up",
    status: "Confirmed",
    duration: "15 min",
    isNew: false
  },
  {
    id: 3,
    patient: "Mike Johnson",
    time: "2:00 PM",
    type: "Consultation",
    status: "Pending",
    duration: "45 min",
    isNew: true
  },
  {
    id: 4,
    patient: "Sarah Wilson",
    time: "3:30 PM",
    type: "Check-up",
    status: "Confirmed",
    duration: "30 min",
    isNew: false
  }
];

const recentPatients = [
  { id: 1, name: "Alice Brown", lastVisit: "2 days ago", condition: "Hypertension", priority: "Normal" },
  { id: 2, name: "Bob Davis", lastVisit: "1 week ago", condition: "Heart Disease", priority: "High" },
  { id: 3, name: "Carol Wilson", lastVisit: "3 days ago", condition: "Diabetes", priority: "Normal" },
  { id: 4, name: "David Lee", lastVisit: "5 days ago", condition: "Chest Pain", priority: "High" },
];

const messages = [
  { id: 1, from: "John Doe", message: "Thank you for the consultation yesterday", time: "2 hours ago", unread: true },
  { id: 2, from: "Jane Smith", message: "I have a question about my medication", time: "4 hours ago", unread: true },
  { id: 3, from: "Mike Johnson", message: "Can we reschedule my appointment?", time: "1 day ago", unread: false },
];

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

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, subtitle, icon: Icon, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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

export const DoctorDashboard = () => {
  const [activeView, setActiveView] = useState<'today' | 'week'>('today');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Appointments"
            value="8"
            subtitle="4 confirmed, 1 pending"
            icon={Calendar}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Patients"
            value="247"
            change="+12"
            changeType="increase"
            icon={Users}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="This Month"
            value="98"
            subtitle="Patient visits"
            change="+8.5"
            changeType="increase"
            icon={Activity}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Unread Messages"
            value="5"
            subtitle="2 urgent"
            icon={MessageSquare}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointments & Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveView('today')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeView === 'today' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setActiveView('week')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeView === 'week' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>

              {activeView === 'today' ? (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {appointment.patient.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center">
                              {appointment.patient}
                              {appointment.isNew && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  New
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.time}</p>
                            <p className="text-sm text-gray-600">{appointment.duration}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.status === 'Confirmed' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-yellow-500" />
                            )}
                            <div className="flex space-x-1">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Phone className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Video className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyScheduleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Visits Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Visits Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={patientVisitsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Appointment Status */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status</h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={appointmentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Recent Patients */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h2>
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {patient.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Patients
              </button>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  2 unread
                </span>
              </div>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg border ${
                    message.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{message.from}</p>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                    {message.unread && (
                      <button className="text-blue-600 hover:text-blue-800 text-xs mt-2">
                        Reply
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Messages
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                  <span>Add Appointment</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Write Prescription</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  <Users className="w-4 h-4" />
                  <span>Add New Patient</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors">
                  <Activity className="w-4 h-4" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>

            {/* Emergency Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Emergency Alerts</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">High Priority Patient</p>
                  <p className="text-xs text-red-600 mt-1">Bob Davis requires immediate attention</p>
                  <button className="text-red-600 hover:text-red-800 text-xs mt-2 font-medium">
                    View Details
                  </button>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Lab Results Ready</p>
                  <p className="text-xs text-yellow-600 mt-1">3 patients have pending lab results</p>
                  <button className="text-yellow-600 hover:text-yellow-800 text-xs mt-2 font-medium">
                    Review Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}