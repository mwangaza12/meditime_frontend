import { useState, useEffect } from 'react';
import { Search, Phone, Loader2, Stethoscope, LogIn, Eye } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { doctorApi } from '../../feature/api/doctorApi';
import { specializationApi } from '../../feature/api/specializationApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/modal/Modal';
import { AppointmentModal } from '../appointments/AppointmentModal';

const availabilityOptions = [
  'All Availability',
  'Available Today',
  'Available Tomorrow',
  'Available This Week',
];

export const AllDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const { data: doctorsData, isLoading: doctorsLoading, error: doctorsError } =
    doctorApi.useGetAllDoctorsQuery({ page: 1, pageSize: 1000 });
  const { data: specializationsData, isLoading: specializationsLoading, error: specializationsError } =
    specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 50 });

  const allDoctors = doctorsData?.doctors || [];
  const specializations = specializationsData?.specializations || [];
  const specialties = ['All Specialties', ...specializations.map((s: any) => s.name)];

  const filteredDoctors = allDoctors.filter((doctor: any) => {
    const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    const specialty = doctor.specialization?.name?.toLowerCase() || '';
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      specialty.includes(searchTerm.toLowerCase()) ||
      doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All Specialties' || doctor.specialization?.name === selectedSpecialty;

    const matchesAvailability =
      selectedAvailability === 'All Availability' ||
      (doctor.availability && doctor.availability.length > 0);

    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const sortedDoctors = [...filteredDoctors].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'name':
        return `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`);
      case 'specialty':
        return (a.specialization?.name || '').localeCompare(b.specialization?.name || '');
      case 'availability':
        return (b.availability?.length || 0) - (a.availability?.length || 0);
      default:
        return 0;
    }
  });

  const doctorsPerPage = 6;
  const totalPages = Math.ceil(sortedDoctors.length / doctorsPerPage);
  const paginatedDoctors = sortedDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  );

  const getNextAvailableDay = (availability: any[]) => {
    if (!availability?.length) return 'Not available';
    const today = new Date().getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const checkDay = (today + i) % 7;
      const dayName = days[checkDay];
      const slot = availability.find((a) => (a.dayOfWeek || a.day)?.toLowerCase() === dayName.toLowerCase());
      if (slot) {
        return `${i === 0 ? 'Today' : dayName}: ${slot.startTime || slot.start} - ${slot.endTime || slot.end}`;
      }
    }
    return 'Not available';
  };

  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);
    isAuthenticated ? setShowBookingModal(true) : setShowLoginModal(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  const closeModals = () => {
    setShowBookingModal(false);
    setShowLoginModal(false);
    setShowViewModal(false);
    setSelectedDoctor(null);
  };

  const handleViewDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  useEffect(() => {
    if (isAuthenticated && selectedDoctor && showLoginModal) {
      setShowLoginModal(false);
      setShowBookingModal(true);
    }
  }, [isAuthenticated, selectedDoctor, showLoginModal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty, selectedAvailability, sortBy]);

  if (doctorsLoading || specializationsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 text-blue-800 mr-2" />
        <span className="text-gray-600 text-sm">Loading doctors...</span>
      </div>
    );
  }

  if (doctorsError || specializationsError) {
    return (
      <div className="min-h-screen bg-red-50 text-center p-6">
        <p className="text-red-600 font-semibold">Error loading doctors</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="bg-white mb-4">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">All Doctors</h1>
            <p className="text-sm text-gray-500">Browse healthcare professionals</p>
          </div>
          <div className="text-right">
            <p className="text-blue-800 text-lg font-semibold">{filteredDoctors.length}</p>
            <p className="text-sm text-gray-500">Available</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, specialty, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-800 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              {specialties.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              {availabilityOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="name">Sort: Name</option>
              <option value="specialty">Sort: Specialty</option>
              <option value="availability">Sort: Availability</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedDoctors.length > 0 ? (
            paginatedDoctors.map((doctor: any) => (
              <div key={doctor.doctorId} className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200">
                    {doctor.user.profileImageUrl ? (
                      <img
                        src={doctor.user.profileImageUrl}
                        alt={`Dr. ${doctor.user.firstName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-blue-100 flex items-center justify-center w-full h-full">
                        <Stethoscope className="text-blue-800 w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-gray-800">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </h3>
                    <p className="text-sm text-blue-800 font-medium">
                      {doctor.specialization?.name || 'General Medicine'}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {doctor.specialization?.description || 'Healthcare Provider'}
                    </p>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${
                        doctor.availability?.length
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {getNextAvailableDay(doctor.availability)}
                    </span>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        className="flex-1 bg-blue-800 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-900 transition"
                      >
                        Book
                      </button>
                      <button className="bg-gray-100 px-2 py-2 rounded-lg hover:bg-gray-200 transition">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="bg-gray-100 px-2 py-2 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              <Search className="mx-auto mb-2 w-8 h-8" />
              <p>No doctors found. Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showLoginModal && (
        <Modal title="Login Required" show={showLoginModal} onClose={closeModals} width="max-w-sm">
          <div className="text-center">
            <LogIn className="mx-auto mb-2 text-blue-800 w-6 h-6" />
            <p className="mb-4">
              Please login to book an appointment with Dr. {selectedDoctor?.user?.firstName}
            </p>
            <button
              onClick={handleLoginRedirect}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg w-full mb-2 hover:bg-blue-900"
            >
              Go to Login
            </button>
            <button onClick={closeModals} className="w-full text-gray-600 hover:underline">
              Cancel
            </button>
          </div>
        </Modal>
      )}


      {showBookingModal && selectedDoctor && (
        <Modal title="Create Appointment" show={showBookingModal} onClose={closeModals} width="max-w-xl">
          <AppointmentModal onClose={closeModals} doctor={selectedDoctor} />
        </Modal>
      )}

      {showViewModal && selectedDoctor && (
        <Modal title={`Dr. ${selectedDoctor.user.firstName} ${selectedDoctor.user.lastName}`} show={showViewModal} onClose={closeModals}>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Email:</strong> {selectedDoctor.user.email}</p>
            <p><strong>Specialty:</strong> {selectedDoctor.specialization?.name}</p>
            <p><strong>Bio:</strong> {selectedDoctor.specialization?.description || 'N/A'}</p>
            <p><strong>Availability:</strong></p>
            <ul className="list-disc pl-6">
              {selectedDoctor.availability?.length ? (
                selectedDoctor.availability.map((a: any, i: number) => (
                  <li key={i}>{a.day || a.dayOfWeek}: {a.startTime || a.start} - {a.endTime || a.end}</li>
                ))
              ) : (
                <li>Not available</li>
              )}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
};
