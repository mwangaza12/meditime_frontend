import { useState } from "react";
import { useSelector } from "react-redux";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { User, Phone, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import type { RootState } from "../../app/store";

export const AppointmentModal = ({
  onClose,
  doctor,
}: {
  onClose: () => void;
  doctor: any;
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("");
  const [fee, setFee] = useState<number>(0);

  const [createAppointment, { isLoading }] =
    appointmentApi.useCreateAppointmentMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || user?.userId;

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

  const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes = 30) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let current = new Date(0, 0, 0, startHour, startMinute);
    const end = new Date(0, 0, 0, endHour, endMinute);

    while (current < end) {
      slots.push(
        `${current.getHours().toString().padStart(2, "0")}:${current
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  };

  const getAvailableTimeSlotsForDate = () => {
    if (!selectedDate || !doctor?.availability) return [];

    const selectedDay = getDayOfWeek(selectedDate);
    const dayAvailability = doctor.availability.filter(
      (slot: any) =>
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

  const updateFee = (date: string, _time: string) => {
    const selectedDay = getDayOfWeek(date);
    const matchedSlot = doctor?.availability?.find((slot: any) =>
      (slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()) === selectedDay
    );

    if (matchedSlot?.amount) {
      setFee(Number(matchedSlot.amount));
    } else {
      setFee(0);
    }
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
      const dayMatch =
        (slot.dayOfWeek?.toLowerCase() || slot.day?.toLowerCase()) === selectedDay;
      const startTime = slot.startTime || slot.start;
      const endTime = slot.endTime || slot.end;

      if (!dayMatch || !startTime || !endTime) return false;

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

    const appointmentData = {
      userId,
      doctorId: doctor?.doctorId,
      availabilityId: matchedSlot.availabilityId,
      appointmentDate: selectedDate,
      timeSlot: selectedTime,
      totalAmount: fee.toString(),
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
          <div>
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
            <p className="text-2xl font-bold text-green-600">${fee}</p>
          </div>
        </div>
      </div>

      {/* Appointment Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Date
          </label>
          <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={(date) => {
              const iso = date?.toISOString().split("T")[0] || "";
              setSelectedDate(iso);
              setSelectedTime("");
              if (iso) updateFee(iso, "");
            }}
            includeDates={availableDateObjects}
            placeholderText="Choose an available date"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            dateFormat="EEE, MMM d, yyyy"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Time Slot
          </label>
          <DatePicker
            selected={
              selectedTime && selectedDate
                ? new Date(`${selectedDate}T${selectedTime}`)
                : null
            }
            onChange={(date) => {
              const timeStr = date?.toTimeString().slice(0, 5) || "";
              setSelectedTime(timeStr);
              if (selectedDate && timeStr) updateFee(selectedDate, timeStr);
            }}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="Time"
            dateFormat="h:mm aa"
            includeTimes={availableTimeSlots.map((time) => {
              const [h, m] = time.split(":").map(Number);
              const d = new Date(selectedDate);
              d.setHours(h, m, 0, 0);
              return d;
            })}
            disabled={!selectedDate || availableTimeSlots.length === 0}
            placeholderText={!selectedDate ? "Select a date first" : "Choose a time slot"}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
        </div>

        {selectedDate && selectedTime && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Appointment Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Doctor:</strong> Dr. {doctor?.user?.firstName} {doctor?.user?.lastName}</p>
              <p><strong>Date:</strong> {availableDates.find(d => d.value === selectedDate)?.label}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Fee:</strong> ${fee}</p>
            </div>
          </div>
        )}

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
