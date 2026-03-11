import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../store/authSlice";
import { logoutApi } from "../api/authApi";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Hospital,
} from "lucide-react";

// ── Nav links per role ─────────────────────────────────────────────────────────
const NAV_LINKS = {
  superadmin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Scheduler", path: "/scheduler", icon: CalendarDays },
    { label: "Appointments", path: "/appointments", icon: ClipboardList },
  ],
  receptionist: [
    { label: "Scheduler", path: "/scheduler", icon: CalendarDays },
    { label: "Appointments", path: "/appointments", icon: ClipboardList },
  ],
  doctor: [
    { label: "My Appointments", path: "/doctor/dashboard", icon: Stethoscope },
  ],
};

// Role badge styles
const ROLE_STYLES = {
  superadmin: "bg-purple-100 text-purple-700",
  receptionist: "bg-green-100  text-green-700",
  doctor: "bg-blue-100   text-blue-700",
};

const ROLE_LABELS = {
  superadmin: "Super Admin",
  receptionist: "Receptionist",
  doctor: "Doctor",
};

// ── Component ──────────────────────────────────────────────────────────────────
const Layout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navLinks = NAV_LINKS[user?.role] || [];

  // User initials for avatar
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
      dispatch(clearCredentials());
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      // Even if API fails, clear local state and redirect
      dispatch(clearCredentials());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Mobile overlay ──────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
        flex flex-col z-30 transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400
                     hover:text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div
            className="w-9 h-9 bg-blue-600 rounded-lg flex items-center
                          justify-center shrink-0"
          >
            <Hospital size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">
              EMR System
            </h1>
            <p className="text-xs text-gray-400">Appointment Manager</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center
                            justify-center text-white text-sm font-bold shrink-0"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name}
              </p>
              <span
                className={`
                inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5
                ${ROLE_STYLES[user?.role]}
              `}
              >
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  font-medium transition-colors
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }
                `}
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                       text-sm font-medium text-red-600 hover:bg-red-50
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header
          className="bg-white border-b border-gray-200 px-4 py-3
                           flex items-center justify-between sticky top-0 z-10"
        >
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100
                       transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Spacer on desktop */}
          <div className="hidden lg:block" />

          {/* Right — user info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-700 leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[user?.role]}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center
                            justify-center text-white text-sm font-bold
                            shrink-0"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content — Outlet renders the child route here */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
