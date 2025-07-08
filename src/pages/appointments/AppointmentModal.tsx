import { useForm } from "react-hook-form";
import { Calendar, Clock, DollarSign, User } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import toast from "react-hot-toast";
import { appointmentApi } from "../../feature/api/appointmentApi";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { doctorApi } from "../../feature/api/doctorApi";

type AppointmentForm = {
  userId: number;
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  totalAmount: string;
};

export const AppointmentModal = ({ onClose }: { onClose: () => void }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    const {register,handleSubmit,formState: { errors, isSubmitting, isValid },reset,} = useForm<AppointmentForm>({
        mode: "onChange",
        defaultValues: { userId: user?.userId },
    });

    // ✅ Pass required pagination params to avoid "Invalid query parameters" error
    const { data: doctorsData, isLoading: doctorsLoading, error: doctorsError } = doctorApi.useGetAllDoctorsQuery({
        page: 1,
        pageSize: 100,
    });

    const doctors = doctorsData?.data || doctorsData || [];

    const [createAppointment] = appointmentApi.useCreateAppointmentMutation();

    const onSubmit = async (data: AppointmentForm) => {
        const loadingToast = toast.loading("Creating appointment...");
        try {
            const res = await createAppointment(data).unwrap();
            toast.success(res?.message || "Appointment created successfully!", { id: loadingToast });
            reset();
            onClose();
        } catch (err: any) {
            const message =
                err?.data?.error ||
                err?.data?.message ||
                err?.message ||
                err?.error ||
                "Failed to create appointment";
            toast.error(message, { id: loadingToast });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">

        <TextInput
            label="User ID"
            type="number"
            placeholder="User ID"
            icon={<User size={16} />}
            name="userId"
            register={register("userId", {
            valueAsNumber: true,
            required: "User ID is required",
            min: { value: 1, message: "User ID must be positive" },
            })}
            error={errors.userId?.message}
            value={user?.userId || ""}
        />

        {/* Doctor Selection */}
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <div className="relative">
            <select
                {...register("doctorId", { required: "Please select a doctor", valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            >
                <option value="">Select a doctor</option>
                {doctorsLoading && <option disabled>Loading doctors...</option>}
                {doctorsError && <option disabled>Failed to load doctors</option>}
                {doctors?.map((doctor: any) => (
                <option key={doctor.doctorId} value={doctor.doctorId}>
                    Dr. {doctor.user?.firstName} {doctor.user?.lastName} ({doctor.specialization || "N/A"})
                </option>
                ))}
            </select>
            </div>
            {errors.doctorId && <p className="text-red-500 text-sm">{errors.doctorId.message}</p>}
        </div>

        <TextInput
            label="Appointment Date"
            type="date"
            placeholder="Select Date"
            icon={<Calendar size={16} />}
            name="appointmentDate"
            register={register("appointmentDate", {
            required: "Date is required",
            })}
            error={errors.appointmentDate?.message}
        />

        <TextInput
            label="Time Slot"
            type="time"
            placeholder="Select Time"
            icon={<Clock size={16} />}
            name="timeSlot"
            register={register("timeSlot", {
            required: "Time slot is required",
            })}
            error={errors.timeSlot?.message}
        />

        <TextInput
            label="Total Amount"
            type="number"
            placeholder="Enter total amount"
            icon={<DollarSign size={16} />}
            name="totalAmount"
            register={register("totalAmount", {
            required: "Total amount is required",
            min: { value: 0, message: "Total amount must be positive" },
            })}
            error={errors.totalAmount?.message}
        />

        <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-2 rounded-lg font-semibold text-white transition-all ${
            !isValid || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow"
            }`}
        >
            {isSubmitting ? "Creating..." : "Create Appointment"}
        </button>
        </form>
    );
};
