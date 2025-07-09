import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { prescriptionApi } from "../../feature/api/prescriptionApi";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { TextInput } from "../../components/form/TextInput";
import { User } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";

type PrescriptionForm = {
  appointmentId: number;
  doctorId: number;
  patientId: number;
  notes: string;
};

export const PrescriptionModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: appointmentsData } = appointmentApi.useGetAppointmentsByDoctorIdQuery({
    doctorId: user?.userId,
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
    setValue,
  } = useForm<PrescriptionForm>({
    mode: "onChange",
    defaultValues: {
      doctorId: user?.userId,
      patientId: undefined,
      notes: "",
    },
  });

  const selectedAppointmentId = watch("appointmentId");

  useEffect(() => {
    const selectedAppointment = appointments.find(
      (appt: any) => appt.appointmentId === selectedAppointmentId
    );

    if (selectedAppointment?.userId) {
      setValue("patientId", selectedAppointment.userId);
    }
  }, [selectedAppointmentId, appointments, setValue]);

  const [createPrescription] = prescriptionApi.useCreatePrescriptionMutation();

  const onSubmit = async (data: PrescriptionForm) => {
    const loadingToast = toast.loading("Creating prescription...");
    try {
      const res = await createPrescription(data).unwrap();
      toast.success(res?.message || "Prescription created successfully!", { id: loadingToast });
      reset();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        err?.error ||
        "Failed to create prescription";
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Appointment</label>
        <select
          {...register("appointmentId", { required: "Appointment is required", valueAsNumber: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
        >
          <option value="">Select appointment</option>
          {appointments.map((appt: any) => (
            <option key={appt.appointmentId} value={appt.appointmentId}>
              {appt.appointmentDate} - {appt.user?.firstName} {appt.user?.lastName}
            </option>
          ))}
        </select>
        {errors.appointmentId && <p className="text-red-500 text-sm">{errors.appointmentId.message}</p>}
      </div>

      <TextInput
        label="Doctor ID"
        type="number"
        placeholder="Doctor ID"
        icon={<User size={16} />}
        name="doctorId"
        register={register("doctorId", {
          valueAsNumber: true,
          required: "Doctor ID is required",
          min: { value: 1, message: "Invalid ID" },
        })}
        error={errors.doctorId?.message}
        value={user?.userId || ""}
      />

      <TextInput
        label="Patient ID"
        type="number"
        placeholder="Patient ID"
        icon={<User size={16} />}
        name="patientId"
        register={register("patientId", {
          valueAsNumber: true,
          required: "Patient ID is required",
          min: { value: 1, message: "Invalid ID" },
        })}
        error={errors.patientId?.message}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          {...register("notes", { required: "Notes are required" })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          placeholder="Write prescription notes here..."
          rows={4}
        />
        {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`w-full py-2 rounded-lg font-semibold text-white transition-all ${
          !isValid || isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow"
        }`}
      >
        {isSubmitting ? "Creating..." : "Create Prescription"}
      </button>
    </form>
  );
};
