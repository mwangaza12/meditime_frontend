import { useForm } from "react-hook-form";
import { Briefcase, Text } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import { Modal } from "../../components/modal/Modal";
import toast from "react-hot-toast";
import { doctorApi } from "../../feature/api/doctorApi";
import { specializationApi } from "../../feature/api/specializationApi";
import { useEffect } from "react";
import { BsParagraph } from "react-icons/bs";

type DoctorForm = {
  userId: number;
  specializationId: number;
  bio: string;
  experienceYears: number;
};

interface DoctorModalProps {
  show: boolean;
  onClose: () => void;
  initialData?: (DoctorForm & { id?: number }) | null;
  isEdit?: boolean;
}

export const DoctorModal = ({
  show,
  onClose,
  initialData = null,
  isEdit = false,
}: DoctorModalProps) => {
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
      bio: initialData?.bio ?? "",
      experienceYears: initialData?.experienceYears ?? 0,
    },
  });

  const [createDoctor] = doctorApi.useCreateDoctorMutation();
  const [updateDoctor] = doctorApi.useUpdateDoctorMutation();
  const {
    data: specializationData,
    isLoading: specializationLoading,
  } = specializationApi.useGetAllspecializationsQuery({ page: 1, pageSize: 10 });

  const specializationList = specializationData?.specializations || [];

  useEffect(() => {
    if (initialData) {
      reset({
        userId: initialData.userId ?? undefined,
        specializationId: initialData.specializationId ?? undefined,
        bio: initialData.bio ?? "",
        experienceYears: initialData.experienceYears ?? 0,
      });
    } else {
      reset({
        userId: undefined,
        specializationId: undefined,
        bio: "",
        experienceYears: 0,
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DoctorForm) => {
    const loadingToast = toast.loading(
      isEdit ? "Updating doctor..." : "Creating doctor..."
    );
    try {
      let response;
      if (isEdit && initialData?.id) {
        response = await updateDoctor({ id: initialData.id, ...data }).unwrap();
        toast.success(response?.message || "Doctor updated!", { id: loadingToast });
      } else {
        response = await createDoctor(data).unwrap();
        toast.success(response?.message || "Doctor created!", { id: loadingToast });
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
              className="w-full bg-transparent outline-none"
            >
              <option value="" disabled>
                {specializationLoading
                  ? "Loading specializations..."
                  : "Select Specialization"}
              </option>
              {specializationList.map((item: any) => (
                <option key={item.specializationId} value={item.specializationId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {errors.specializationId && (
            <p className="text-red-500 text-sm">
              {errors.specializationId.message}
            </p>
          )}
        </div>

        {/* Bio (Textarea) */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">Bio</label>
          <div className="flex items-start border rounded-lg px-3 py-2">
            <Text size={16} className="mt-1 mr-2 text-gray-500" />
            <textarea
              {...register("bio", {
                required: "Bio is required",
                minLength: {
                  value: 10,
                  message: "Bio should be at least 10 characters",
                },
              })}
              placeholder="Enter doctor's bio"
              className="w-full bg-transparent outline-none resize-none h-24"
            />
          </div>
          {errors.bio && (
            <p className="text-red-500 text-sm">{errors.bio.message}</p>
          )}
        </div>

        {/* Experience Years */}
        <TextInput
          icon={<BsParagraph />}
          label="Years of Experience"
          type="number"
          placeholder="Enter years of experience"
          name="experienceYears"
          register={register("experienceYears", {
            valueAsNumber: true,
            required: "Experience is required",
            min: { value: 0, message: "Must be non-negative" },
          })}
          error={errors.experienceYears?.message}
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
