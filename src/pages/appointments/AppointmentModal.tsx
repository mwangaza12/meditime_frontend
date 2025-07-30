import { useState } from "react";
import { useSelector } from "react-redux";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { Calendar, Phone, User } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import type { RootState } from "../../app/store";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export const AppointmentModal = ({ onClose, doctor }: { onClose: () => void; doctor: any }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("");
  const [fee, setFee] = useState<number>(0);
  const navigate = useNavigate();

  const [createAppointment, { isLoading }] = appointmentApi.useCreateAppointmentMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || user?.userId;

  const { data: bookedAppointments } = appointmentApi.useGetAppointmentsForDoctorAndDateQuery(
    {
      doctorId: doctor.doctorId,
      appointmentDate: selectedDate,
    },
    { skip: !selectedDate }
  );

  if (!doctor) return null;

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  };

  const getAvailableDates = () => {
    if (!doctor?.availability || !Array.isArray(doctor.availability)) return [];
    const availableDays = doctor.availability.map(
      (slot: any) => slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()
    );

    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = getDayOfWeek(date.toISOString());
      if (availableDays.includes(dayOfWeek)) {
        dates.push({
          value: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });
      }
    }

    return dates;
  };

  const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes = 60): string[] => {
    const slots: Set<string> = new Set();
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let current = new Date(0, 0, 0, startHour, startMin);
    const end = new Date(0, 0, 0, endHour, endMin);

    while (current < end) {
      const timeStr = `${current.getHours().toString().padStart(2, "0")}:${current
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      slots.add(timeStr);
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return Array.from(slots).sort();
  };

  const getAvailableTimeSlotsForDate = () => {
    if (!selectedDate || !Array.isArray(doctor?.availability)) return [];

    const selectedDay = getDayOfWeek(selectedDate);
    const dayAvailability = doctor.availability.filter(
      (slot: any) => (slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()) === selectedDay
    );

    let allTimeSlots: string[] = [];

    dayAvailability.forEach((slot: any) => {
      const startTime = slot.startTime || slot.start;
      const endTime = slot.endTime || slot.end;
      const interval = 60;

      if (startTime && endTime) {
        const timeSlots = generateTimeSlots(startTime, endTime, interval);
        allTimeSlots = [...allTimeSlots, ...timeSlots];
      }
    });

    const uniqueSortedSlots = [...new Set(allTimeSlots)].sort();

    const bookedSlots = (bookedAppointments || []).map((a: any) =>
      a.startTime?.slice(0, 5)
    );

    return uniqueSortedSlots.filter((slot) => !bookedSlots.includes(slot));
  };

  const updateFee = (date: string) => {
    const selectedDay = getDayOfWeek(date);
    const matchedSlot = doctor?.availability?.find(
      (slot: any) => (slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()) === selectedDay
    );
    setFee(Number(matchedSlot?.amount) || 0);
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

    const selectedDay = getDayOfWeek(selectedDate);
    const matchedSlot = doctor.availability.find((slot: any) => {
      const dayMatch = (slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()) === selectedDay;
      if (!dayMatch) return false;

      const startTime = slot.startTime || slot.start;
      const endTime = slot.endTime || slot.end;
      if (!startTime || !endTime) return false;

      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const [selHour, selMin] = selectedTime.split(":").map(Number);

      const start = new Date(0, 0, 0, startHour, startMin);
      const end = new Date(0, 0, 0, endHour, endMin);
      const selected = new Date(0, 0, 0, selHour, selMin);

      return selected >= start && selected < end;
    });

    if (!matchedSlot?.availabilityId) {
      toast.error("Could not find matching availability for this time.");
      return;
    }

    const intervalMinutes = 60;
    const [selHour, selMin] = selectedTime.split(":").map(Number);
    const start = new Date(0, 0, 0, selHour, selMin);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + intervalMinutes);

    const endTimeStr = `${end.getHours().toString().padStart(2, "0")}:${end
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const appointmentData = {
      userId,
      doctorId: doctor?.doctorId,
      availabilityId: matchedSlot.availabilityId,
      appointmentDate: selectedDate,
      startTime: selectedTime,
      endTime: endTimeStr,
      totalAmount: fee.toString(),
    };

    try {
      await createAppointment(appointmentData).unwrap();
      toast.success("Appointment booked successfully!");
      onClose();
      navigate("/user-dashboard/appointments");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.error || "Failed to book appointment.");
    }
  };

  const availableDates = getAvailableDates();
  const availableTimeSlots = getAvailableTimeSlotsForDate();
  const availableDateObjects = availableDates.map((d) => new Date(d.value));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Doctor Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800">
              Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}
            </h3>
            <p className="text-blue-600 font-medium text-sm sm:text-base">
              {doctor?.specialization?.name || "General Practitioner"}
            </p>

            <div className="mt-3 space-y-2 text-sm text-gray-700">
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
            <p className="text-xl sm:text-2xl font-bold text-green-600">Ksh. {fee}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Date Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Date
          </label>
          <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={(date: Date | null) => {
              if (!date) {
                setSelectedDate("");
                setSelectedTime("");
                return;
              }
              const iso = format(date, "yyyy-MM-dd");
              setSelectedDate(iso);
              setSelectedTime("");
              updateFee(iso);
            }}
            includeDates={availableDateObjects}
            placeholderText="Choose an available date"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            dateFormat="EEE, MMM d, yyyy"
          />
        </div>

        {/* Time Picker */}
        {selectedDate && availableTimeSlots.length === 0 && (
          <div className="text-red-500 font-semibold">
            Doctor is fully booked for this day.
          </div>
        )}

        {availableTimeSlots.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Time Slot
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="">Choose a time slot</option>
              {availableTimeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Appointment Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Appointment Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Doctor:</strong> Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}</p>
              <p><strong>Date:</strong> {availableDates.find((d) => d.value === selectedDate)?.label}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Fee:</strong> Ksh. {fee}</p>
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
