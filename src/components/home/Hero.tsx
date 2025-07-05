import { Calendar, Clock, Shield, ArrowRight, Play } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                Trusted Healthcare Platform
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  On Time
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Experience seamless healthcare management with Meditime. Schedule appointments, 
                track your health journey, and connect with trusted healthcare providers—all in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">1,200+</div>
                <div className="text-sm text-gray-600">Healthcare Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group bg-white text-gray-700 px-8 py-4 rounded-lg font-medium border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-8">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-teal-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm text-gray-600">Trusted by thousands</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                  <div className="flex items-center space-x-2 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Live</span>
                  </div>
                </div>

                {/* Appointment Cards */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
                        <p className="text-sm text-gray-600">General Consultation</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">2:00 PM</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Dr. Michael Chen</p>
                        <p className="text-sm text-gray-600">Cardiology Check-up</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-teal-600">4:30 PM</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Dr. Emily Davis</p>
                        <p className="text-sm text-gray-600">Follow-up Visit</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-indigo-600">10:00 AM</p>
                        <p className="text-xs text-gray-500">Tomorrow</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    New Appointment
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View All
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-pulse">
              <Shield className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-yellow-500 text-white p-3 rounded-full shadow-lg animate-bounce">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;