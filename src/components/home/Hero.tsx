import { useState, useEffect } from 'react';
import { Calendar, Clock, Shield, ArrowRight, Play, Heart, Activity, Stethoscope } from 'lucide-react';

export default function CreativeHealthcareHero() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const appointments = [
    { doctor: "Dr. Sarah Johnson", specialty: "Cardiology", time: "2:00 PM", status: "confirmed", color: "blue" },
    { doctor: "Dr. Michael Chen", specialty: "Neurology", time: "4:30 PM", status: "upcoming", color: "purple" },
    { doctor: "Dr. Emily Davis", specialty: "General", time: "10:00 AM", status: "tomorrow", color: "teal" }
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="cross" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M8 0v8H0v4h8v8h4v-8h8V8h-8V0H8z" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#cross)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-blue-800 rounded-full text-sm font-medium border border-blue-200 shadow-sm">
                <Shield className="w-4 h-4 mr-2" />
                <span>Trusted Healthcare Platform</span>
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Your Health,
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                  Redefined
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                Experience the future of healthcare with our automated platform. Advanced diagnostics, personalized treatment plans, and seamless care coordination—all designed around you.
              </p>
            </div>

            {/* Responsive Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Happy Patients */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  50K+
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Happy Patients</div>
                <div className="w-full bg-blue-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full w-full animate-pulse"></div>
                </div>
              </div>

              {/* Expert Doctors */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-teal-100 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  1.2K+
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Expert Doctors</div>
                <div className="w-full bg-teal-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-green-600 h-2 rounded-full w-full animate-pulse"></div>
                </div>
              </div>

              {/* Uptime */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">Uptime</div>
                <div className="w-full bg-indigo-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-pink-600 h-2 rounded-full w-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden">
                <Calendar className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Book Appointment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>

              <button className="group bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl font-bold border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Experience Demo</span>
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 transform hover:scale-105 transition-all duration-500 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Today's Schedule</h3>
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {appointments.map((appointment, idx) => (
                  <div
                    key={idx}
                    className={`bg-gradient-to-r ${
                      appointment.color === 'blue' ? 'from-blue-50 to-blue-100 border-blue-300' :
                      appointment.color === 'purple' ? 'from-purple-50 to-purple-100 border-purple-300' :
                      'from-teal-50 to-teal-100 border-teal-300'
                    } p-4 rounded-xl border-l-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                          appointment.color === 'blue' ? 'from-blue-500 to-blue-600' :
                          appointment.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          'from-teal-500 to-teal-600'
                        } flex items-center justify-center`}>
                          <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{appointment.doctor}</p>
                          <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          appointment.color === 'blue' ? 'text-blue-600' :
                          appointment.color === 'purple' ? 'text-purple-600' :
                          'text-teal-600'
                        }`}>{appointment.time}</p>
                        <p className="text-xs text-gray-500 capitalize">{appointment.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                  New Appointment
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                  View Calendar
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Health Score</span>
                  <span className="text-sm font-bold text-green-600">Excellent</span>
                </div>
                <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full w-4/5 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-green-500 to-teal-500 text-white p-4 rounded-2xl shadow-xl animate-bounce">
              <Shield className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-2xl shadow-xl animate-bounce delay-1000">
              <Activity className="w-6 h-6" />
            </div>
            <div className="absolute top-1/2 -left-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg animate-pulse">
              <Heart className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
