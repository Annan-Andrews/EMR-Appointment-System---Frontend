import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import { getDoctorsApi } from "../../api/userApi";
import {
  getAppointmentsApi,
  markArrivedApi,
  deleteAppointmentApi,
} from "../../api/appointmentApi";
import { formatDate, formatTime, getToday } from "../../utils/dateUtils";
import { STATUS_STYLES, STATUS_LABELS } from "../../utils/appointmentUtils";

// ── Confirm modal — simple inline component ────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
      <p className="text-sm font-medium text-gray-800 mb-1">Are you sure?</p>
      <p className="text-sm text-gray-500 mb-5">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 rounded-lg text-sm
                     font-medium text-gray-700 hover:bg-gray-50"
        >
          No, go back
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white
                     rounded-lg text-sm font-medium"
        >
          Yes, confirm
        </button>
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === "doctor";

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    date: getToday(),
    status: "",
    doctorId: "",
  });

  // ── Appointments fetch ────────────────────────────────────────────────────
  // Key trick: passing filters directly to useFetch
  // When filters change → useFetch re-fetches automatically
  const { data, loading, error } = useFetch(getAppointmentsApi, {
    ...filters,
    limit: 50,
  });

  const appointments = data?.data || [];

  // ── Doctors list for filter dropdown (not needed for doctor role) ─────────
  const { data: doctorsData } = useFetch(isDoctor ? null : getDoctorsApi);
  const doctors = doctorsData?.doctors || [];

  // ── Action state ──────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(null); // stores appointment._id
  const [confirmModal, setConfirmModal] = useState(null); // { type, appointmentId }

  // ── Mark arrived ─────────────────────────────────────────────────────────
  const handleMarkArrived = async (appointmentId) => {
    setActionLoading(appointmentId);
    try {
      await markArrivedApi(appointmentId);
      toast.success("Patient marked as arrived");
      // Force re-fetch by updating filters reference
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Cancel appointment ────────────────────────────────────────────────────
  const handleCancel = async (appointmentId) => {
    setConfirmModal(null);
    setActionLoading(appointmentId);
    try {
      await deleteAppointmentApi(appointmentId);
      toast.success("Appointment cancelled");
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter change ─────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Confirm modal */}
      {confirmModal && (
        <ConfirmModal
          message="This will cancel the appointment and free the slot."
          onConfirm={() => handleCancel(confirmModal.appointmentId)}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isDoctor
              ? "Your scheduled appointments"
              : "Manage all appointments"}
          </p>
        </div>

        {/* Book new — receptionist + admin only */}
        {!isDoctor && (
          <button
            onClick={() => navigate("/scheduler")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600
                       hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            <Calendar size={15} />
            Book New
          </button>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Filters
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Date filter */}
          <div className="flex-1 min-w-36">
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex-1 min-w-36">
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         text-sm bg-white focus:outline-none focus:ring-2
                         focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              <option value="booked">Booked</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Doctor filter — hidden for doctor role */}
          {!isDoctor && (
            <div className="flex-1 min-w-36">
              <label className="block text-xs text-gray-500 mb-1">Doctor</label>
              <select
                value={filters.doctorId}
                onChange={(e) => handleFilterChange("doctorId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           text-sm bg-white focus:outline-none focus:ring-2
                           focus:ring-blue-500"
              >
                <option value="">All doctors</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ date: "", status: "", doctorId: "" })}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700
                         border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Appointments list ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <RefreshCw size={18} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading appointments...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">Failed to load appointments</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">
              No appointments found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try changing the filters
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && appointments.length > 0 && (
          <div className="divide-y divide-gray-100">
            {/* Table header */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-4 py-3
                            bg-gray-50 text-xs font-semibold text-gray-500
                            uppercase tracking-wide"
            >
              <div className="col-span-1">Time</div>
              <div className="col-span-3">Patient</div>
              <div className="col-span-2">Doctor</div>
              <div className="col-span-2">Purpose</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {appointments.map((apt) => (
              <AppointmentRow
                key={apt._id}
                appointment={apt}
                isDoctor={isDoctor}
                actionLoading={actionLoading}
                onMarkArrived={handleMarkArrived}
                onCancel={(id) => setConfirmModal({ appointmentId: id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      {!loading && appointments.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {appointments.length} appointment
          {appointments.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

// ── Appointment row ────────────────────────────────────────────────────────────
const AppointmentRow = ({
  appointment: apt,
  isDoctor,
  actionLoading,
  onMarkArrived,
  onCancel,
}) => {
  const isLoading = actionLoading === apt._id;
  const canArrive = apt.status === "booked" && !isDoctor;
  const canCancel =
    !["cancelled", "completed"].includes(apt.status) && !isDoctor;

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4
                    px-4 py-4 hover:bg-gray-50 transition-colors items-center"
    >
      {/* Time */}
      <div className="md:col-span-1">
        <p className="text-sm font-bold text-gray-800">
          {formatTime(apt.slotStart)}
        </p>
        <p className="text-xs text-gray-400">{formatTime(apt.slotEnd)}</p>
      </div>

      {/* Patient */}
      <div className="md:col-span-3 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full bg-blue-100 flex items-center
                        justify-center flex-shrink-0"
        >
          <User size={14} className="text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {apt.patientId?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-400">
            {apt.patientId?.patientId}
            {apt.patientId?.mobile && ` · ${apt.patientId.mobile}`}
          </p>
        </div>
      </div>

      {/* Doctor */}
      <div className="md:col-span-2">
        <p className="text-sm text-gray-700 truncate">{apt.doctorId?.name}</p>
        <p className="text-xs text-gray-400 truncate">
          {apt.doctorId?.department}
        </p>
      </div>

      {/* Purpose */}
      <div className="md:col-span-2">
        <p className="text-xs text-gray-500 truncate">{apt.purpose || "—"}</p>
      </div>

      {/* Status */}
      <div className="md:col-span-1">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium
                         ${STATUS_STYLES[apt.status]}`}
        >
          {STATUS_LABELS[apt.status]}
        </span>
      </div>

      {/* Actions */}
      <div className="md:col-span-3 flex items-center justify-end gap-2">
        {isLoading ? (
          <div
            className="w-5 h-5 border-2 border-blue-500
                          border-t-transparent rounded-full animate-spin"
          />
        ) : (
          <>
            {canArrive && (
              <button
                onClick={() => onMarkArrived(apt._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50
                           hover:bg-yellow-100 text-yellow-700 border border-yellow-200
                           rounded-lg text-xs font-medium transition-colors"
              >
                <CheckCircle size={13} />
                Arrived
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(apt._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50
                           hover:bg-red-100 text-red-600 border border-red-200
                           rounded-lg text-xs font-medium transition-colors"
              >
                <XCircle size={13} />
                Cancel
              </button>
            )}
            {isDoctor && (
              <span className="text-xs text-gray-400 italic">View only</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;
  