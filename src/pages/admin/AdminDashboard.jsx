import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Stethoscope, Calendar,
  ClipboardList, RefreshCw, ArrowRight
} from "lucide-react";
import useFetch from "../../hooks/useFetch";
import { getUsersApi } from "../../api/userApi";
import { getAppointmentsApi } from "../../api/appointmentApi";
import { formatTime, getToday } from "../../utils/dateUtils";
import { STATUS_STYLES, STATUS_LABELS } from "../../utils/appointmentUtils";

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5
                  flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center
                     justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const today    = getToday();

  // Fetch users and today's appointments in parallel
  const { data: usersData,        loading: usersLoading }        = useFetch(getUsersApi, { limit: 100 });
  const { data: appointmentsData, loading: appointmentsLoading } = useFetch(getAppointmentsApi, { date: today, limit: 100 });

  const users        = usersData?.data        || [];
  const appointments = appointmentsData?.data  || [];

  // Derived stats
  const stats = useMemo(() => ({
    doctors:       users.filter((u) => u.role === "doctor").length,
    receptionists: users.filter((u) => u.role === "receptionist").length,
    todayTotal:    appointments.length,
    todayBooked:   appointments.filter((a) => a.status === "booked").length,
    todayArrived:  appointments.filter((a) => a.status === "arrived").length,
  }), [users, appointments]);

  const loading = usersLoading || appointmentsLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hospital overview for today
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center gap-3 py-8">
          <RefreshCw size={18} className="text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading stats...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Doctors"
            value={stats.doctors}
            icon={Stethoscope}
            color="bg-blue-500"
          />
          <StatCard
            label="Receptionists"
            value={stats.receptionists}
            icon={Users}
            color="bg-purple-500"
          />
          <StatCard
            label="Today's Appointments"
            value={stats.todayTotal}
            icon={Calendar}
            color="bg-green-500"
          />
          <StatCard
            label="Waiting / Booked"
            value={stats.todayBooked}
            icon={ClipboardList}
            color="bg-yellow-500"
          />
        </div>
      )}

      {/* ── Today's appointments ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Today's Appointments
          </h2>
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center gap-1.5 text-xs text-blue-600
                       hover:text-blue-700 font-medium"
          >
            View all
            <ArrowRight size={13} />
          </button>
        </div>

        {/* List */}
        {appointmentsLoading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <RefreshCw size={16} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        )}

        {!appointmentsLoading && appointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No appointments today</p>
          </div>
        )}

        {!appointmentsLoading && appointments.length > 0 && (
          <div className="divide-y divide-gray-50">
            {appointments.slice(0, 8).map((apt) => (
              <div
                key={apt._id}
                className="flex items-center gap-4 px-5 py-3
                           hover:bg-gray-50 transition-colors"
              >
                {/* Time */}
                <div className="w-16 flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">
                    {formatTime(apt.slotStart)}
                  </p>
                </div>

                {/* Patient */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {apt.patientId?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {apt.doctorId?.name}
                  </p>
                </div>

                {/* Status */}
                <span className={`text-xs px-2.5 py-1 rounded-full
                                  font-medium flex-shrink-0
                                  ${STATUS_STYLES[apt.status]}`}>
                  {STATUS_LABELS[apt.status]}
                </span>
              </div>
            ))}

            {/* If more than 8 */}
            {appointments.length > 8 && (
              <div className="px-5 py-3 text-center">
                <button
                  onClick={() => navigate("/appointments")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  +{appointments.length - 8} more → View all appointments
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center justify-between p-4 bg-white
                     rounded-xl border border-gray-200 hover:border-blue-300
                     hover:bg-blue-50 transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center
                            justify-center group-hover:bg-blue-200 transition-colors">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Manage Staff
              </p>
              <p className="text-xs text-gray-500">
                Add or deactivate doctors and receptionists
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-400
                                           group-hover:text-blue-600" />
        </button>

        <button
          onClick={() => navigate("/scheduler")}
          className="flex items-center justify-between p-4 bg-white
                     rounded-xl border border-gray-200 hover:border-green-300
                     hover:bg-green-50 transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center
                            justify-center group-hover:bg-green-200 transition-colors">
              <Calendar size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Book Appointment
              </p>
              <p className="text-xs text-gray-500">
                Schedule a new patient appointment
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-400
                                           group-hover:text-green-600" />
        </button>

      </div>

    </div>
  );
};

export default AdminDashboard;