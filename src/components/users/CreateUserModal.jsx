import { useState } from "react";
import { useForm } from "react-hook-form";
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { createUserApi } from "../../api/userApi";

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createUserApi(data);
      toast.success(`${data.role === "doctor" ? "Doctor" : "Receptionist"} created successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center
                    justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            Add New Staff
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
                       hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Dr. John Smith"
              {...register("name", { required: "Name is required" })}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="john@hospital.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email",
                },
              })}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm pr-10
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.role ? "border-red-400" : "border-gray-300"}`}
            >
              <option value="">Select role</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Department
              <span className="text-gray-400 font-normal"> (optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cardiology"
              {...register("department")}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm
                         font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-400 text-white rounded-lg text-sm
                         font-medium flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent
                                  rounded-full animate-spin" />
                : <UserPlus size={15} />
              }
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;