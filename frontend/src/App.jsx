import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";

// Student pages
import StudentHome from "./pages/student/Home";
import StudentNotes from "./pages/student/Notes";
import StudentBlogs from "./pages/student/Blogs";
import StudentChat from "./pages/student/Chat";

// Staff pages
import StaffHome from "./pages/staff/Home";
import StaffNotes from "./pages/staff/Notes";
import StaffChat from "./pages/staff/Chat";
import StaffNotifications from "./pages/staff/Notifications";

// Admin pages
import AdminHome from "./pages/admin/Home";
import AdminUsers from "./pages/admin/Users";

function Loading() {
  return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div
        className="text-amber-400 text-xl animate-pulse"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Loading...
      </div>
    </div>
  );
}

function RoleRedirect() {
  const { profile, loading, user } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  if (!profile || !profile.role) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center flex-col gap-3">
      <div className="text-red-400 text-sm">Profile error: {JSON.stringify(profile)}</div>
      <div className="text-slate-500 text-xs">Check your backend logs</div>
    </div>
  );

  if (profile.role === "student") return <Navigate to="/student" replace />;
  if (profile.role === "staff")   return <Navigate to="/staff"   replace />;
  if (profile.role === "admin")   return <Navigate to="/admin"   replace />;

  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children, roles }) {
  const { profile, loading, user } = useAuth();

  if (loading) return <Loading />;

  if (!user)    return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(profile.role)) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index        element={<StudentHome />} />
        <Route path="notes" element={<StudentNotes />} />
        <Route path="blogs" element={<StudentBlogs />} />
        <Route path="chat"  element={<StudentChat />} />
      </Route>

      {/* Staff */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["staff"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index                 element={<StaffHome />} />
        <Route path="notes"          element={<StaffNotes />} />
        <Route path="blogs"          element={<StudentBlogs />} />
        <Route path="chat"           element={<StaffChat />} />
        <Route path="notifications"  element={<StaffNotifications />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index                element={<AdminHome />} />
        <Route path="users"         element={<AdminUsers />} />
        <Route path="notes"         element={<StaffNotes />} />
        <Route path="blogs"         element={<StudentBlogs />} />
        <Route path="chat"          element={<StaffChat />} />
        <Route path="notifications" element={<StaffNotifications />} />
      </Route>

      {/* Default */}
      <Route path="/"  element={<RoleRedirect />} />
      <Route path="*"  element={<RoleRedirect />} />
    </Routes>
  );
}