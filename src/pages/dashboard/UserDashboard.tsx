import React, { useState, useMemo } from 'react';
import { appointmentApi } from '../../feature/api/appointmentApi'; 
import { Calendar, Clock, User, Bell, MapPin, Star, MessageSquare, FileText, Heart, Pill } from "lucide-react";
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { prescriptionApi } from '../../feature/api/prescriptionApi';

dayjs.extend(isSameOrAfter);

// Mocked Data
const healthMetrics = [
  { name: "Blood Pressure", value: "120/80", unit: "mmHg", status: "Normal", color: "text-green-600" },
  { name: "Heart Rate", value: "72", unit: "bpm", status: "Normal", color: "text-green-600" },
  { name: "Weight", value: "165", unit: "lbs", status: "Healthy", color: "text-green-600" },
  { name: "BMI", value: "24.2", unit: "", status: "Normal", color: "text-green-600" }
];

const medications = [
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", nextDose: "8:00 AM" },
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily", nextDose: "6:00 PM" }
];

const notifications = [
  { id: 1, message: "Appointment reminder: Dr. Sarah Johnson tomorrow at 10:00 AM", time: "2 hours ago", type: "appointment" },
  { id: 2, message: "Lab results are ready for review", time: "1 day ago", type: "results" },
  { id: 3, message: "Time to take your medication: Metformin", time: "3 hours ago", type: "medication" }
];

const StatCard = ({title,value,subtitle,icon: Icon,bgColor,iconColor}: {title: string;value: string;subtitle?: string;icon: React.ElementType; bgColor: string;iconColor: string;}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user.userId;

  const { data: appointments = [], isLoading, isError } = appointmentApi.useGetAppointmentsByUserIdQuery({ userId });
  const { data: prescriptions = []} = prescriptionApi.useGetPrescriptionsByUserIdQuery({ userId });
  console.log(prescriptions);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = dayjs();
    const upcoming = appointments.filter((a: any) => dayjs(a.appointmentDate).isSameOrAfter(now, 'day'));
    const past = appointments.filter((a: any) => dayjs(a.appointmentDate).isBefore(now, 'day'));
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

  const nextAppointment = upcomingAppointments[0];

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
            value="Ksh. 200"
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

            {/* Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>

              {isLoading ? (
                <p className="text-sm text-gray-500">Loading appointments...</p>
              ) : isError ? (
                <p className="text-sm text-red-500">Failed to load appointments.</p>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map((appointment: any) => {
                    const doctorName = `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
                    const specialty = appointment.doctor.specialization;
                    const date = dayjs(appointment.appointmentDate).format('MMM D, YYYY');
                    const time = appointment.timeSlot;
                    const status = appointment.appointmentStatus;

                    return (
                      <div key={appointment.appointmentId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{doctorName}</h3>
                            <p className="text-sm text-gray-600 capitalize">{specialty}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {date}</span>
                              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {time}</span>
                              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> Online / Clinic</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {activeTab === 'upcoming' ? (
                              <>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>{status}</span>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">Reschedule</button>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < (appointment.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">Write Review</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Health Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{metric.name}</p>
                      <p className="text-sm text-gray-600">{metric.status}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${metric.color}`}>{metric.value} {metric.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h2>
              <div className="space-y-3">
                {medications.map((med, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                    <p className="text-xs text-gray-500 mt-1">Next dose: {med.nextDose}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Doctor</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                  <FileText className="w-4 h-4" />
                  <span>View Lab Results</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
                  <User className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
