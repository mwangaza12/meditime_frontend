import { useForm } from "react-hook-form";
import { User, Briefcase, Phone } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import { Modal } from "../../components/modal/Modal";
import toast from "react-hot-toast";
import { doctorApi } from "../../feature/api/doctorApi";
import { specializationApi } from "../../feature/api/specializationApi";
import { useEffect } from "react";

type DoctorForm = {
  userId: number;
  specializationId: number;
  contactPhone: string;
};

interface DoctorModalProps {
  show: boolean;
  onClose: () => void;
  initialData?: DoctorForm & { id?: number } | null;
  isEdit?: boolean;
}

export const DoctorModal = ({ show, onClose, initialData = null, isEdit = false }: DoctorModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<DoctorForm>({
    mode: "onChange",
    defaultValues: {
      userId: initialData?.userId ?? undefined,
      specializationId: initialData?.specializationId ?? undefined,
      contactPhone: initialData?.contactPhone ?? "",
    },
  });

  const [createDoctor] = doctorApi.useCreateDoctorMutation();
  const [updateDoctor] = doctorApi.useUpdateDoctorMutation();
  const { data: specializationData, isLoading: specializationLoading } = specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 10 });

  console.log(specializationData);

  // ✅ Fix: Extract the correct array
  const specializationList = specializationData?.specializations || [];

  useEffect(() => {
    if (initialData) {
      reset({
        userId: initialData.userId ?? undefined,
        specializationId: initialData.specializationId ?? undefined,
        contactPhone: initialData.contactPhone ?? "",
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
        res = await updateDoctor({ id: initialData.id, ...data }).unwrap();
        toast.success(res?.message || "Doctor updated!", { id: loadingToast });
      } else {
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

        {/* User ID */}
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

        {/* Specialization */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">Specialization</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Briefcase size={16} className="mr-2 text-gray-500" />
            <select
              {...register("specializationId", {
                valueAsNumber: true,
                required: "Specialization is required",
              })}
              defaultValue={initialData?.specializationId ?? ""}
              className="w-full bg-transparent outline-none"
            >
              <option value="" disabled>
                {specializationLoading ? "Loading specializations..." : "Select Specialization"}
              </option>
              {specializationList.map((item: any) => (
                <option key={item.specializationId} value={item.specializationId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {errors.specializationId && (
            <p className="text-red-500 text-sm">{errors.specializationId.message}</p>
          )}
        </div>

        {/* Contact Phone */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full py-2 rounded-lg font-semibold text-white transition-all ${
            !isValid || isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow"
          }`}
        >
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Doctor"
            : "Create Doctor"}
        </button>

      </form>
    </Modal>
  );
};
