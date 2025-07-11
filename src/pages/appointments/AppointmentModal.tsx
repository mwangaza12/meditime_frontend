import { useState } from "react";
import { useSelector } from "react-redux";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { User, Phone, Calendar, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import type { RootState } from "../../app/store";

export const AppointmentModal = ({onClose,doctor,}: {onClose: () => void;doctor: any;}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("");

  const [createAppointment, { isLoading }] = appointmentApi.useCreateAppointmentMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || user?.userId;

  if (!doctor) return null;

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  };

  const getAvailableDates = () => {
    if (!doctor?.availability || !Array.isArray(doctor.availability)) return [];

    const availableDays = doctor.availability.map((slot: any) =>
      slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()
    );

    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

      if (availableDays.includes(dayOfWeek)) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          dayOfWeek: dayOfWeek
        });
      }
    }

    return dates;
  };

  const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes = 30) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let current = new Date(0, 0, 0, startHour, startMinute);
    const end = new Date(0, 0, 0, endHour, endMinute);

    while (current < end) {
      const hours = current.getHours().toString().padStart(2, "0");
      const minutes = current.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  };

  const getAvailableTimeSlotsForDate = () => {
    if (!selectedDate || !doctor?.availability) return [];

    const selectedDay = getDayOfWeek(selectedDate);

    const dayAvailability = doctor.availability.filter((slot: any) =>
      (slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()) === selectedDay
    );

    let allTimeSlots: string[] = [];

    dayAvailability.forEach((slot: any) => {
      const startTime = slot.startTime || slot.start;
      const endTime = slot.endTime || slot.end;

      if (startTime && endTime) {
        const timeSlots = generateTimeSlots(startTime, endTime);
        allTimeSlots = [...allTimeSlots, ...timeSlots];
      }
    });

    return [...new Set(allTimeSlots)].sort();
  };

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
      userId: userId,
      doctorId: doctor?.doctorId,
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

  const availableDates = getAvailableDates();
  const availableTimeSlots = getAvailableTimeSlotsForDate();

  const availableDateObjects = availableDates.map((d) => new Date(d.value));

  return (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Doctor Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}
            </h3>
            <p className="text-blue-600 font-medium mb-3">
              {doctor?.specialization?.name || "General Practitioner"}
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              {doctor?.user?.email && (
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {doctor.user.email}
                </p>
              )}
              {doctor?.user?.phoneNumber && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  {doctor.user.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="text-2xl font-bold text-green-600">
              ${doctor?.consultationFee || 0}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Available Schedule
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {doctor?.availability?.length ? (
              doctor.availability.map((slot: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between bg-white bg-opacity-50 rounded px-2 py-1"
                >
                  <span className="font-medium text-blue-700">
                    {slot.dayOfWeek || slot.day}:
                  </span>
                  <span className="text-gray-600">
                    {slot.startTime || slot.start}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic col-span-2">
                Schedule not available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Form */}
      <div className="space-y-6">

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Date
          </label>
          <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={(date: Date | null) => {
              const isoDate = date ? date.toISOString().split("T")[0] : "";
              setSelectedDate(isoDate);
              setSelectedTime("");
            }}
            includeDates={availableDateObjects}
            placeholderText="Choose an available date"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            dateFormat="EEE, MMM d, yyyy"
          />
          {availableDates.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              No available dates found for this doctor.
            </p>
          )}
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Time Slot
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={!selectedDate || availableTimeSlots.length === 0}
          >
            <option value="">
              {!selectedDate ? "Select a date first" : "Choose a time slot"}
            </option>
            {availableTimeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {selectedDate && availableTimeSlots.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              No available time slots for this date.
            </p>
          )}
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Appointment Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Doctor:</strong> Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}</p>
              <p><strong>Date:</strong> {availableDates.find(d => d.value === selectedDate)?.label}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Fee:</strong> ${doctor?.consultationFee || 0}</p>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={isLoading || !selectedDate || !selectedTime}
          className="w-full bg-blue-600 text-white rounded-lg py-4 font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Booking...
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Confirm Appointment
            </>
          )}
        </button>
      </div>
    </div>
  );
};
