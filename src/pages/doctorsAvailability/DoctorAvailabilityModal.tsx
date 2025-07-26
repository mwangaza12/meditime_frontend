import { useForm, useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { doctorAvailabilityApi } from "../../feature/api/doctorAvailabilityApi";
import { useEffect } from "react";
import { doctorApi } from "../../feature/api/doctorApi";

type AvailabilitySlot = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  amount: number;
};

type DoctorAvailabilityForm = {
  doctorId: number;
  availabilities: AvailabilitySlot[];
};

const daysOfWeek = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

const generateTimeSlots = (
  startTime: string,
  endTime: string,
  intervalMinutes = 30
) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let current = new Date(0, 0, 0, startHour, startMinute);
  const end = new Date(0, 0, 0, endHour, endMinute);

  while (current <= end) {
    const hours = current.getHours().toString().padStart(2, "0");
    const minutes = current.getMinutes().toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
};

export const DoctorAvailabilityModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DoctorAvailabilityForm>({
    defaultValues: {
      doctorId: user?.doctor?.doctorId ?? 0,
      availabilities: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "availabilities",
  });

  const [createAvailability] = doctorAvailabilityApi.useCreateDoctorAvailabilityMutation();
  const { data: doctorResponse, isLoading: isLoadingDoctors } = doctorApi.useGetAllDoctorsQuery({ page: 1, pageSize: 100 });

  const watchedAvailabilities = watch("availabilities");

  useEffect(() => {
    watchedAvailabilities.forEach((_, index) => {
      setValue(`availabilities.${index}.slotDurationMinutes`, 60);
    });
  }, [watchedAvailabilities, setValue]);

  const onToggleDay = (day: string) => {
    const exists = watchedAvailabilities.some((a) => a.dayOfWeek === day);
    if (!exists) {
      append({
        dayOfWeek: day,
        startTime: "",
        endTime: "",
        slotDurationMinutes: 60,
        amount: 0,
      });
    } else {
      const indexesToRemove = fields
        .map((field, idx) => ({ day: field.dayOfWeek, idx }))
        .filter((entry) => entry.day === day)
        .map((entry) => entry.idx)
        .reverse();
      indexesToRemove.forEach((i) => remove(i));
    }
  };

  const addSlotForDay = (day: string) => {
    append({
      dayOfWeek: day,
      startTime: "",
      endTime: "",
      slotDurationMinutes: 60,
      amount: 0,
    });
  };

  const onSubmit = async (data: DoctorAvailabilityForm) => {
    if (!data.availabilities.length) {
      toast.error("Please select at least one day.");
      return;
    }

    const fixedAvailabilities = data.availabilities.map((slot) => ({
      ...slot,
      slotDurationMinutes: 60,
    }));

    const loadingToast = toast.loading("Saving availability...");
    try {
      for (const slot of fixedAvailabilities) {
        const payload = {
          doctorId: data.doctorId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDurationMinutes: 60,
          amount: slot.amount,
        };

        if (!payload.startTime || !payload.endTime) {
          throw new Error(`Invalid time for ${slot.dayOfWeek}`);
        }

        await createAvailability(payload).unwrap();
      }

      toast.success("Availability created successfully!", { id: loadingToast });
      reset();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        "Failed to create availability";
      toast.error(message, { id: loadingToast });
    }
  };

  const timeOptions = generateTimeSlots("06:00", "18:00");
  const selectedDays = [...new Set(watchedAvailabilities.map((a) => a.dayOfWeek))];

  return (
    <div className="max-h-[85vh] overflow-y-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Set Doctor Availability</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Select Doctor</label>

          {isLoadingDoctors ? (
            <p className="text-sm text-gray-500">Loading doctors...</p>
          ) : (
            <select
              className="w-full mt-1 border px-3 py-2 rounded"
              {...register("doctorId", {
                valueAsNumber: true,
                required: "Doctor is required",
                min: { value: 1, message: "Please select a doctor" },
              })}
            >
              <option value="">-- Select a doctor --</option>
              {doctorResponse?.doctors?.map((doc: any) => (
                <option key={doc.doctorId} value={doc.doctorId}>
                  {doc.user?.firstName} {doc.user?.lastName}
                </option>
              ))}
            </select>
          )}

          {errors.doctorId && (
            <p className="text-sm text-red-500 mt-1">{errors.doctorId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {daysOfWeek.map((day) => (
            <label key={day} className="flex items-center gap-2 text-sm capitalize">
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => onToggleDay(day)}
              />
              {day}
              {selectedDays.includes(day) && (
                <button
                  type="button"
                  onClick={() => addSlotForDay(day)}
                  className="ml-auto text-blue-500 hover:text-blue-700"
                  title="Add Time Slot"
                >
                  <PlusCircle size={16} />
                </button>
              )}
            </label>
          ))}
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-3 mt-4 bg-gray-50 space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold capitalize">{field.dayOfWeek}</p>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <select
                {...register(`availabilities.${index}.startTime`, { required: "Required" })}
                className="w-full mt-1 border px-3 py-2 rounded"
              >
                <option value="">Select time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.availabilities?.[index]?.startTime && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.availabilities[index].startTime?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <select
                {...register(`availabilities.${index}.endTime`, { required: "Required" })}
                className="w-full mt-1 border px-3 py-2 rounded"
              >
                <option value="">Select time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.availabilities?.[index]?.endTime && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.availabilities[index].endTime?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (kes)</label>
              <input
                type="number"
                {...register(`availabilities.${index}.amount`, {
                  required: "Amount is required",
                  min: { value: 0, message: "Amount must be non-negative" },
                  valueAsNumber: true,
                })}
                className="w-full mt-1 border px-3 py-2 rounded"
              />
              {errors.availabilities?.[index]?.amount && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.availabilities[index].amount?.message}
                </p>
              )}
            </div>

            <div className="text-sm text-gray-700">
              Slot Duration: <span className="font-semibold">60 minutes</span>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg font-semibold text-white ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Availability"}
        </button>
      </form>
    </div>
  );
};
