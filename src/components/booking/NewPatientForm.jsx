import { useForm } from "react-hook-form";
import { User, Phone, Calendar, CheckCircle } from "lucide-react";

const NewPatientForm = ({ onBook, bookingLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (formData) => {
    onBook({
      patientType: "new",
      patientData: {
        name: formData.name,
        mobile: formData.mobile || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
      },
      purpose: formData.purpose || "",
      notes: formData.notes || "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <User size={13} />
            Full Name <span className="text-red-500">*</span>
          </span>
        </label>
        <input
          type="text"
          placeholder="Patient's full name"
          {...register("name", { required: "Name is required" })}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Mobile + Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Phone size={13} />
              Mobile
              <span className="text-gray-400 font-normal">(optional)</span>
            </span>
          </label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            {...register("mobile", {
              pattern: {
                value: /^[0-9]{10,15}$/,
                message: "Enter a valid mobile number",
              },
            })}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.mobile ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          />
          {errors.mobile && (
            <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gender
            <span className="text-gray-400 font-normal"> (optional)</span>
          </label>
          <select
            {...register("gender")}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                       text-sm bg-white focus:outline-none focus:ring-2
                       focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* DOB */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            Date of Birth
            <span className="text-gray-400 font-normal"> (optional)</span>
          </span>
        </label>
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          {...register("dob")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Purpose of Visit
          <span className="text-gray-400 font-normal"> (optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Routine checkup, Follow up..."
          {...register("purpose")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={bookingLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                   text-white font-medium rounded-lg text-sm transition-colors
                   flex items-center justify-center gap-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:ring-offset-2"
      >
        {bookingLoading ? (
          <>
            <div
              className="w-4 h-4 border-2 border-white border-t-transparent
                            rounded-full animate-spin"
            />
            Registering & Booking...
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            Register Patient & Book
          </>
        )}
      </button>
    </form>
  );
};

export default NewPatientForm;
