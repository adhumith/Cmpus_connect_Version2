import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home, BookOpen, FileText, MessageCircle, Bell, Users, LogOut, GraduationCap
} from "lucide-react";

const navConfig = {
  student: [
    { to: "/student", label: "Home", icon: Home },
    { to: "/student/notes", label: "Notes", icon: BookOpen },
    { to: "/student/blogs", label: "Blogs", icon: FileText },
    { to: "/student/chat", label: "AI Assistant", icon: MessageCircle },
  ],
  staff: [
    { to: "/staff", label: "Home", icon: Home },
    { to: "/staff/notes", label: "Notes", icon: BookOpen },
    { to: "/staff/blogs", label: "Blogs", icon: FileText },
    { to: "/staff/chat", label: "AI Assistant", icon: MessageCircle },
    { to: "/staff/notifications", label: "Notifications", icon: Bell },
  ],
  admin: [
    { to: "/admin", label: "Home", icon: Home },
    { to: "/admin/users", label: "Manage Users", icon: Users },
    { to: "/admin/notes", label: "Notes", icon: BookOpen },
    { to: "/admin/blogs", label: "Blogs", icon: FileText },
    { to: "/admin/chat", label: "AI Assistant", icon: MessageCircle },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
  ],
};

export default function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[profile?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 border-r border-navy-700 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-navy-950" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-100 leading-tight">Campus</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split("/").length === 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-navy-800"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-navy-700">
          <div className="mb-3 px-1">
            <p className="text-sm font-medium text-slate-200 truncate">{profile?.name}</p>
            <p className="text-xs text-slate-500 capitalize font-mono">{profile?.role} · {profile?.dept}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-sm transition-colors w-full px-1 py-1">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}