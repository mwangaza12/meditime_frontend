import { useForm } from "react-hook-form";
import { FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../../components/form/TextInput";
import Navbar from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { userApi } from "../../feature/api/userApi"; // Adjust path

type ForgotPasswordForm = {
  email: string;
};

export const ForgotPassword = () => {
  const navigate = useNavigate();

  const [forgotPassword] = userApi.useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordForm>({ mode: "onChange" });

  const onSubmit = async (data: ForgotPasswordForm) => {
    const toastId = toast.loading("Sending reset link...");
    try {
      const res = await forgotPassword(data).unwrap();

      toast.success(res?.message || "Reset link sent!", { id: toastId });
    } catch (err: any) {
      const errorMessage =
        err?.data?.error || err?.data?.message || "Something went wrong.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center pt-12 pb-20 px-4">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-blue-800 mb-2">
                  Forgot Password
                </h2>
                <p className="text-gray-600">
                  Enter your email and we’ll send you a link to reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<FaEnvelope />}
                  name="email"
                  register={register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  error={errors.email?.message}
                />

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-200 ${
                    !isValid || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#093FB4] hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-[#093FB4] hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Back to Login
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
