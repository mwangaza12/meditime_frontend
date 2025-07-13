import { useForm } from "react-hook-form";
import { TextInput } from "../../components/form/TextInput";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { complaintApi } from "../../feature/api/complaintApi";
import toast from "react-hot-toast";
import { User, MessageSquare, FileText } from "lucide-react";

type ComplaintForm = {
  userId: number;
  relatedAppointmentId: number;
  subject: string;
  description: string;
};

interface ComplaintModalProps {
  appointmentId: string;
  onClose: () => void;
}

export const ComplaintModal = ({ appointmentId, onClose }: ComplaintModalProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<ComplaintForm>({
    mode: "onChange",
    defaultValues: {
      userId: user?.userId || 0,
      relatedAppointmentId: Number(appointmentId),
    },
  });

  const [createComplaint] = complaintApi.useCreateComplaintMutation();

  const onSubmit = async (data: ComplaintForm) => {
    const loadingToast = toast.loading("Submitting complaint...");
    try {
      const res = await createComplaint(data).unwrap();
      toast.success(res?.message || "Complaint submitted successfully", { id: loadingToast });
      reset();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        "Failed to submit complaint";
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

      {/* Removed the appointment ID input — it's now passed and set internally */}

      <TextInput
        label="Subject"
        type="text"
        placeholder="Complaint Subject"
        icon={<FileText size={16} />}
        name="subject"
        register={register("subject", {
          required: "Subject is required",
          minLength: { value: 3, message: "Subject must be at least 3 characters" },
        })}
        error={errors.subject?.message}
      />

      <TextInput
        label="Description"
        type="text"
        placeholder="Describe your complaint"
        icon={<MessageSquare size={16} />}
        name="description"
        register={register("description", {
          required: "Description is required",
          minLength: { value: 5, message: "Must be at least 5 characters" },
        })}
        error={errors.description?.message}
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
        {isSubmitting ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
};
