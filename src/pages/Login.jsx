import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { loginApi } from "../api/authApi";
import toast from "react-hot-toast";

const ROLE_REDIRECT = {
  superadmin: "/admin/dashboard",
  receptionist: "/scheduler",
  doctor: "/doctor/dashboard",
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RHF replaces: useState for formData, loading, and field errors
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Only need this for API-level errors (wrong password etc)
  // Field validation errors come from RHF automatically
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // onSubmit only runs if RHF validation passes
  const onSubmit = async (data) => {
    setApiError("");
    try {
      const res = await loginApi(data);
      const { accessToken, user } = res.data.data;
      dispatch(setCredentials({ accessToken, user }));

      // Success toast
      toast.success(`Welcome back, ${user.name}!`);

      navigate(ROLE_REDIRECT[user.role] || "/login");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Try again.";
      setApiError(message);

      // Error toast
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-blue-600 rounded" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-blue-600 rounded" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">EMR System</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">⚠ {apiError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@hospital.com"
                // register connects this input to RHF + sets validation rules
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                })}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder:text-gray-400 transition
                  ${
                    errors.email
                      ? "border-red-400 bg-red-50" // red border if error
                      : "border-gray-300" // normal border
                  }`}
              />
              {/* RHF error message — only shows when validation fails */}
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm pr-16
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder:text-gray-400 transition
                    ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-400 text-white font-medium rounded-lg
                         text-sm transition focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:ring-offset-2
                         flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Dev credentials helper */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Test Credentials:
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Admin: admin@emr.com / Admin@1234</p>
                <p>Doctor: aisha@emr.com / Doctor@1234</p>
                <p>Receptionist: priya@emr.com / Recept@1234</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          EMR Appointment System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
