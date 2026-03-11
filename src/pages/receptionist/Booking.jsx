import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, UserPlus, Clock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { createAppointmentApi } from "../../api/appointmentApi";
import SlotSummaryCard from "../../components/booking/SlotSummaryCard";
import ExistingPatientForm from "../../components/booking/ExistingPatientForm";
import NewPatientForm from "../../components/booking/NewPatientForm";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { doctorId, doctor, slotDate, slotStart, slotEnd } =
    location.state || {};

  const [patientType, setPatientType] = useState("existing");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Guard — no slot state means direct URL access
  if (!doctorId || !slotDate || !slotStart) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <Clock size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No slot selected</p>
        <p className="text-sm text-gray-400 mt-1">
          Please select a slot from the scheduler first
        </p>
        <button
          onClick={() => navigate("/scheduler")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Go to Scheduler
        </button>
      </div>
    );
  }

  // Single book handler — receives payload from either child form
  const handleBook = async (patientPayload) => {
    setBookingLoading(true);
    try {
      await createAppointmentApi({
        doctorId,
        slotDate,
        slotStart,
        slotEnd,
        ...patientPayload,
      });
      toast.success("Appointment booked successfully!");
      navigate("/scheduler");
    } catch (err) {
      const message =
        err.response?.data?.message || "Booking failed. Try again.";
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/scheduler")}
        className="flex items-center gap-2 text-sm text-gray-500
                   hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Scheduler
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Confirm patient details and complete the booking
        </p>
      </div>

      {/* Slot summary */}
      <SlotSummaryCard
        doctor={doctor}
        slotDate={slotDate}
        slotStart={slotStart}
        slotEnd={slotEnd}
      />

      {/* Patient section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <p className="text-sm font-semibold text-gray-700">Patient Details</p>

        {/* Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setPatientType("existing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm
              font-medium transition-all
              ${
                patientType === "existing"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <Users size={15} />
            Existing Patient
          </button>
          <button
            type="button"
            onClick={() => setPatientType("new")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm
              font-medium transition-all
              ${
                patientType === "new"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <UserPlus size={15} />
            New Patient
          </button>
        </div>

        {/* Render correct form */}
        {patientType === "existing" ? (
          <ExistingPatientForm
            onBook={handleBook}
            bookingLoading={bookingLoading}
          />
        ) : (
          <NewPatientForm onBook={handleBook} bookingLoading={bookingLoading} />
        )}
      </div>
    </div>
  );
};

export default Booking;
