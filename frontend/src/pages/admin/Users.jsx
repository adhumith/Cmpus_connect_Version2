import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

const ROLES = ["student", "staff", "admin"];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("student");
  const [form, setForm] = useState({
    name: "", email: "", password: "", roll_no: "", dept: "", semester: 1, class_name: "", position: ""
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users", tab],
    queryFn: () => api.get("/admin/users", { params: { role: tab } }).then(r => r.data),
  });

  const addUser = useMutation({
    mutationFn: (data) => {
      const ep = tab === "student" ? "add-student" : tab === "staff" ? "add-staff" : "add-admin";
      return api.post(`/admin/${ep}`, data);
    },
    onSuccess: () => { qc.invalidateQueries(["users"]); setForm({ name: "", email: "", password: "", roll_no: "", dept: "", semester: 1, class_name: "", position: "" }); toast.success("User added!"); },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const handleAdd = () => {
    if (window.confirm(`Add this ${tab}?`)) addUser.mutate({ ...form, semester: Number(form.semester) });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-slate-100">Manage Users</h1>

      {/* Tab */}
      <div className="flex gap-2">
        {ROLES.map(r => (
          <button key={r} onClick={() => setTab(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${tab === r ? "bg-amber-500 text-navy-950" : "text-slate-400 border border-navy-600 hover:text-slate-200"}`}>
            {r}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="card border-amber-500/20 space-y-4">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2"><UserPlus size={16} className="text-amber-400" /> Add {tab}</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <input className="input" placeholder="Department" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} />
          {tab === "student" && <>
            <input className="input" placeholder="Roll Number" value={form.roll_no} onChange={e => setForm({...form, roll_no: e.target.value})} />
            <input className="input" type="number" placeholder="Semester" min={1} max={8} value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} />
            <input className="input" placeholder="Class (e.g. A)" value={form.class_name} onChange={e => setForm({...form, class_name: e.target.value})} />
          </>}
          {(tab === "staff" || tab === "admin") && (
            <input className="input" placeholder="Position (e.g. Professor)" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
          )}
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleAdd} disabled={addUser.isPending}>
          <UserPlus size={14} />
          {addUser.isPending ? "Adding..." : `Add ${tab}`}
        </button>
      </div>

      {/* User list */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{users.length} {tab}s</p>
        {users.map((u, i) => (
          <div key={i} className="card flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-100">{u.name}</p>
              <p className="text-xs text-slate-500 font-mono">{u.email} · {u.dept}</p>
            </div>
            <div className="text-xs text-slate-500 font-mono text-right">
              {tab === "student" && <><p>{u.roll_no}</p><p>Sem {u.semester} · {u.class_name}</p></>}
              {(tab === "staff" || tab === "admin") && <p>{u.position}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}