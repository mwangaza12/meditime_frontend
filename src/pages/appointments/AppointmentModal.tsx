import { useState } from "react";
import { useSelector } from "react-redux";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { X, User, Phone } from "lucide-react";
import type { RootState } from "../../app/store";
import { toast } from "react-hot-toast";

export const AppointmentModal = ({
  onClose,
  doctor,
}: {
  onClose: () => void;
  doctor: any;
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [createAppointment, { isLoading }] = appointmentApi.useCreateAppointmentMutation();

  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || user?.userId;  // Adjust this according to your auth state

  if (!doctor) return null;

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time.");
      return;
    }

    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    const appointmentData = {
      userId: userId,  // ✅ Logged-in patient ID (must be number)
      doctorId: doctor?.doctorId,  // ✅ Doctor ID (must match backend type: number or string)
      appointmentDate: selectedDate,
      timeSlot: selectedTime,
      totalAmount: doctor?.consultationFee?.toString() || "0",
    };

    try {
      await createAppointment(appointmentData).unwrap();
      toast.success("Appointment booked successfully!");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.error || "Failed to book appointment.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Doctor Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-700 mb-1">
          Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}
        </h3>
        <p className="text-sm text-gray-700 mb-1">
          {doctor?.specialization?.name || "Specialization not available"}
        </p>
        {doctor?.user?.email && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <User className="w-4 h-4" /> {doctor.user.email}
          </p>
        )}
        {doctor?.user?.phoneNumber && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Phone className="w-4 h-4" /> {doctor.user.phoneNumber}
          </p>
        )}
        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
          💰 Fee: <span className="font-semibold">${doctor?.consultationFee || 0}</span>
        </p>
      </div>

      {/* Appointment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Select Time Slot</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="02:00 PM">02:00 PM</option>
          </select>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded py-3 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
};
