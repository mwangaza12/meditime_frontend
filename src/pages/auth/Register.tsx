import { FaUserAlt, FaEnvelope, FaLock, FaPhoneAlt, FaHome, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { TextInput } from "../../components/form/TextInput";
import { useForm } from "react-hook-form";
import { Footer } from "../../components/Footer";
import { BsFacebook } from "react-icons/bs";
import toast from "react-hot-toast";
import { userApi } from "../../feature/api/userApi";

type UserRegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contactPhone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isValid, isSubmitting } } = useForm<UserRegisterForm>({
    mode: "onChange",
  });

  const [registerUser] = userApi.useRegisterUserMutation();
  const passwordValue = watch("password");

  const onSubmit = async (data: UserRegisterForm) => {
    const loadingToastId = toast.loading("Creating Account...");
    try {
      const res = await registerUser(data).unwrap();
      toast.success(res?.message, { id: loadingToastId });
      navigate("/email-verification", {
        state: { email: data.email, message: res?.message || "Please verify your email to complete registration." }
      });
    } catch (err: any) {
      console.error("Registration failed:", err);
      toast.error("Failed to register: " + (err.data?.message || "Unknown error"), { id: loadingToastId });
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  const handleFacebookSignup = () => {
    console.log("Facebook signup clicked");
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center pt-8 pb-12 px-4 bg-gray-100 min-h-screen">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#093FB4] mb-2">Create Account</h2>
                <p className="text-gray-600">Join us today and get started</p>
              </div>

              {/* Social Sign Up */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="ml-2">Sign up with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookSignup}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <BsFacebook size={20} className="text-blue-700" />
                    <span className="ml-2">Sign up with Facebook</span>
                  </button>
                </div>

                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="First Name"
                    type="text"
                    placeholder="John"
                    icon={<FaUserAlt />}
                    name="firstName"
                    register={register("firstName", { required: "First name is required", minLength: { value: 2, message: "Min 2 characters" } })}
                    error={errors.firstName?.message}
                  />
                  <TextInput
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    icon={<FaUserAlt />}
                    name="lastName"
                    register={register("lastName", { required: "Last name is required", minLength: { value: 2, message: "Min 2 characters" } })}
                    error={errors.lastName?.message}
                  />
                </div>

                {/* Email */}
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<FaEnvelope />}
                  name="email"
                  register={register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                  })}
                  error={errors.email?.message}
                />

                {/* Address */}
                <TextInput
                  label="Address"
                  type="text"
                  placeholder="123 Main Street, City"
                  icon={<FaHome />}
                  name="address"
                  register={register("address", { required: "Address is required", minLength: { value: 10, message: "Min 10 characters" } })}
                  error={errors.address?.message}
                />

                {/* Phone */}
                <TextInput
                  label="Phone Number"
                  type="tel"
                  placeholder="0700000000"
                  icon={<FaPhoneAlt />}
                  name="contactPhone"
                  register={register("contactPhone", {
                    required: "Phone number is required",
                    pattern: { value: /^(\+254|0)[1 | 7]\d{8}$/, message: "Invalid Kenyan phone number" }
                  })}
                  error={errors.contactPhone?.message}
                />

                {/* Password */}
                <div className="relative">
                  <TextInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    icon={<FaLock />}
                    name="password"
                    register={register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Min 8 characters" },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: "Must include upper, lower, number, special" }
                    })}
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <TextInput
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    icon={<FaLock />}
                    name="confirmPassword"
                    register={register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: value => value === passwordValue || "Passwords do not match"
                    })}
                    error={errors.confirmPassword?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 text-[#093FB4] border-gray-300 rounded focus:ring-[#093FB4]"
                    {...register("termsAccepted", { required: "You must accept the terms" })}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link to="/terms" className="text-[#093FB4] hover:underline">Terms</Link> and{" "}
                    <Link to="/privacy" className="text-[#093FB4] hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted.message}</p>}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-white ${
                    !isValid || isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#093FB4] hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#093FB4] hover:underline font-semibold">Sign in here</Link>
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
