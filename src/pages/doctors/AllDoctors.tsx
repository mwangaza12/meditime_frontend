import { useState, useEffect } from 'react';
import { Search, Filter, Star, Calendar, MapPin, Phone, Clock, GraduationCap, Users, ChevronDown,Loader2,Stethoscope,X,User,LogIn} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { doctorApi } from "../../feature/api/doctorApi";
import { specializationApi } from "../../feature/api/specializationApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/modal/Modal";
import { AppointmentModal } from "../appointments/AppointmentModal";

const availabilityOptions = [
  'All Availability',
  'Available Today',
  'Available Tomorrow',
  'Available This Week'
];

export const AllDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Fetch doctors data from backend
  const { data: doctorsData, error: doctorsError, isLoading: doctorsLoading } =
    doctorApi.useGetAllDoctorsQuery({ page: currentPage, pageSize: 100 });
  const allDoctors = doctorsData?.doctors || [];

  // Fetch specializations for filter dropdown
  const {data: specializationsData,error: specializationsError,isLoading: specializationsLoading } = specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 50 });
  const specializations = specializationsData?.specializations || [];

  // Create specialties array for dropdown
  const specialties = [
    'All Specialties',
    ...specializations.map((spec: any) => spec.name)
  ];

  // Filter doctors based on search and filters
  const filteredDoctors = allDoctors.filter((doctor: any) => {
    const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    const specialtyName = doctor.specialization?.name?.toLowerCase() || '';
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         specialtyName.includes(searchTerm.toLowerCase()) ||
                         doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || 
                           doctor.specialization?.name === selectedSpecialty;
    
    // For availability, we'll check if doctor has availability data
    const matchesAvailability = selectedAvailability === 'All Availability' || 
                               (doctor.availability && doctor.availability.length > 0);

    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  // Sort doctors
  const sortedDoctors = [...filteredDoctors].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'name':
        const nameA = `${a.user.firstName} ${a.user.lastName}`;
        const nameB = `${b.user.firstName} ${b.user.lastName}`;
        return nameA.localeCompare(nameB);
      case 'specialty':
        const specA = a.specialization?.name || '';
        const specB = b.specialization?.name || '';
        return specA.localeCompare(specB);
      case 'availability':
        const availA = a.availability?.length || 0;
        const availB = b.availability?.length || 0;
        return availB - availA;
      default:
        return 0;
    }
  });

  // Get next available day helper function
  const getNextAvailableDay = (availability: any) => {
    if (!availability || !Array.isArray(availability) || availability.length === 0)
      return "Not available";

    const today = new Date().getDay();
    const daysOfWeek = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    for (let i = 0; i < 7; i++) {
      const checkDay = (today + i) % 7;
      const dayName = daysOfWeek[checkDay];
      const availableSlot = availability.find((slot: any) =>
        (slot.dayOfWeek || slot.day)?.toLowerCase() === dayName.toLowerCase()
      );
      if (availableSlot) {
        const timeSlot = `${availableSlot.startTime || availableSlot.start} - ${
          availableSlot.endTime || availableSlot.end
        }`;
        return i === 0 ? `Today: ${timeSlot}` : `${dayName}: ${timeSlot}`;
      }
    }
    return "Not available";
  };

  // Handle appointment booking
  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);

    if (isAuthenticated) {
      setShowBookingModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const closeModals = () => {
    setShowBookingModal(false);
    setShowLoginModal(false);
    setSelectedDoctor(null);
  };

  useEffect(() => {
    if (isAuthenticated && selectedDoctor && showLoginModal) {
      setShowLoginModal(false);
      setShowBookingModal(true);
    }
  }, [isAuthenticated, selectedDoctor, showLoginModal]);

  const DoctorCard = ({ doctor }: {doctor: any}) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="md:flex">
        <div className="md:w-1/3">
          <div className="w-full h-64 md:h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Stethoscope className="w-10 h-10" />
              </div>
              <p className="text-sm font-medium">Dr. {doctor.user.firstName}</p>
            </div>
          </div>
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Dr. {doctor.user.firstName} {doctor.user.lastName}
              </h3>
              <p className="text-blue-600 font-medium mb-1">
                {doctor.specialization?.name || 'General Medicine'}
              </p>
              <p className="text-gray-600 text-sm">
                {doctor.specialization?.description || 'Healthcare Professional'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-gray-700">
                  4.8
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Reviews
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Experience: Professional
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              Medical Center
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-2" />
              Medical Professional
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {doctor.user.email}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              doctor.availability && doctor.availability.length > 0
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {getNextAvailableDay(doctor.availability)}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              Consultation Available
            </span>
          </div>

          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Weekly Schedule:</p>
              <div className="text-xs text-gray-600 space-y-1">
                {doctor.availability?.length ? (
                  doctor.availability.map((slot: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-medium">{slot.dayOfWeek || slot.day}:</span>
                      <span>{slot.startTime || slot.start} - {slot.endTime || slot.end}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Schedule not available</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleBookAppointment(doctor)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (doctorsLoading || specializationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          <span className="ml-2 text-lg text-gray-700">Loading Doctors...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (doctorsError || specializationsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="text-red-500 text-center py-4 border border-red-300 bg-red-50 rounded-md">
            <p className="font-semibold mb-1">Error fetching doctors:</p>
            <p>
              {
                (doctorsError && 'data' in doctorsError && (doctorsError.data as any)?.error) ||
                (specializationsError && 'data' in specializationsError && (specializationsError.data as any)?.error) ||
                "An unknown error occurred."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Doctors</h1>
              <p className="text-gray-600 mt-2">
                Find the right healthcare professional for your needs
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {filteredDoctors.length}
              </p>
              <p className="text-gray-600 text-sm">
                Doctors Available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search doctors by name, specialty, or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="specialty">Specialty</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {sortedDoctors.length > 0 ? (
            sortedDoctors.map((doctor: any) => (
              <DoctorCard key={doctor.doctorId} doctor={doctor} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {sortedDoctors.length > 0 && allDoctors.length > sortedDoctors.length && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Load More Doctors
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <LogIn className="w-5 h-5 text-blue-600" /> Login Required
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4">
              <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 mb-4">
                Please log in to book an appointment with Dr.{" "}
                {selectedDoctor?.user?.firstName}{" "}
                {selectedDoctor?.user?.lastName}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg"
                >
                  Go to Login
                </button>
                <button
                  onClick={closeModals}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <Modal
          title="Create Appointment"
          show={showBookingModal}
          onClose={closeModals}
          width="max-w-xl"
        >
          <AppointmentModal onClose={closeModals} doctor={selectedDoctor} />
        </Modal>
      )}
    </div>
  );
};