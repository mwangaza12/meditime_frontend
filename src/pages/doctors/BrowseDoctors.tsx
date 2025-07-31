import { useState, useEffect } from "react";
import {Loader2,Stethoscope,Users,Calendar,Clock,Phone,X,User,LogIn} from "lucide-react";
import { doctorApi } from "../../feature/api/doctorApi";
import { specializationApi } from "../../feature/api/specializationApi";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/modal/Modal";
import { AppointmentModal } from "../appointments/AppointmentModal";

export const BrowseDoctors = () => {
  const [specializationId, setSpecializationId] = useState<string>("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const { data: doctorsData, error: doctorsError, isLoading: doctorsLoading } =
    doctorApi.useGetAllDoctorsQuery({ page: 1, pageSize: 100 });
  const allDoctors = doctorsData?.doctors || [];

  const {
    data: specializationsData,
    error: specializationsError,
    isLoading: specializationsLoading
  } = specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 50 });
  const specializations = specializationsData?.specializations || [];

  const {
    data: specializationData,
    error: specializationError,
    isLoading: specializationLoading
  } = doctorApi.useBrowseDoctorsQuery(
    { specializationId },
    { skip: !specializationId }
  );
  const specializationDoctors = specializationData?.doctors || [];

  const filteredDoctors = specializationId
    ? specializationDoctors
    : allDoctors;
  const isAnyLoading = doctorsLoading || specializationLoading;
  const isAnyError = doctorsError || specializationError;

  const getErrorMessage = (error: any) =>
    error?.data?.error || error?.error || "";
  const errorMessage =
    getErrorMessage(doctorsError) || getErrorMessage(specializationError);

  const handleBookAppointment = (doctorId: string) => {
    const doctor = filteredDoctors.find(
      (d: any) => d.doctorId === doctorId
    );
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

  const getNextAvailableDay = (availability: any) => {
    if (!availability || !Array.isArray(availability) || availability.length === 0)
      return "Not available";

    const today = new Date().getDay();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    for (let i = 0; i < 7; i++) {
      const checkDay = (today + i) % 7;
      const dayName = daysOfWeek[checkDay];
      const availableSlot = availability.find((slot: any) =>
        (slot.dayOfWeek || slot.day)?.toLowerCase() ===
        dayName.toLowerCase()
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

  useEffect(() => {
    if (isAuthenticated && selectedDoctor && showLoginModal) {
      setShowLoginModal(false);
      setShowBookingModal(true);
    }
  }, [isAuthenticated, selectedDoctor, showLoginModal]);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Stethoscope className="text-blue-600" /> Browse Doctors
        </h1>

        {/* Specialization Filter */}
        <div className="mb-6">
          <label
            htmlFor="specialization-select"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Filter by Specialization:
          </label>
          <div className="relative">
            {specializationsLoading ? (
              <div className="flex items-center text-gray-500">
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Loading
                Specializations...
              </div>
            ) : specializationsError ? (
              <div className="text-red-500">Error loading specializations.</div>
            ) : (
              <select
                id="specialization-select"
                value={specializationId}
                onChange={(e) => setSpecializationId(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec: any) => (
                  <option key={spec.specializationId} value={spec.specializationId}>
                    {spec.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isAnyLoading && (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            <span className="ml-2 text-lg text-gray-700">Loading Doctors...</span>
          </div>
        )}

        {/* Error State */}
        {!isAnyLoading && isAnyError && (
          <div className="text-red-500 text-center py-4 border border-red-300 bg-red-50 rounded-md">
            <p className="font-semibold mb-1">Error fetching doctors:</p>
            <p>{errorMessage || "An unknown error occurred."}</p>
          </div>
        )}

        {/* No Doctors */}
        {!isAnyLoading && !isAnyError && filteredDoctors.length === 0 && (
          <div className="text-gray-500 text-center mt-8 p-4 border border-gray-300 rounded-md bg-gray-50">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-semibold">
              {specializationId
                ? "No doctors found for this specialization."
                : "No doctors available at the moment."}
            </p>
          </div>
        )}

        {/* Doctor List */}
        {!isAnyLoading && !isAnyError && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor: any) => (
              <div
                key={doctor.doctorId}
                className="rounded-lg shadow-md p-6 border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mb-4 pb-3 border-b border-gray-100">
                  <h2 className="font-bold text-xl text-gray-800 mb-1">
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                  </h2>
                  {doctor.specialization?.name && (
                    <p className="text-sm text-blue-600 font-medium">
                      {doctor.specialization.name} Specialist
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <p className="flex items-center gap-2">
                    <span className="text-lg">📧</span> {doctor.user.email}
                  </p>
                  {doctor.user.phoneNumber && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {doctor.user.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" /> Availability
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Next Available:
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {getNextAvailableDay(doctor.availability)}
                    </p>
                  </div>

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

                <button
                  onClick={() => handleBookAppointment(doctor.doctorId)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
};

export default BrowseDoctors;
