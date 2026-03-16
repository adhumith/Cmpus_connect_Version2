import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Bell, Hash, BookOpen, Users } from "lucide-react";

export default function StudentHome() {
  const { profile } = useAuth();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications/my").then(r => r.data),
  });

  const stats = [
    { label: "Department", value: profile?.dept, icon: BookOpen },
    { label: "Roll No", value: profile?.roll_no, icon: Hash },
    { label: "Semester", value: `Sem ${profile?.semester}`, icon: Users },
    { label: "Class", value: profile?.class_name, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-100">
          Welcome back, <span className="text-amber-400">{profile?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening on campus today</p>
      </div>

      {/* Profile stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono">{label}</p>
              <p className="text-sm font-semibold text-slate-100">{value || "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notice board */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-amber-400" />
          <h2 className="font-display text-xl font-semibold text-slate-100">Notice Board</h2>
          <span className="badge border-amber-500/30 text-amber-400 bg-amber-500/10">{notifications.length}</span>
        </div>
        <div className="space-y-3">
          {notifications.length === 0 && (
            <div className="card text-slate-500 text-sm text-center py-10">No notices yet</div>
          )}
          {notifications.map((n) => (
            <div key={n._id} className="card hover:border-amber-500/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-100 text-sm">{n.title}</p>
                  <p className="text-slate-400 text-sm mt-1">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-2 font-mono">By {n.sender_name}</p>
                </div>
                <span className="text-xs text-slate-600 font-mono whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}