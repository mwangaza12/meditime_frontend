import { useForm } from "react-hook-form";
import { FileText, AlertCircle } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import toast from "react-hot-toast";
import { specializationApi } from "../../feature/api/specializationApi";

type SpecializationForm = {
  name: string;
  description: string;
};

type Props = {
  onClose: () => void;
  specialization?: {
    id: string;
    name: string;
    description: string;
    status?: "active" | "inactive";
  } | null;
};

export const SpecializationModal = ({ onClose, specialization }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<SpecializationForm>({
    mode: "onChange",
    defaultValues: {
      name: specialization?.name || "",
      description: specialization?.description || "",
    },
  });

  const [createSpecialization] = specializationApi.useCreatespecializationMutation();
  const [updateSpecialization] = specializationApi.useUpdateSpecializationMutation();

  const isEditing = Boolean(specialization?.id);

  const onSubmit = async (data: SpecializationForm) => {
    const loadingToast = toast.loading(`${isEditing ? "Updating" : "Creating"} specialization...`);

    try {
      let res;
      if (isEditing) {
        res = await updateSpecialization({
          id: specialization!.id,
          ...data,
        }).unwrap();
      } else {
        res = await createSpecialization(data).unwrap();
      }

      toast.success(res?.message || `Specialization ${isEditing ? "updated" : "created"} successfully!`, {
        id: loadingToast,
      });
      reset();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        err?.error ||
        `Failed to ${isEditing ? "update" : "create"} specialization`;
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-4">
      {/* Name */}
      <TextInput
        label="Specialization Name"
        type="text"
        placeholder="Enter specialization name"
        icon={<FileText size={16} />}
        name="name"
        register={register("name", {
          required: "Specialization name is required",
          minLength: { value: 2, message: "Name must be at least 2 characters" },
          maxLength: { value: 100, message: "Name must not exceed 100 characters" },
        })}
        error={errors.name?.message}
      />

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-400">
            <AlertCircle size={16} />
          </div>
          <textarea
            id="description"
            {...register("description", {
              required: "Description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" },
              maxLength: { value: 500, message: "Description must not exceed 500 characters" },
            })}
            placeholder="Enter specialization description"
            rows={4}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-blue-500 resize-none"
          />
        </div>
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

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
          ? isEditing
            ? "Updating..."
            : "Creating..."
          : isEditing
          ? "Update Specialization"
          : "Create Specialization"}
      </button>
    </form>
  );
};
