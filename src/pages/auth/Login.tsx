import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { TextInput } from "../../components/form/TextInput";
import { useForm } from "react-hook-form";
import { Footer } from "../../components/Footer";
import { BsFacebook } from "react-icons/bs";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

// Import your API slice and action correctly
import { userApi } from "../../feature/api/userApi";  // Adjust this path as needed
import { setCredentials } from "../../feature/auth/authSlice";  // Adjust this path as needed

type UserLoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginUser] = userApi.useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserLoginForm>({ mode: "onChange" });

  const onSubmit = async (data: UserLoginForm) => {
    const loadingToastId = toast.loading("Logging in...");
    try {
      const res = await loginUser(data).unwrap();

      dispatch(setCredentials(res));

      toast.success(res?.message || "Login successful", {
        id: loadingToastId,
      });

      const role = res?.role;
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.error || err?.data?.message || err?.message || err?.error || err.toString();

      toast.error(errorMessage || "Failed to login", {
        id: loadingToastId,
      });

    }
  };


  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center bg-blue-50 pt-8 pb-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-blue-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <TextInput
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<FaEnvelope />}
                  name="email"
                  register={register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  error={errors.email?.message}
                />

                {/* Password */}
                <div className="relative">
                  <TextInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    icon={<FaLock />}
                    name="password"
                    register={register("password", {
                      required: "Password is required",
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-[#093FB4] border-gray-300 rounded focus:ring-[#093FB4]"
                      {...register("rememberMe")}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-600"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#093FB4] hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
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
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Social Login Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285f4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34a853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#fbbc05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#ea4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <BsFacebook size={20} className="text-blue-700" />
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-[#093FB4] hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
                  >
                    Sign up here
                  </Link>
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
