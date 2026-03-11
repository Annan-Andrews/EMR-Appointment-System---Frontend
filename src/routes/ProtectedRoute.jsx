import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ROLE_DASHBOARD = {
  superadmin: "/admin/dashboard",
  receptionist: "/scheduler",
  doctor: "/doctor/dashboard",
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent
                        rounded-full animate-spin"
        />
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
