import { useAuth } from "../../context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { RefreshCw, Users } from "lucide-react";

export default function AdminHome() {
  const { profile } = useAuth();

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => api.get("/admin/users").then(r => r.data),
  });

  const lifecycle = useMutation({
    mutationFn: () => api.post("/admin/semester-lifecycle"),
    onSuccess: (res) => toast.success(`Semester advanced! ${res.data.deleted_graduated} graduated, ${res.data.advanced} updated`),
    onError: () => toast.error("Failed"),
  });

  const counts = {
    students: users.filter(u => u.role === "student").length,
    staff: users.filter(u => u.role === "staff").length,
    admins: users.filter(u => u.role === "admin").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-100">
          Admin Dashboard — <span className="text-amber-400">{profile?.name}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">{profile?.position} · {profile?.dept}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([role, count]) => (
          <div key={role} className="card text-center">
            <p className="font-display text-4xl font-bold text-amber-400">{count}</p>
            <p className="text-slate-500 text-sm capitalize mt-1 font-mono">{role}</p>
          </div>
        ))}
      </div>

      <div className="card border-red-500/20 max-w-lg space-y-3">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <RefreshCw size={16} className="text-amber-400" />
          Semester Lifecycle
        </h3>
        <p className="text-sm text-slate-400">
          Advances all students by 1 semester. Students in semester 8 will be <span className="text-red-400 font-medium">permanently deleted</span>.
        </p>
        <button
          className="border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm transition-all"
          onClick={() => { if(window.confirm("⚠️ This will advance all semesters and delete graduated students. Are you sure?")) lifecycle.mutate(); }}
          disabled={lifecycle.isPending}
        >
          {lifecycle.isPending ? "Processing..." : "Run Semester Lifecycle"}
        </button>
      </div>
    </div>
  );
}