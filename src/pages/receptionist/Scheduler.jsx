import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Search, Calendar, User, Clock, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getDoctorsApi } from "../../api/userApi";
import { getSlotsApi }   from "../../api/slotApi";
import useFetch          from "../../hooks/useFetch";
import { getNextNDays, formatDate, formatTime, getDayName } from "../../utils/dateUtils";

// ── Slot status styles ─────────────────────────────────────────────────────────
const SLOT_STYLES = {
  available: "bg-white border-green-200 hover:border-green-400 hover:bg-green-50 cursor-pointer",
  booked:    "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60",
  past:      "bg-gray-50 border-gray-100 cursor-not-allowed opacity-40",
};

const SLOT_LABEL_STYLES = {
  available: "text-green-600",
  booked:    "text-gray-400",
  past:      "text-gray-300",
};

// ── Component ──────────────────────────────────────────────────────────────────
const Scheduler = () => {
  const navigate = useNavigate();

  // Slots state — managed manually (not useFetch) because
  // we only fetch on button click, not on mount
  const [slots, setSlots]         = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [searched, setSearched]   = useState(false); // has user searched yet?
  const [selectedDoctor, setSelectedDoctor] = useState(null); // full doctor object

  // Fetch doctors on mount — needed for dropdown
  const { data: doctorsData, loading: doctorsLoading } = useFetch(getDoctorsApi);
  const doctors = doctorsData?.doctors || [];

  // Next 14 days for date picker
  const next14Days = getNextNDays(14);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  // Watch doctorId to show doctor's department info
  const watchedDoctorId = watch("doctorId");

  // ── Handle search ────────────────────────────────────────────────────────────
  const onSearch = async (data) => {
    setSlotsLoading(true);
    setSearched(true);
    setSlots([]);

    try {
      const res = await getSlotsApi({
        doctorId: data.doctorId,
        date:     data.date,
      });

      const fetchedSlots = res.data.data?.slots || [];
      setSlots(fetchedSlots);

      // Find selected doctor object for display
      const doctor = doctors.find((d) => d._id === data.doctorId);
      setSelectedDoctor(doctor);

      if (fetchedSlots.length === 0) {
        toast("No slots found for this day", { icon: "📅" });
      }

    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch slots";
      toast.error(message);
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Handle slot click ────────────────────────────────────────────────────────
  const handleSlotClick = (slot, formValues) => {
    if (slot.status !== "available") return;

    // Pass slot details to booking page via navigation state
    // This avoids URL params for complex objects
    navigate("/booking", {
      state: {
        doctorId:  formValues.doctorId,
        doctor:    selectedDoctor,
        slotDate:  formValues.date,
        slotStart: slot.start,
        slotEnd:   slot.end,
      },
    });
  };

  // We need form values in slot click handler
  // useWatch or just pass from handleSubmit
  // Simplest: store last searched values
  const [lastSearch, setLastSearch] = useState(null);

  const onSearchWithStore = async (data) => {
    setLastSearch(data);
    await onSearch(data);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Appointment Scheduler</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select a doctor and date to view available slots
        </p>
      </div>

      {/* ── Search form ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form
          onSubmit={handleSubmit(onSearchWithStore)}
          className="flex flex-col sm:flex-row gap-4 items-end"
        >

          {/* Doctor dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                Doctor
              </span>
            </label>
            <select
              {...register("doctorId", { required: "Please select a doctor" })}
              disabled={doctorsLoading}
              className={`
                w-full px-3 py-2.5 border rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:bg-gray-50 disabled:text-gray-400
                ${errors.doctorId ? "border-red-400" : "border-gray-300"}
              `}
            >
              <option value="">
                {doctorsLoading ? "Loading doctors..." : "Select a doctor"}
              </option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name}
                  {doc.department ? ` — ${doc.department}` : ""}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="mt-1 text-xs text-red-500">{errors.doctorId.message}</p>
            )}
          </div>

          {/* Date picker */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Date
              </span>
            </label>
            <select
              {...register("date", { required: "Please select a date" })}
              className={`
                w-full px-3 py-2.5 border rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.date ? "border-red-400" : "border-gray-300"}
              `}
            >
              <option value="">Select a date</option>
              {next14Days.map((dateStr) => (
                <option key={dateStr} value={dateStr}>
                  {formatDate(dateStr)}
                  {dateStr === next14Days[0] ? " (Today)" : ""}
                </option>
              ))}
            </select>
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            disabled={slotsLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600
                       hover:bg-blue-700 disabled:bg-blue-400 text-white
                       font-medium rounded-lg text-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:ring-offset-2 whitespace-nowrap"
          >
            {slotsLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent
                              rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {slotsLoading ? "Searching..." : "Search Slots"}
          </button>

        </form>
      </div>

      {/* ── Slot grid ────────────────────────────────────────────────────────── */}
      {searched && (
        <div className="bg-white rounded-xl border border-gray-200">

          {/* Grid header */}
          {selectedDoctor && lastSearch && (
            <div className="px-6 py-4 border-b border-gray-100 flex items-center
                            justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedDoctor.name}
                  {selectedDoctor.department && (
                    <span className="text-gray-400 font-normal">
                      {" "}· {selectedDoctor.department}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(lastSearch.date)} · {getDayName(lastSearch.date)}
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border-2 border-green-400
                                   bg-green-50 inline-block" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border-2 border-gray-300
                                   bg-gray-100 inline-block" />
                  Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border-2 border-gray-200
                                   bg-gray-50 inline-block opacity-50" />
                  Past
                </span>
              </div>
            </div>
          )}

          {/* Loading */}
          {slotsLoading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent
                              rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Fetching available slots...</p>
            </div>
          )}

          {/* No slots */}
          {!slotsLoading && slots.length === 0 && (
            <div className="text-center py-20">
              <Clock size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No slots available
              </p>
              <p className="text-xs text-gray-400 mt-1">
                The doctor may not work on this day or all slots are booked
              </p>
            </div>
          )}

          {/* Slot grid */}
          {!slotsLoading && slots.length > 0 && (
            <div className="p-6">
              {/* Available count */}
              <p className="text-xs text-gray-500 mb-4">
                <span className="font-semibold text-green-600">
                  {slots.filter((s) => s.status === "available").length}
                </span>
                {" "}of {slots.length} slots available
              </p>

              {/* Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    disabled={slot.status !== "available"}
                    onClick={() => handleSlotClick(slot, lastSearch)}
                    className={`
                      relative border rounded-lg p-3 text-left transition-all
                      ${SLOT_STYLES[slot.status]}
                    `}
                  >
                    {/* Time */}
                    <p className={`text-sm font-semibold ${
                      slot.status === "available" ? "text-gray-800" : "text-gray-400"
                    }`}>
                      {formatTime(slot.start)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(slot.end)}
                    </p>

                    {/* Status label */}
                    <p className={`text-xs mt-1.5 font-medium capitalize
                                   ${SLOT_LABEL_STYLES[slot.status]}`}>
                      {slot.status === "available" ? (
                        <span className="flex items-center gap-0.5">
                          Book <ChevronRight size={10} />
                        </span>
                      ) : slot.status}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Initial state — before first search */}
      {!searched && (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Select a doctor and date then click Search</p>
        </div>
      )}

    </div>
  );
};

export default Scheduler;