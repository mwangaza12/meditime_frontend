import { useForm } from "react-hook-form";
import { User, Briefcase, Phone, Calendar } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import { Modal } from "../../components/modal/Modal";
import toast from "react-hot-toast";
import { doctorApi } from "../../feature/api/doctorApi";
import { useEffect } from "react";

type DoctorForm = {
  userId: number;
  specialization: string;
  contactPhone: string;
  availableDays: string;
};

interface DoctorModalProps {
  show: boolean;
  onClose: () => void;
  initialData?: DoctorForm & { id?: number } | null;  // added optional id
  isEdit?: boolean;
}

export const DoctorModal = ({ show, onClose, initialData = null, isEdit = false }: DoctorModalProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, reset } = useForm<DoctorForm>({
    mode: "onChange",
    defaultValues: {
      userId: initialData?.userId ?? undefined,
      specialization: initialData?.specialization ?? "",
      contactPhone: initialData?.contactPhone ?? "",
      availableDays: initialData?.availableDays ?? "",
    },
  });

  const [createDoctor] = doctorApi.useCreateDoctorMutation();
  const [updateDoctor] = doctorApi.useUpdateDoctorMutation();

  useEffect(() => {
    if (initialData) {
      reset({
        userId: initialData.userId ?? undefined,
        specialization: initialData.specialization ?? "",
        contactPhone: initialData.contactPhone ?? "",
        availableDays: initialData.availableDays ?? "",
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DoctorForm) => {
    const loadingToast = toast.loading(isEdit ? "Updating doctor..." : "Creating doctor...");

    try {
      let res;

      if (isEdit && initialData?.id) {
        // Update case: pass id + form data
        res = await updateDoctor({ id: initialData.id, ...data }).unwrap();
        toast.success(res?.message || "Doctor updated!", { id: loadingToast });
      } else {
        // Create case
        res = await createDoctor(data).unwrap();
        toast.success(res?.message || "Doctor created!", { id: loadingToast });
      }

      reset();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        err?.error ||
        "Something went wrong";
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <Modal
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title={isEdit ? "Edit Doctor" : "Create Doctor"}
      width="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <TextInput
          label="User ID"
          type="number"
          placeholder="Enter User ID"
          icon={<User size={16} />}
          name="userId"
          register={register("userId", {
            valueAsNumber: true,
            required: "User ID is required",
            min: { value: 1, message: "User ID must be positive" },
          })}
          error={errors.userId?.message}
        />

        <TextInput
          label="Specialization"
          type="text"
          placeholder="Enter Specialization"
          icon={<Briefcase size={16} />}
          name="specialization"
          register={register("specialization", {
            required: "Specialization is required",
          })}
          error={errors.specialization?.message}
        />

        <TextInput
          label="Contact Phone"
          type="text"
          placeholder="Enter Contact Phone"
          icon={<Phone size={16} />}
          name="contactPhone"
          register={register("contactPhone", {
            required: "Contact phone is required",
          })}
          error={errors.contactPhone?.message}
        />

        <TextInput
          label="Available Days"
          type="text"
          placeholder="e.g. Monday - Friday"
          icon={<Calendar size={16} />}
          name="availableDays"
          register={register("availableDays", {
            required: "Available days are required",
          })}
          error={errors.availableDays?.message}
        />

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full py-2 rounded-lg font-semibold text-white transition-all ${
            !isValid || isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow"
          }`}
        >
          {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Doctor" : "Create Doctor")}
        </button>

      </form>
    </Modal>
  );
};
