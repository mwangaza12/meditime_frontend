import { useForm } from "react-hook-form";
import { FileText, Activity, AlertCircle } from "lucide-react";
import { TextInput } from "../../components/form/TextInput";
import toast from "react-hot-toast";
import { specializationApi } from "../../feature/api/specializationApi";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";

type SpecializationForm = {
  name: string;
  description: string;
  status: "active" | "inactive";
};

export const SpecializationModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<SpecializationForm>({
    mode: "onChange",
    defaultValues: { 
      status: "active" 
    },
  });

  const [createSpecialization] = specializationApi.useCreatespecializationMutation({});

  const onSubmit = async (data: SpecializationForm) => {
    const loadingToast = toast.loading("Creating specialization...");
    try {
      const res = await createSpecialization(data).unwrap();
      toast.success(res?.message || "Specialization created successfully!", { id: loadingToast });
      reset();
      onClose();
    } catch (err: any) {
      const message =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        err?.error ||
        "Failed to create specialization";
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">

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

      {/* Description TextArea */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-400">
            <AlertCircle size={16} />
          </div>
          <textarea
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
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      {/* Status Selection */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Activity size={16} />
          </div>
          <select
            {...register("status", { required: "Please select a status" })}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
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
        {isSubmitting ? "Creating..." : "Create Specialization"}
      </button>
    </form>
  );
};