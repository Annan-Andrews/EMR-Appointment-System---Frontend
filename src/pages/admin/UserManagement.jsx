import { useState } from "react";
import { UserPlus, Search, User, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import useFetch from "../../hooks/useFetch";
import { getUsersApi, deleteUserApi, updateUserApi } from "../../api/userApi";
import CreateUserModal from "../../components/users/CreateUserModal";
import ConfirmActionModal from "../../components/users/ConfirmActionModal";
import UserRow from "../../components/users/UserRow";
import DoctorScheduleModal from "../../components/users/DoctorScheduleModal";

const UserManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  // confirmAction shape:
  // { type: "deactivate" | "reactivate", user: {...} }

  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const { data, loading, error } = useFetch(getUsersApi, {
    limit: 100,
    _refresh: refreshKey,
  });

  const allUsers = data?.data || [];

  // Client side search
  const users = allUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const handleDeactivate = async () => {
    const userId = confirmAction.user._id;
    setConfirmAction(null);
    setActionLoading(userId);
    try {
      await deleteUserApi(userId);
      toast.success("User deactivated");
      triggerRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reactivate ─────────────────────────────────────────────────────────────
  const handleReactivate = async () => {
    const userId = confirmAction.user._id;
    setConfirmAction(null);
    setActionLoading(userId);
    try {
      await updateUserApi(userId, { isActive: true });
      toast.success("User reactivated");
      triggerRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reactivate");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = () => {
    if (confirmAction.type === "deactivate") handleDeactivate();
    else handleReactivate();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={triggerRefresh}
        />
      )}

      {scheduleDoctor && (
        <DoctorScheduleModal
          doctor={scheduleDoctor}
          onClose={() => setScheduleDoctor(null)}
        />
      )}

      {confirmAction && (
        <ConfirmActionModal
          title={
            confirmAction.type === "deactivate"
              ? `Deactivate ${confirmAction.user.name}?`
              : `Reactivate ${confirmAction.user.name}?`
          }
          message={
            confirmAction.type === "deactivate"
              ? "They will lose access to the system immediately."
              : "They will regain full access to the system."
          }
          confirmLabel={
            confirmAction.type === "deactivate" ? "Deactivate" : "Reactivate"
          }
          confirmStyle={confirmAction.type === "deactivate" ? "red" : "green"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage doctors and receptionists
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600
                     hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          <UserPlus size={15} />
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2
                                     -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <RefreshCw size={18} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading staff...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">Failed to load users</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center py-16">
            <User size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {searchQuery ? "No users match your search" : "No staff found"}
            </p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <>
            {/* Table header */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-5 py-3
                            bg-gray-50 border-b border-gray-100 text-xs
                            font-semibold text-gray-500 uppercase tracking-wide"
            >
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  actionLoading={actionLoading}
                  onDeactivate={(u) =>
                    setConfirmAction({ type: "deactivate", user: u })
                  }
                  onReactivate={(u) =>
                    setConfirmAction({ type: "reactivate", user: u })
                  }
                  onSchedule={(u) => setScheduleDoctor(u)} // ← add this
                />
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && users.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {users.length} staff member{users.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default UserManagement;
