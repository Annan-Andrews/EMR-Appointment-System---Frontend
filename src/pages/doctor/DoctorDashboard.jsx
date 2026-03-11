import { useState, useMemo } from "react";
import { Calendar, Clock, User, RefreshCw } from "lucide-react";
import { getAppointmentsApi } from "../../api/appointmentApi";
import useFetch from "../../hooks/useFetch";
import useAuth from "../../hooks/useAuth";
import { formatDate, formatTime, getToday } from "../../utils/dateUtils";
import { STATUS_STYLES, STATUS_LABELS } from "../../utils/appointmentUtils";

// ── Filter tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "today",    label: "Today"    },
  { key: "upcoming", label: "Upcoming" },
  { key: "all",      label: "All"      },
];

const DoctorDashboard = () => {
  const { user }            = useAuth();
  const [activeTab, setActiveTab] = useState("today");

  // Fetch ALL appointments for this doctor
  // Backend already filters to only their own (ROLES.DOCTOR check)
  const { data, loading, error } = useFetch(getAppointmentsApi, {
    limit: 100, // get enough to filter client-side
  });

  const appointments = data?.data || [];
  const today        = getToday();

  // Filter appointments based on active tab
  // useMemo so it doesn't recalculate on every render
  const filtered = useMemo(() => {
    switch (activeTab) {
      case "today":
        return appointments.filter((a) => a.slotDate === today);
      case "upcoming":
        return appointments.filter((a) => a.slotDate >= today && a.status === "booked");
      case "all":
      default:
        return appointments;
    }
  }, [appointments, activeTab, today]);

  // Stats for the summary cards
  const stats = useMemo(() => ({
    todayTotal:   appointments.filter((a) => a.slotDate === today).length,
    todayArrived: appointments.filter((a) => a.slotDate === today && a.status === "arrived").length,
    upcoming:     appointments.filter((a) => a.slotDate > today && a.status === "booked").length,
  }), [appointments, today]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          My Appointments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome, {user?.name} · {formatDate(today)}
        </p>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.todayTotal}</p>
            <p className="text-xs text-gray-500">Today's appointments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <User size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.todayArrived}</p>
            <p className="text-xs text-gray-500">Patients arrived</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.upcoming}</p>
            <p className="text-xs text-gray-500">Upcoming bookings</p>
          </div>
        </div>

      </div>

      {/* ── Appointment list ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200">

        {/* Tabs + refresh */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-gray-100">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.key
                    ? "text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {tab.label}
                {/* Count badge */}
                {tab.key === "today" && stats.todayTotal > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs
                                   px-1.5 py-0.5 rounded-full">
                    {stats.todayTotal}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List body */}
        <div className="divide-y divide-gray-50">

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw size={18} className="text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading appointments...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-sm text-red-500">Failed to load appointments</p>
              <p className="text-xs text-gray-400 mt-1">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16">
              <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No appointments {activeTab === "today" ? "today" : "found"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeTab === "today"
                  ? "Enjoy your free day!"
                  : "Try switching to a different tab"
                }
              </p>
            </div>
          )}

          {/* Appointment rows */}
          {!loading && !error && filtered.map((apt) => (
            <AppointmentRow key={apt._id} appointment={apt} />
          ))}

        </div>
      </div>
    </div>
  );
};

// ── Appointment row component ──────────────────────────────────────────────────
// Extracted as separate component — keeps the list clean and readable
const AppointmentRow = ({ appointment: apt }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">

      {/* Time */}
      <div className="w-20 flex-shrink-0 text-center">
        <p className="text-sm font-bold text-gray-800">
          {formatTime(apt.slotStart)}
        </p>
        <p className="text-xs text-gray-400">
          {formatTime(apt.slotEnd)}
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-gray-200 shrink-0" />

      {/* Patient info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {apt.patientId?.name || "Unknown Patient"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-400">
            {apt.patientId?.patientId}
          </p>
          {apt.patientId?.mobile && (
            <>
              <span className="text-gray-200">·</span>
              <p className="text-xs text-gray-400">
                {apt.patientId.mobile}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Date — only show in "all" tab since it's mixed dates */}
      <div className="hidden sm:block text-right shrink-0">
        <p className="text-xs text-gray-500">{formatDate(apt.slotDate)}</p>
      </div>

      {/* Purpose */}
      {apt.purpose && (
        <div className="hidden md:block max-w-32 shrink-0">
          <p className="text-xs text-gray-500 truncate">{apt.purpose}</p>
        </div>
      )}

      {/* Status badge */}
      <span className={`
        shrink-0 text-xs px-2.5 py-1 rounded-full font-medium
        ${STATUS_STYLES[apt.status]}
      `}>
        {STATUS_LABELS[apt.status]}
      </span>

    </div>
  );
};

export default DoctorDashboard;