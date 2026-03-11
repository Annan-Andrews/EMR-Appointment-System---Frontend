import { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Plus, Trash2, RefreshCw, Check } from "lucide-react";
import toast from "react-hot-toast";
import useFetch from "../../hooks/useFetch";
import {
  getDoctorScheduleApi,
  upsertScheduleApi,
  deleteScheduleApi,
} from "../../api/slotApi";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

// ── Add/Edit day form ──────────────────────────────────────────────────────────
const DayForm = ({ doctorId, day, existing, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [breaks, setBreaks] = useState(existing?.breaks || []);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      startTime: existing?.startTime || "09:00",
      endTime: existing?.endTime || "17:00",
      slotDuration: existing?.slotDuration || 15,
    },
  });

  const addBreak = () => {
    setBreaks((prev) => [
      ...prev,
      { start: "13:00", end: "14:00", label: "Break" },
    ]);
  };

  const removeBreak = (index) => {
    setBreaks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBreak = (index, field, value) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await upsertScheduleApi({
        doctorId,
        dayOfWeek: day,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: Number(data.slotDuration),
        breaks,
      });
      toast.success(`${DAY_LABELS[day]} schedule saved`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
    >
      {/* Time + duration row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Start Time
          </label>
          <input
            type="time"
            {...register("startTime", { required: true })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            End Time
          </label>
          <input
            type="time"
            {...register("endTime", { required: true })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slot (mins)
          </label>
          <select
            {...register("slotDuration", { required: true })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg
                       text-sm bg-white focus:outline-none focus:ring-2
                       focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
            <option value={60}>60</option>
          </select>
        </div>
      </div>

      {/* Breaks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-600">Breaks</p>
          <button
            type="button"
            onClick={addBreak}
            className="flex items-center gap-1 text-xs text-blue-600
                       hover:text-blue-700"
          >
            <Plus size={12} /> Add Break
          </button>
        </div>

        {breaks.length === 0 && (
          <p className="text-xs text-gray-400 italic">No breaks added</p>
        )}

        <div className="space-y-2">
          {breaks.map((brk, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                value={brk.start}
                onChange={(e) => updateBreak(index, "start", e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="time"
                value={brk.end}
                onChange={(e) => updateBreak(index, "end", e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={brk.label}
                onChange={(e) => updateBreak(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeBreak(index)}
                className="text-red-400 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 border border-gray-300 rounded-lg text-xs
                     font-medium text-gray-600 hover:bg-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                     text-white rounded-lg text-xs font-medium flex items-center
                     justify-center gap-1 transition-colors"
        >
          {loading ? (
            <div
              className="w-3 h-3 border-2 border-white border-t-transparent
                              rounded-full animate-spin"
            />
          ) : (
            <Check size={13} />
          )}
          Save
        </button>
      </div>
    </form>
  );
};

// ── Day row ────────────────────────────────────────────────────────────────────
const DayRow = ({ day, schedule, doctorId, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasSchedule = !!schedule;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteScheduleApi(schedule._id);
      toast.success(`${DAY_LABELS[day]} schedule removed`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove schedule");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center gap-3 py-2">
        {/* Day label */}
        <div className="w-10 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            {DAY_LABELS[day]}
          </span>
        </div>

        {/* Schedule info */}
        <div className="flex-1 min-w-0">
          {hasSchedule ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-800">
                {schedule.startTime} — {schedule.endTime}
              </span>
              <span className="text-xs text-gray-400">
                {schedule.slotDuration} min slots
              </span>
              {schedule.breaks?.length > 0 && (
                <span className="text-xs text-orange-500">
                  {schedule.breaks.length} break
                  {schedule.breaks.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Not scheduled</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowForm((p) => !p)}
            className="text-xs px-2.5 py-1 border border-blue-200 text-blue-600
                       hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            {hasSchedule ? "Edit" : "+ Add"}
          </button>

          {hasSchedule && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="p-1.5 border border-red-200 text-red-400 hover:text-red-600
                         hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleteLoading ? (
                <div
                  className="w-3 h-3 border-2 border-red-400 border-t-transparent
                                  rounded-full animate-spin"
                />
              ) : (
                <Trash2 size={13} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <DayForm
          doctorId={doctorId}
          day={day}
          existing={schedule}
          onSuccess={() => {
            setShowForm(false);
            onRefresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

// ── Main modal ─────────────────────────────────────────────────────────────────
const DoctorScheduleModal = ({ doctor, onClose }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Wrap getDoctorScheduleApi so useFetch can pass params as object
  // getDoctorScheduleApi expects a plain id string, not an object
  const fetchSchedule = (params) => getDoctorScheduleApi(params.id);

  const { data, loading } = useFetch(fetchSchedule, {
    id: doctor._id,
    _refresh: refreshKey, // changing this triggers re-fetch
  });

  // Build dayOfWeek → schedule map for O(1) lookup
  const schedules = data?.schedules || [];
  const scheduleMap = schedules.reduce((acc, s) => {
    acc[s.dayOfWeek] = s;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center
                    justify-center p-4"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg
                      max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4
                        border-b border-gray-100 flex-shrink-0"
        >
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              {doctor.name}
            </h2>
            {doctor.department && (
              <p className="text-xs text-gray-400 mt-0.5">
                {doctor.department}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
                       hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <RefreshCw size={16} className="text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading schedule...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {DAYS.map((day) => (
                <DayRow
                  key={day}
                  day={day}
                  schedule={scheduleMap[day]}
                  doctorId={doctor._id}
                  onRefresh={() => setRefreshKey((k) => k + 1)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400">
            Changes take effect immediately for new bookings
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleModal;
