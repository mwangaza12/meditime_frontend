import { useForm, useFieldArray } from "react-hook-form";
import { Clock, User, PlusCircle, Trash2 } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { doctorAvailabilityApi } from "../../feature/api/doctorAvailabilityApi";
import { useEffect } from "react";

type AvailabilitySlot = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

type DoctorAvailabilityForm = {
  doctorId: number;
  availabilities: AvailabilitySlot[];
};

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

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

  const watchedAvailabilities = watch("availabilities");

  useEffect(() => {
    watchedAvailabilities.forEach((availability, index) => {
      const { startTime, endTime } = availability;
      const duration = calculateDuration(startTime, endTime);
      setValue(`availabilities.${index}.slotDurationMinutes`, duration);
    });
  }, [watchedAvailabilities, setValue]);

  const onToggleDay = (day: string) => {
    const exists = watchedAvailabilities.some((a) => a.dayOfWeek === day);
    if (!exists) {
      append({
        dayOfWeek: day,
        startTime: "",
        endTime: "",
        slotDurationMinutes: 0,
      });
    } else {
      const indexesToRemove = fields
        .map((field, idx) => ({ day: field.dayOfWeek, idx }))
        .filter((entry) => entry.day === day)
        .map((entry) => entry.idx)
        .reverse(); // Remove from end to avoid index shifting
      indexesToRemove.forEach((i) => remove(i));
    }
  };

  const addSlotForDay = (day: string) => {
    append({
      dayOfWeek: day,
      startTime: "",
      endTime: "",
      slotDurationMinutes: 0,
    });
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff : 0;
  };

  const onSubmit = async (data: DoctorAvailabilityForm) => {
    if (!data.availabilities.length) {
      toast.error("Please select at least one day.");
      return;
    }

    const loadingToast = toast.loading("Saving availability...");
    try {
      for (const slot of data.availabilities) {
        const payload = {
          doctorId: data.doctorId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDurationMinutes: slot.slotDurationMinutes,
        };

        if (!payload.startTime || !payload.endTime || payload.slotDurationMinutes <= 0) {
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

  const selectedDays = [...new Set(watchedAvailabilities.map((a) => a.dayOfWeek))];

  return (
    <div className="max-h-[85vh] overflow-y-auto p-6 bg-white rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Set Doctor Availability</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <TextInput
          label="Doctor ID"
          type="number"
          placeholder="Doctor ID"
          icon={<User size={16} />}
          name="doctorId"
          register={register("doctorId", {
            valueAsNumber: true,
            required: "Doctor ID is required",
            min: { value: 1, message: "Doctor ID must be positive" },
          })}
          error={errors.doctorId?.message}
        />

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

        {fields.map((field, index) => {
          const currentAvailability = watchedAvailabilities[index];
          const duration = currentAvailability ? calculateDuration(
            currentAvailability.startTime,
            currentAvailability.endTime
          ) : 0;

          return (
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

              <TextInput
                label="Start Time"
                type="time"
                placeholder="Start Time"
                name={`availabilities.${index}.startTime`}
                icon={<Clock size={16} />}
                register={register(`availabilities.${index}.startTime`, { required: "Required" })}
                error={errors.availabilities?.[index]?.startTime?.message}
              />

              <TextInput
                label="End Time"
                type="time"
                placeholder="End Time"
                name={`availabilities.${index}.endTime`}
                icon={<Clock size={16} />}
                register={register(`availabilities.${index}.endTime`, { required: "Required" })}
                error={errors.availabilities?.[index]?.endTime?.message}
              />

              <div className="text-sm text-gray-700">
                Slot Duration:{" "}
                <span className="font-semibold">
                  {duration > 0 ? `${duration} minutes` : "Invalid time range"}
                </span>
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg font-semibold text-white ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Availability"}
        </button>
      </form>
    </div>
  );
};
