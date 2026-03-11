import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setCredentials,
  clearCredentials,
  setLoading,
} from "./store/authSlice";
import { getMeApi } from "./api/authApi";
import useAuth from "./hooks/useAuth";

import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import Scheduler from "./pages/receptionist/Scheduler";
import Booking from "./pages/receptionist/Booking";
import Appointments from "./pages/receptionist/Appointments";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

const App = () => {
  const dispatch = useDispatch();
  const { token } = useAuth();

  // Rehydration — verify token on app load
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        dispatch(setLoading(false));
        return;
      }
      try {
        dispatch(setLoading(true));
        const res = await getMeApi();
        dispatch(
          setCredentials({
            user: res.data.data.user,
            accessToken: token,
          }),
        );
      } catch {
        dispatch(clearCredentials());
      } finally {
        dispatch(setLoading(false));
      }
    };
    verifyAuth();
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — all share Layout via Outlet */}
      <Route
        element={
          <ProtectedRoute>
            {" "}
            {/* checks logged in only */}
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* SuperAdmin only */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Receptionist + Admin */}
        <Route
          path="/scheduler"
          element={
            <ProtectedRoute allowedRoles={["receptionist", "superadmin"]}>
              <Scheduler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={["receptionist", "superadmin"]}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute
              allowedRoles={["receptionist", "superadmin", "doctor"]}
            >
              <Appointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
