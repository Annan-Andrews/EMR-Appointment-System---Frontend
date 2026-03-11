import {
  Stethoscope,
  User,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

const ROLE_STYLES = {
  doctor: "bg-blue-100 text-blue-700",
  receptionist: "bg-green-100 text-green-700",
  superadmin: "bg-purple-100 text-purple-700",
};

const UserRow = ({
  user,
  actionLoading,
  onDeactivate,
  onReactivate,
  onSchedule,
}) => {
  const isLoading = actionLoading === user._id;
  const isSuperAdmin = user.role === "superadmin";

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4
                    px-5 py-4 hover:bg-gray-50 transition-colors items-center"
    >
      {/* Name + dept — col-span-3 */}
      <div className="md:col-span-3 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center
                         shrink-0
                         ${user.role === "doctor" ? "bg-blue-100" : "bg-green-100"}`}
        >
          {user.role === "doctor" ? (
            <Stethoscope size={15} className="text-blue-600" />
          ) : (
            <User size={15} className="text-green-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user.name}
          </p>
          {user.department && (
            <p className="text-xs text-gray-400 truncate">{user.department}</p>
          )}
        </div>
      </div>

      {/* Email — col-span-2 */}
      <div className="md:col-span-2">
        <p className="text-sm text-gray-600 truncate">{user.email}</p>
      </div>

      {/* Role — col-span-2 */}
      <div className="md:col-span-2">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium
                         ${ROLE_STYLES[user.role]}`}
        >
          {user.role}
        </span>
      </div>

      {/* Status — col-span-2 */}
      <div className="md:col-span-2">
        <span
          className={`flex items-center gap-1.5 text-xs font-medium
                         ${user.isActive ? "text-green-600" : "text-red-500"}`}
        >
          {user.isActive ? (
            <>
              <CheckCircle size={13} /> Active
            </>
          ) : (
            <>
              <XCircle size={13} /> Inactive
            </>
          )}
        </span>
      </div>

      {/* Actions — col-span-3 */}
      <div className="md:col-span-3 flex items-center justify-end gap-2">
        {/* Schedule button — doctors only, not superadmin */}
        {user.role === "doctor" && !isSuperAdmin && (
          <button
            onClick={() => onSchedule(user)}
            className="px-3 py-1.5 text-xs font-medium text-blue-600
                       border border-blue-200 rounded-lg hover:bg-blue-50
                       transition-colors flex items-center gap-1"
          >
            <Calendar size={12} />
            Schedule
          </button>
        )}

        {/* Deactivate / Reactivate / Loading / Owner */}
        {isLoading ? (
          <div
            className="w-5 h-5 border-2 border-gray-400
                          border-t-transparent rounded-full animate-spin"
          />
        ) : isSuperAdmin ? (
          <span className="text-xs text-gray-300 italic">owner</span>
        ) : user.isActive ? (
          <button
            onClick={() => onDeactivate(user)}
            className="px-3 py-1.5 text-xs font-medium text-red-600
                       border border-red-200 rounded-lg hover:bg-red-50
                       transition-colors"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => onReactivate(user)}
            className="px-3 py-1.5 text-xs font-medium text-green-600
                       border border-green-200 rounded-lg hover:bg-green-50
                       transition-colors"
          >
            Reactivate
          </button>
        )}
      </div>
    </div>
  );
};

export default UserRow;
